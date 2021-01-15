import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import LoginWithTwitter from 'login-with-twitter';
import Twitter from 'twitter';
import Config from '../app/Config';
import IIndex from '../types/interfaces/Index';
import TwitterAuth from '../types/interfaces/TwitterAuth';
import { ITweetCollection, IUser } from '@twitter-tracker/shared';

export default class User {
    private static oAuthWaitingQueue: User[] = [];
    private _username: string;

    private _twitterClient?: Twitter;
    private _twitterAuth?: TwitterAuth;
    private oauthToken?: string;

    public twitterLoginClient?: LoginWithTwitter;
    public tokenSecret?: string;


    private constructor (username: string) {
        this._username = username;
        this.load();
    }

    public get username() {
        return this._username;
    }

    public get twitterClient(): Twitter {
        return this._twitterClient!;
    }

    public get twitterAuth(): TwitterAuth | undefined {
        return this._twitterAuth;
    }

    private get folder() {
        return path.join(Config.usersDir, this.username);
    }

    private get index() {
        return path.join(this.folder, 'index.json');
    }

    public get info(): IUser {
        return {
            username: this.username,
            twitter: this.isLoggedWithTwitter()
        }
    }

    private readIndex(): IIndex {
        return JSON.parse(fs.readFileSync(this.index).toString());
    }

    private writeIndex(index: IIndex) {
        fs.writeFileSync(this.index, JSON.stringify(index));
    }

    private getTwitterClient(twitterAuth: TwitterAuth): Twitter {
        this._twitterAuth = twitterAuth;
        return new Twitter({
            consumer_key: Config.consumerKey,
            consumer_secret: Config.consumerSecret,
            access_token_key: twitterAuth.userToken,
            access_token_secret: twitterAuth.userTokenSecret
        });
    }

    private load() {
        let index;
        if (!fs.existsSync(this.folder))
            fs.mkdirSync(this.folder);
        if (!fs.existsSync(this.index)) {
            index = { username: this.username };
            fs.writeFileSync(this.index, JSON.stringify(index));
        } else
            index = this.readIndex();

        if (index.twitterAuth)
            this._twitterClient = this.getTwitterClient(index.twitterAuth);
    }

    public static getByUsername(username: string): User {
        return new User(username);
    }

    public setOAuthToken(oauthToken: string) {
        this.oauthToken = oauthToken;
        User.oAuthWaitingQueue.push(this);
    }

    public static getByOauthToken(oauthToken: string): User | null {
        const user = User.oAuthWaitingQueue.find(u => u.oauthToken === oauthToken);
        return user || null;
    }

    public getTweetCollections() {
        const list = fs.readdirSync(this.folder);
        list.splice(list.indexOf('index.json'), 1);
        for (let i = 0; i < list.length; i++) {
            list[i] = list[i].substring(0, list[i].length - 5);
        }
        return list;
    }

    public setPassword(password: string) {
        const hash = bcrypt.hashSync(password, Config.saltRounds);
        const index = this.readIndex();
        index.password = hash;
        this.writeIndex(index);
    }

    public checkPassword(password: string): boolean {
        const index = this.readIndex();
        return bcrypt.compareSync(password, index.password);
    }

    public generateAuthToken(): string {
        return jwt.sign({ username: this.username }, Config.jwtSecret);
    }

    public setTwitterAuth(twitterAuth: TwitterAuth) {
        delete this.tokenSecret;
        this._twitterAuth = twitterAuth;
        const index = this.readIndex();
        index.twitterAuth = twitterAuth;
        this.writeIndex(index);
    }

    public hasCredentials(): boolean {
        const index = this.readIndex();
        return !!index.password;
    }

    private getTweetCollectionPath(name: string) {
        return path.join(this.folder, `${name}.json`);
    }

    public loadTweetCollection(name: string): ITweetCollection | null {
        const tweetCollectionPath = this.getTweetCollectionPath(name);
        if (!fs.existsSync(tweetCollectionPath))
            return null;
        const tweetCollection = fs.readFileSync(tweetCollectionPath).toString();
        return JSON.parse(tweetCollection);
    }

    public storeTweetCollection(name: string, data: ITweetCollection) {
        const tweetCollectionPath = this.getTweetCollectionPath(name);
        const tweetCollection = JSON.stringify(data);
        fs.writeFileSync(tweetCollectionPath, tweetCollection);
    }

    public deleteTweetCollection(name: string) {
        const tweetCollectionPath = this.getTweetCollectionPath(name);
        if (fs.existsSync(tweetCollectionPath))
            fs.unlinkSync(tweetCollectionPath);
    }

    public deleteTwitterAuth() {
        const index = this.readIndex();
        delete index.twitterAuth;
        this.writeIndex(index);
    }

    public isLoggedWithTwitter(): boolean {
        return !!this._twitterClient;
    }

    private async addMediaToTwitter(media: string, type: string = Config.wordCloud.type) {
        const data = Buffer.from(media, 'base64');
        const size = data.length;
        const meta = await this.twitterClient.post('media/upload', { command: 'INIT', total_bytes: size, media_type: type });
        const mediaId = meta.media_id_string;
        await this.twitterClient.post('media/upload', {
            command: 'APPEND',
            media_id: mediaId,
            media: data,
            segment_index: 0
        });
        await this.twitterClient.post('media/upload', { command: 'FINALIZE', media_id: mediaId });
        return mediaId;
    }

    public async tweet(tweet: string, options?: { mediaIds: string[] }) {
        const result = await this.twitterClient.post('statuses/update', { status: tweet, media_ids: options?.mediaIds.join(',') });
        return result;
    }

    public async tweetImages(tweet: string, images: string[]) {
        const mediaIds = [];
        for (const image of images)
            mediaIds.push(await this.addMediaToTwitter(image));
        await this.tweet(tweet, { mediaIds });
    }
}