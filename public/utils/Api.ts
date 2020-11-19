import Axios, { AxiosRequestConfig } from 'axios';
import * as url from 'url';
import moment from 'moment';
import { Moment } from 'moment';

import { TimeRange } from './Interfaces';
import { apiUrl } from '../config/Config.json';

export interface ApiOptions {
    auth: boolean;
};

export default class Api {
    private static token: string;

    private static encodeParam(param: string) {
        return url.format(param.replace('#', '%23'));
    }

    private static dateToISO(date: Date | Moment): string | null {
        if (date instanceof Date)
            date = moment(date);
        return date.toISOString();
    }

    public static async get(path: string, params: any = {}, options?: ApiOptions): Promise<any> {
        if (!path)
            throw new Error('Path param must be specified and non-empty');
        let url = `${apiUrl}${path}`;
        Object.keys(params).forEach((key: string, index: number) => {
            if (index == 0) url += '?';
            else url += '&';
            const param = params[key];
            let queryParam;
            if (param instanceof Date)
                queryParam = Api.dateToISO(param);
            else if (typeof param === 'string')
                queryParam = Api.encodeParam(param);
            else
                queryParam = param;
            url += `${key}=${queryParam}`;
        });
        const config: AxiosRequestConfig = {};
        if (options?.auth) {
            if (!Api.token)
                throw new Error('You must perform authentication before making authenticated requests');
            config.headers = { authorization: Api.token };
        }
        const response = await Axios.get(url, config);
        return response.data;
    }

    public static async login(username: string, password: string) {
        const url = `${apiUrl}/login`;
        const response = await Axios.post(url, { username, password });
        Api.token = response.data.token;
    }
    /*
    public static async getCollectionList(): Promise

    public static async getCollection(collectionId: string): Promise<any> {
        let req: AxiosRequestConfig;
        req.headers.authorization = this.token;
        Axios.get('', req);
    }
    */
}