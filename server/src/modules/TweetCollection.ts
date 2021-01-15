import { EventEmitter } from 'events';
import express, { Response, Request } from 'express';
import schedule, { Job } from 'node-schedule';
import moment from 'moment-timezone';
import * as _ from 'lodash';
import Router, { Module } from '../app/Router';
import TwitterApi from './TwitterApi';
import User from './User';
import Config from '../app/Config';
import WordCloud from './WordCloud';
import { ITweet, ITweetCollection, IGeoPoint, ISearchParams, IShare } from '@twitter-tracker/shared';
import GeoMap from './GeoMap';
import Timeline from './Timeline';
@Module
export default class TweetCollection {
    private _name: string;
    private _tweets: Map<string, ITweet> = new Map();
    private _stream?: EventEmitter;
    private _user?: User;
    private _size: number;
    private cache: ITweet[] = [];
    private dirty: boolean = true;
    private _share?: IShare;
    private streamParams?: ISearchParams;
    private tweetBufferCount: number = 0;
    private jobs: Job[] = [];

    private static tweetCollections: Map<string, TweetCollection> = new Map();

    private constructor(data: ITweetCollection, user?: User) {
        this._name = data.name;
        if (data.tweets)
            this.tweets = data.tweets;
        if (user)
            this._user = user;
        this.syncCache();
        this._size = this.cache.length;
    }

    private get id() {
        return `${this.user!.username}.${this.name}`;
    }

    private get tweets(): ITweet[] {
        if (this.dirty)
            this.syncCache();
        return this.cache;
    }

    private set tweets(tweets: ITweet[]) {
        this._tweets = new Map();
        for (const tweet of tweets)
            this._tweets.set(tweet.id_str, tweet);
    }

    private syncCache() {
        this.cache = Array.from(this._tweets, ([key, value]) => value);
        this.dirty = false;
    }

    private get name(): string {
        return this._name;
    }

    private get user(): User | undefined {
        return this._user;
    }

    private get size(): number {
        return this._size;
    }

    private get info(): ITweetCollection {
        return {
            name: this.name,
            size: this.size,
            stream: this.streamParams,
            share: this._share
        }
    }

    private get data(): ITweetCollection {
        return {
            name: this.name,
            tweets: this.tweets,
            size: this.size,
            stream: this.streamParams,
            share: this._share
        };
    }

    private set data(data: ITweetCollection) {
        this._name = data.name;
        if (data.tweets)
            this.tweets = data.tweets;
    }

    private get stream(): EventEmitter | undefined {
        return this._stream;
    }

    private set stream(stream: EventEmitter | undefined) {
        this._stream = stream;
    }

    private static isActive(name: string): boolean {
        return TweetCollection.tweetCollections.has(name);
    }

    private static getByNameAndUser(name: string, user: User): TweetCollection | null {
        const id = `${user.username}.${name}`;
        const data = user.loadTweetCollection(name);
        if (TweetCollection.isActive(id)){
            return TweetCollection.tweetCollections.get(id)!;
        }
        else if (data)
            return new TweetCollection(data, user);
        else return null;
    }

    private hasStream(): boolean {
        return !!this.stream;
    }

    private addTweet(tweet: ITweet) {
        this._tweets.set(tweet.id_str, tweet);
        this.dirty = true;
        this.tweetBufferCount++;
        this._size++;
        if (this.tweetBufferCount >= Config.tweetBufferSize) {
            this.user!.storeTweetCollection(this.name, this.data);
            this.tweetBufferCount = 0;
        }
    }

    private addTweets(tweets: ITweet[]) {
        for (const tweet of tweets)
            this.addTweet(tweet);
    }

    private static isTweet(data: any): boolean {
        return _.conformsTo(data, { id_str: _.isString, text: _.isString });
    }

    private streamDataHandler(data: any) {
        if (TweetCollection.isTweet(data))
            this.addTweet(data);
    }

    private resetStream() {
        if (this.hasStream()) {
            this.closeStream();
            this.openStream();
        }
    }

