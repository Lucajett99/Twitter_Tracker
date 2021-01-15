import moment from 'moment';
import Twitter from 'twitter';
import LoginWithTwitter from 'login-with-twitter';
import { Router, Request, Response } from 'express';
import url from 'url';
import querystring from 'querystring';
import { ISearchParams } from '@twitter-tracker/shared';
import { EventEmitter } from 'events';
import { Module } from '../app/Router';
import Config from '../app/Config';
import User from './User';
import TwitterAuth from '../types/interfaces/TwitterAuth';
import { filter } from 'lodash';
import Axios from 'axios';

@Module
export default abstract class TwitterApi {
    private static _client: Twitter;

    private static get client() {
        if (!TwitterApi._client) {
            TwitterApi._client = new Twitter({
                consumer_key: Config.consumerKey,
                consumer_secret: Config.consumerSecret,
                access_token_key: Config.accessToken,
                access_token_secret: Config.accessSecret
            });
        }
        return TwitterApi._client;
    }

    private static async requestToken(): Promise<{ twitterLoginClient: LoginWithTwitter, tokenSecret: string, oauthUrl: string }> {
        const twitterLoginClient = new LoginWithTwitter({
            consumerKey: Config.consumerKey,
            consumerSecret: Config.consumerSecret,
            callbackUrl: Config.callbackUrl
        });
        return new Promise((resolve, reject) => {
            twitterLoginClient.login((err: Error | null, tokenSecret: string, oauthUrl: string) => {
                if (err) reject();
                else resolve({ twitterLoginClient, tokenSecret, oauthUrl });
            });
        });
    }

    private static async twitterCallback(twitterLoginClient: LoginWithTwitter,
        oauth: { oauth_token: string, oauth_verifier: string }, tokenSecret: string): Promise<TwitterAuth> {
            return new Promise((resolve, reject) => {
                twitterLoginClient.callback(oauth, tokenSecret, (err: Error | null, user: TwitterAuth) => {
                    if (err) reject();
                    else resolve(user);
                });
            });
    }

    public static async twitterLoginAndGetRedirectUrl(user: User): Promise<string> {
        const { twitterLoginClient, tokenSecret, oauthUrl } = await TwitterApi.requestToken();
        user.twitterLoginClient = twitterLoginClient;
        user.tokenSecret = tokenSecret;
        const oauthToken = querystring.parse(url.parse(oauthUrl).query!).oauth_token as string;
        user.setOAuthToken(oauthToken);
        return oauthUrl;
    }

    public static async completeTwitterLogin(user: User, oauth: { oauth_token: string, oauth_verifier: string }) {
        const twitterLoginClient = user.twitterLoginClient!;
        const tokenSecret: string = user.tokenSecret!;
        const twitterAuth = await TwitterApi.twitterCallback(twitterLoginClient, oauth, tokenSecret);
        user.setTwitterAuth(twitterAuth);
        return twitterAuth.userName;
    }

    public static checkParams(params: ISearchParams) {
        const { keywords, author, locations, since, until, geocode } = params;
        if (!keywords && !author)
            throw new Error('Missing both keywords and author from params');
        if (since && until) {
            const start = moment(since);
            const end = moment(until);
            if (start.isAfter(end))
                throw new Error('Param `since` cannot be a time after `until`');
        }
    }

    public static getQuery(params: ISearchParams): string {
        TwitterApi.checkParams(params);
        const keywords = params.keywords;
        const authors = params.author;
        const since = moment(params.since).format('YYYY-MM-DD[T]HH:mm:ss');
        const until = moment(params.until).add(1, 'day').format('YYYY-MM-DD[T]HH:mm:ss');
        const geocode = params.geocode;
        const lang = params.lang;
        const filters = [];
        if (keywords)
            filters.push(keywords);
        if (authors){
            if(authors.indexOf(';') === -1)
                filters.push(`from:${authors}`);
            else{
                const authorsArr = params.author?.split(';').map((a: string) => a.trim());
                if(authorsArr){
                    let reqAuthors: string = "";
                    authorsArr.forEach(element => {
                        reqAuthors+=`from:${element}+OR+`;
                    });
                    const author = reqAuthors.substring(0,reqAuthors.length - 4);
                    filters.push(author);
                }
            }
        }
        if (params.since)
            filters.push(`since:${since}`);
        if (params.until)
            filters.push(`until:${until}`);
        if (geocode)
            filters.push(`geocode:${geocode}`);
        if(lang)
            filters.push(`lang:${lang}`);
        const query = filters.join('+');
        return query;
    }

    public static async getUserId(username?: string): Promise<string | undefined> {
        if (!username)
            return undefined;
        const lookup = await TwitterApi.client.get('users/lookup', { screen_name: username });
        return (lookup[0] as any).id_str;
    }

    public static async getFilteredStream(params: ISearchParams, client?: Twitter): Promise<EventEmitter | null> {
        const track = params.keywords?.split(' ').join(',');
        const author = params.author;
        const follow = await TwitterApi.getUserId(author);
        try {
            const stream = (client || TwitterApi.client).stream('statuses/filter', { track, follow });
            return stream;
        } catch (err) {
            return null;
        }
    }

    public static setRoutes(router: Router) {
        router.get('/tweets', async (req: Request, res: Response) => {
            const params: ISearchParams = req.query;
            const query = TwitterApi.getQuery(params);
            const tweets = await TwitterApi.client.get('search/tweets', { q: query });
            res.send(tweets);
        });

        router.get('/trends', async (req: Request, res: Response) => {
            const id = req.query.woeid;
            // const id = 23424853;
            const trends = await TwitterApi.client.get('/trends/place.json',  {id} );
            res.send(trends);
        });
    }
}