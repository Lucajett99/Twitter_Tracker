import moment, { Moment } from 'moment';
import { Router, Request, Response } from 'express';
import Axios, { AxiosRequestConfig } from 'axios';
import { Module } from '../app/Router';
import Config from '../app/Config';
import SearchParams from '../types/interfaces/SearchParams';

@Module
export default abstract class TwitterApi {
    private static get options(): AxiosRequestConfig {
        return {
            headers: {
                authorization: `Bearer ${Config.bearerToken}`
            }
        };
    }

    private static encodeParam(param: string) {
        return param.replace('#', '%23');
    }

    private static dateToISO(date: Date | Moment): string {
        return moment(date).format('YYYY-MM-DD');
    }

    private static urlifyParams(params: any) {
        const paramArray: string[] = [];
        Object.keys(params || {})
            .filter((key: string) => params[key])
            .forEach((key: string) => {
                const param = params[key];
                if (param) {
                    let queryParam;
                    if (param instanceof Date)
                        queryParam = TwitterApi.dateToISO(param);
                    else if (typeof param === 'string')
                        queryParam = TwitterApi.encodeParam(param);
                    else
                        queryParam = param;
                    const url = `${key}=${queryParam}`;
                    paramArray.push(url);
            }
        });
        return paramArray.join('&');
    }

    private static getEndpointUrl(url: string, query?: any, version: '1.1' | '2' = '1.1'): string {
        const questionMark = query ? '?' : '';
        const queryString = TwitterApi.urlifyParams(query);
        const endpointUrl = `${Config.twitterApiUrl}${version}${url}${questionMark}${queryString}`;
        return endpointUrl;
    }

    private static getQuery(params: SearchParams): string {
        const keywords = params.keywords;
        const author = params.author;
        const since = moment(params.since).format('YYYY-MM-DD');
        const until = moment(params.until).format('YYYY-MM-DD');
        const filters = [];
        if (keywords)
            filters.push(keywords);
        if (author)
            filters.push(`from:${author}`);
        if (since)
            filters.push(`since:${since}`);
        if (until)
            filters.push(`until:${until}`);
        const query = filters.join(' ');
        return query;
    }

    public static async get(url: string, query?: any, version: '1.1' | '2' = '1.1'): Promise<any> {
        const endpointUrl = TwitterApi.getEndpointUrl(url, query, version);
        const response = await Axios.get(endpointUrl, TwitterApi.options);
        return response.data;
    }

    public static async getStream(url: string, query?: any, version: '1.1' | '2' = '1.1'): Promise<ReadableStream> {
        const endpointUrl = TwitterApi.getEndpointUrl(url, query, version);
        const streamOptions: AxiosRequestConfig = { ...TwitterApi.options, responseType: 'stream' };
        const response = await Axios.get(endpointUrl, streamOptions);
        return response.data;
    }

    public static setRoutes(router: Router) {
        router.get('/tweets', async (req: Request, res: Response) => {
            const params: SearchParams = req.query;
            const query = TwitterApi.getQuery(params);
            const tweets = await TwitterApi.get('/search/tweets.json', { q: query });
            res.send(tweets);
        });

        router.get('/trends', async (req: Request, res: Response) => {
            const id = 1;
            const trends = await TwitterApi.get('/trends/place.json', { id });
            res.send(trends);
        });
    }
}