    private startStream() {
        this.tweetBufferCount = 0;
        this.stream!.on('data', (data) => this.streamDataHandler(data));
        this.stream!.on('error', (err) => {
            console.log(err);
            setTimeout(() => this.resetStream(), 10000);
        });
    }

    private stopStream() {
        this.user!.storeTweetCollection(this.name, this.data);
        this.stream!.removeAllListeners();
    }

    private async openStream() {
        const params = this.streamParams!;
        const stream = await TwitterApi.getFilteredStream(params, this.user?.twitterClient);
        if (stream)
            this.stream = stream;
        else throw new Error();
        const since = moment(params.since);
        const until = moment(params.until);
        const now = moment();
        if ((!params.since || since.isSameOrBefore(now)) && (!params.until || until.isAfter(now)))
            this.startStream();
        else if (params.since && since.isAfter(now))
            schedule.scheduleJob(`${this.user}.${this.name}:start`, since.toDate(), () => this.startStream());
        if (params.until && until.isAfter(now))
            schedule.scheduleJob(`${this.user}.${this.name}:end`, until.toDate(), () => this.stopStream());
        TweetCollection.tweetCollections.set(this.id, this);
    }

    private closeStream() {
        if (this.hasStream()) {
            this.stopStream();
            this.cancelAllJobs();
            delete this.share;
            delete this.stream;
            TweetCollection.tweetCollections.delete(this.id);
        }
    }

    private scheduleJob(name: string, date: Date, callback: () => void) {
        schedule.scheduleJob(`${this.user}.${this.name}:${name}`, date, callback);
    }

    private cancelAllJobs(name?: string) {
        this.jobs.filter(job => !name || job.name.includes(name)).forEach(job => job.cancel());
    }

    private empty(): boolean {
        return this.tweets.length === 0;
    }

    private getRawTweetString(): string {
        let raw = this.tweets.slice(0, Config.maxTweetsForWordCloud).map(t => t.text).join(' ');
        for (const word of Config.tagBlacklist)
            raw = raw.replace(new RegExp(word, 'g'), '');
        return raw;
    }

    private async getWordCloud(): Promise<string | null> {
        if (this.empty())
            return null;
        const raw: string = this.getRawTweetString();
        return await WordCloud.generateWordCloud(raw);
    }

    private getGeolocatedTweets(): any {
        return this.tweets.filter((tweet: ITweet) => tweet.place);
    }

    private getTweetCenter(boundingBox: any): IGeoPoint {
        const point = boundingBox;
        const length = 4;
        const lon = (point[0][0] + point[1][0] + point[2][0] + point[3][0]) / length;
        const lat = (point[0][1] + point[1][1] + point[2][1] + point[3][1]) / length;
        const coordinates: IGeoPoint = { lat, lon };
        return coordinates;
    }

    private getMarkers(): any {
        const geolocatedTweets = this.getGeolocatedTweets();
        const markersArray: any[] = [];
        geolocatedTweets.forEach((tweet: any) => {
            const boundingBox = tweet.place.bounding_box.coordinates[0];
            const coordinates = this.getTweetCenter(boundingBox);
            const marker: IGeoPoint = coordinates;
            markersArray.push(marker);
        });
        return markersArray;
    }

    private async getMap(): Promise<string | null> {
        const markers = this.getMarkers();
        if(markers.length === 0)
            return null;
        return await GeoMap.getMapImage(markers);
    }

    private async getTimeline(): Promise<string | null> {
        if (this.empty())
            return null;
        return await Timeline.getTimelineImage(this.tweets);
    }

