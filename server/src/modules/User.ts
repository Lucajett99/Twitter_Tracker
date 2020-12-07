import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Config from '../app/Config';
import IIndex from '../types/interfaces/Index';
import Tweet from '../types/interfaces/Tweet';
import TweetCollection from './TweetCollection';
import ITweetCollection from '../types/interfaces/TweetCollection';

export default class User {
    private _username: string;

    private constructor (username: string) {
        this._username = username;
        this.checkStorage();
    }

    public get username() {
        return this._username;
    }

    private get folder() {
        return path.join(Config.usersDir, this.username);
    }

    private get index() {
        return path.join(this.folder, 'index.json');
    }

    private readIndex(): IIndex {
        return JSON.parse(fs.readFileSync(this.index).toString());
    }

    private writeIndex(index: IIndex) {
        fs.writeFileSync(this.index, JSON.stringify(index));
    }

    private checkStorage() {
        if (!fs.existsSync(this.folder))
            fs.mkdirSync(this.folder);
        if (!fs.existsSync(this.index)) {
            const index = { username: this.username };
            fs.writeFileSync(this.index, JSON.stringify(index));
        }
    }

    public static getByUsername(username: string): User {
        return new User(username);
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

    public exists(): boolean {
        return fs.existsSync(this.folder);
    }

    public generateAuthToken(): string {
        return jwt.sign({ username: this.username }, Config.jwtSecret);
    }

    public hasCredentials(): boolean {
        const index = this.readIndex();
        return !!index.password;
    }

    private getTweetCollectionPath(name: string) {
        return path.join(this.folder, `${name}.json`);
    }

    public loadTweetCollection(name: string) {
        const tweetCollectionPath = this.getTweetCollectionPath(name);
        if (!fs.existsSync(tweetCollectionPath))
            return null;
        const tweetCollection = fs.readFileSync(tweetCollectionPath).toString();
        const tweets = JSON.parse(tweetCollection);
        return tweets;
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
}