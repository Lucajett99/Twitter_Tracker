import { EventEmitter } from 'events';
import FileSaver from 'file-saver';
// @ts-ignore
import * as wf from 'word-freq';
import * as _ from 'lodash';
import { ISearchParams, IShare, ITweetCollection } from '@twitter-tracker/shared';
import Api from './Api';
import Config from './Config';

/**
 * Class which encapsulates a collection of tweets, where tweets can be added, loaded and removed.
 * It also provides a function to save the json file containing tweets.
 */
export default class TweetCollection {
    private name: string;
    private tweets: any;
    private _stream: any;
    private _share: any;

    /**
     * Instantiates a tweet collection with an empty set of tweets
     * @param name The name of the collection (default: 'myCollection')
     */
    constructor(data: ITweetCollection) {
        if (!data.name)
            throw new Error('Name cannot be empty');
        this.name = data.name;
        this.tweets = {};
        this.stream = data.stream;
        this.share = data.share
    }

    /**
     * Static class metod which returns an instance of TweetCollection containing the given data
     * @param blob Blob-type data containing the JSON representation of tweet collection
     * @param name Name of the collection (default: 'myCollection')
     * @returns The loaded and newly-instantiated tweet collection asynchrnously
     */
    public static async load(blob: Blob, name: string = 'myCollection'): Promise<TweetCollection> {
        const fileReader: FileReader = new FileReader();
        return new Promise((resolve, reject) => {
            fileReader.onload = (event) => {
                const json: string = event.target.result as string;
                const tweets = JSON.parse(json);
                const collection = new TweetCollection({ name });
                collection.add(tweets);
                resolve(collection);
            };
            fileReader.readAsText(blob);
        });
    }

    /**
     * Changes the collection name
     * @param name New name
     */
    public setName(name: string): void {
        if (!name)
            throw new Error('Name cannot be empty');
        this.name = name;
    }

    public getName(): string{
        return this.name;
    }
    /**
     * Adds tweets to the collection
     * @param tweets Array of tweets
     */
    public add(tweets: any | any[]): void {
        if (!Array.isArray(tweets))
            tweets = [ tweets ];
        tweets = tweets.reverse();
        for (const tweet of tweets)
            this.tweets[""+tweet.id] = tweet;
    }

    /**
     * Removes tweet(s) with given id(s)
     * @param ids The id(s) of the tweets to be removed
     */
    public remove(...ids: string[]): void {
        for (const id of ids)
            if (this.tweets[id])
                delete this.tweets[id];
    }

    public clear() {
        this.tweets = {};
    }

    /**
     * Returns an array with all the tweets in the collection
     * @returns Array of tweets
     */
    public getTweets(): any[] {
        return Object.values(this.tweets);
    }

    /**
     * Returns a JSON string containing tweets
     * @returns String with JSON
     */
    public getJson(): string {
        const data = this.getTweets();
        return JSON.stringify(data);
    }

    /**
     * Returns information about the top most frequent words in the collection
     * @param limit The quantity of needed most-frequent words (default: 20)
     * @param minWordLength The minimum length of the words to be taken into account (default: 5)
     * @returns The word-occurrences sorted, each element is an object { word, occurrences }
     */
    public getWordOccurrences(limit: number = 20, minWordLength: number = 5): any {
        if (this.empty())
            return {};
        const tweets = this.getTweets().map(tweet => tweet.text).join(' ');
        const occurrences = wf.freq(tweets);
        let tmp = [];
        for (const word in occurrences)
            tmp.push({ word, occurrences: occurrences[word] });
        tmp = tmp.filter(o => o.word.length >= minWordLength);
        tmp.sort((o1, o2) => o2.occurrences - o1.occurrences);
        const topWords = tmp.slice(0, limit);
        return topWords;
    }

    /**
     * Opens file system dialog for saving JSON file containing tweets.
     * The file name is the name of the collection (with extension '.json')
     */
    public download(): void {
        const json = this.getJson();
        const blob: Blob = new Blob([json], { type: 'application/json' });
        FileSaver.saveAs(blob, `${this.name}.json`);
    }

    /**
     * Returns the tweet corresponding to a given index
     * @param index The index of the tweet to return
     * @returns The tweet object data
     */
    public getTweetByIndex(index: number): any {
        return this.getTweets()[index];
    }

    /**
     * Returns the number of tweets in the collection
     * @returns The size of the collection
     */
    public size(): number {
        let array = this.getTweets();
        return array.length;
    }

    /**
     * Tells whether the collection is empty or not
     * @returns A boolean value indicating if the collection is empty
     */
    public empty(): boolean {
        return this.getTweets().length === 0;
    }

    public get stream(): ISearchParams {
        return this._stream;
    }

    public set stream(stream: ISearchParams) {
        this._stream = stream;
    }

    public get share(): IShare {
        return this._share;
    }

    public set share(share: IShare) {
        this._share = share;
    }

    public async getWordCloud(): Promise<string> {
        try {
            const response = await Api.get(`/tweet-collections/${this.name}/word-cloud`, {}, {auth: true});
            return response.image;
        } catch (err) {
            const response = await Api.post(`/word-cloud`, this.getTweets());
            return response.image;
        }
    }

    public toJson() {
        return {
            name: this.name,
            tweets: this.getTweets(),
            stream: this.stream,
            share: this.share
        }
    }

    public async save(): Promise<EventEmitter> {
        const tweetCollection = this.toJson();
//      tweetCollection.tweets = [];
        await Api.put(`/tweet-collections/${this.name}`, tweetCollection, { auth: true });
        const progress = new EventEmitter();
        const size = this.size();
        const name = this.name;
        const tweets = this.getTweets();
        (async () => {
            let nextTweet = 0;
            while (nextTweet < size) {
                const from = nextTweet;
                const to = Math.min(from + Config.chunkSize, size);
                await Api.post(`/tweet-collections/${name}/tweets`, tweets.slice(from, to), { auth: true });
                nextTweet = to;
                const percentage = 100 * to / size;
                progress.emit('progress', Math.round(percentage));
            }
        })();
        return progress;
    }
}