    public static setRoutes(router: express.Router) {
        router.get('/tweet-collections', Router.auth , (req: Request, res: Response) => {
            const user = req.user;
            const list = user.getTweetCollections();
            res.send(list);
        });

        router.put('/tweet-collections/:name', Router.auth, async (req: Request, res: Response) => {
            const name: string = req.params.name;
            const user: User = req.user;
            const data: ITweetCollection = req.body;
            user.storeTweetCollection(name, data);
            const tweetCollection = TweetCollection.getByNameAndUser(name, user) || new TweetCollection(data, user);
            tweetCollection.data = data;
            try {
                if(!_.isEqual(data.stream, tweetCollection.streamParams) || !_.isEqual(data.share, tweetCollection.share)){
                    if (data.stream) {
                        tweetCollection.closeStream();
                        tweetCollection.streamParams = data.stream;
                        await tweetCollection.openStream();
                    }
                    if (data.share) {
                        tweetCollection.share = data.share;
                        if (!data.stream)
                            return res.status(400).send({ error: 'Cannot setup share on social without a stream' });
                    }
                }
                res.send(tweetCollection.info);
            } catch (err) {
                console.log(err);
                res.status(500).send({ error: err });
            }
        });

        router.post('/tweet-collections/:name/tweets', Router.auth, (req: Request, res: Response) => {
            const name: string = req.params.name;
            const user = req.user;
            const tweetCollection = TweetCollection.getByNameAndUser(name, user);
            if (!tweetCollection)
                return res.status(404).send({ error: 'Tweet collection not found' });
            if (!_.isArray(req.body))
                return res.status(400).send({ error: 'Request body must be an array' });
            const tweets = req.body.filter((t: any) => TweetCollection.isTweet(t));
            tweetCollection.addTweets(tweets);
            user.storeTweetCollection(tweetCollection.name, tweetCollection.data);
            res.send(tweetCollection.info)
        });

        router.get('/tweet-collections/:name/tweets', Router.auth, (req: Request, res: Response) => {
            const name: string = req.params.name;
            const user = req.user;
            const tweetCollection = TweetCollection.getByNameAndUser(name, user);
            if (!tweetCollection)
                return res.status(404).send({ error: 'Tweet collection not found' });
            const from = parseInt(req.query.from as string) || undefined;
            const to = parseInt(req.query.to as string) || undefined;
            res.send(tweetCollection.tweets.slice(from, to));
        })

        router.get('/tweet-collections/:name', Router.auth, (req: Request, res: Response) => {
            const name: string = req.params.name;
            const user = req.user;
            const tweetCollection = TweetCollection.getByNameAndUser(name, user);
            if (tweetCollection)
                res.send(tweetCollection.info);
            else
                res.status(404).send({ error: 'Tweet collection not found' });
        });

        router.delete('/tweet-collections/:name', Router.auth, async (req: Request, res: Response) => {
            const name = req.params.name;
            const user = req.user;
            const tweetCollection = TweetCollection.getByNameAndUser(name, user);
            if (!tweetCollection)
                res.status(404).send({ error: 'Tweet collection not found' });
            const info = tweetCollection!.info;
            tweetCollection!.closeStream();
            user.deleteTweetCollection(name);
            res.send(info);
        });
    }

    private async shareOnTwitter(tweet: string, objects: { wordCloud?: boolean, map?: boolean, timeline?: boolean }) {
        if (this.empty())
            return;
        const images = [];
        if (objects.wordCloud) {
            const wordCloud = await this.getWordCloud();
            if (wordCloud)
                images.push(wordCloud);
        }
        if (objects.map) {
            const map = await this.getMap();
            if (map)
                images.push(map);
        }
        if (objects.timeline) {
            const timeline = await this.getTimeline();
            if (timeline)
                images.push(timeline);
        }
        await this.user!.tweetImages(tweet + ' ' + moment().format('DD/MM/YYYY HH:mm'), images);
    }

    private get share(): IShare | undefined {
        return this._share;
    }

    private set share(share: IShare | undefined) {
        if (!share)
            return;
        if (this.hasStream()) {
            this._share = share;
            if (share.platforms.twitter) {
                this.cancelAllJobs('twitter');
                share.schedule?.forEach((date: Date, index: number) =>
                    this.scheduleJob('twitter' + index, new Date(date), () => this.shareOnTwitter(share.message, share.objects)));
            }
        }
    }
}