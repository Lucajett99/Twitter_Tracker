import { Router, Response, Request } from 'express';
import { Module } from '../app/Router';
import ITweet from '../types/interfaces/Tweet';
import ITweetCollection from '../types/interfaces/TweetCollection';
import User from './User';

@Module
export default class TweetCollection {
    private _name: string;
    private _tweets: ITweet[];

    private constructor(name: string, tweets: ITweet[]) {
        this._name = name;
        this._tweets = tweets;
    }

    public get tweets(): ITweet[] {
        return this._tweets;
    }

    public get name(): string {
        return this._name;
    }

    public static setRoutes(router: Router) {
        router.put('/tweet-collections/:name', (req: Request, res: Response) => {
            const name: string = req.params.name;
            const user: User = req.user;
            const data: ITweetCollection = req.body;
            user.storeTweetCollection(name, data);
            const tweetCollection = user.loadTweetCollection(name);
            res.send(tweetCollection);
        });

        router.get('/tweet-collections/:name', (req: Request, res: Response) => {
            const name: string = req.params.name;
            const user = req.user;
            const tweetCollection = user.loadTweetCollection(name);
            if (tweetCollection)
                res.send(tweetCollection);
            else
                res.status(404).send();
        });

        router.delete('/tweet-collections/:name', (req: Request, res: Response) => {
            const name = req.params.name;
            const user = req.user;
            const tweetCollection = user.loadTweetCollection(name);
            if (tweetCollection) {
                user.deleteTweetCollection(name);
                res.send(tweetCollection);
            } else
                res.status(404).send();
        });

    }
}