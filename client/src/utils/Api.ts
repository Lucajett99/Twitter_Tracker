import Axios, { AxiosRequestConfig } from 'axios';
import * as url from 'url';
import moment from 'moment';
import { Moment } from 'moment';
import AppError from './Error';
import Config from './Config';

export interface ApiOptions {
    auth: boolean;
};

export default abstract class Api {
    private static token: string = localStorage.getItem('twitter_tracker_token');

    private static encodeParam(param: string): string {
        return url.format(param.replace('#', '%23'));
    }

    private static dateToISO(date: Date | Moment): string | null {
        if (date instanceof Date)
            date = moment(date);
        return date.toISOString();
    }

    private static urlifyParams(params: any) {
        // tslint:disable-next-line:no-shadowed-variable
        let url = '';
        Object.keys(params).filter(key => params[key]).forEach((key: string, index: number) => {
            if (index === 0) url += '?';
            else url += '&';
            const param = params[key];
            let queryParam;
            if (param instanceof Date || moment.isMoment(param))
                queryParam = Api.dateToISO(param);
            else if (typeof param === 'string')
                queryParam = Api.encodeParam(param);
            else
                queryParam = param;
            url += `${key}=${queryParam}`;
        });
        return url;
    }

    private static async request(method: 'POST' | 'PUT' | 'GET', path: string, data?: any, options?: ApiOptions) {
        if (!path)
            throw new AppError('MISSING_PATH', 'Path param must be specified and non-empty');
        // tslint:disable-next-line:no-shadowed-variable
        let url = `${path}`;
        if (method === 'GET')
            url += Api.urlifyParams(data || {});
        const config: AxiosRequestConfig = {};
        if (options?.auth) {
            if (!Api.token)
                throw new AppError('MISSING_AUTH', 'You must perform authentication before making authenticated requests');
            config.headers = { authorization: 'Bearer ' + Api.token };
        }
        let request;
        if (method === 'GET')
            request = Axios.get(url, config);
        else if (method === 'POST')
            request = Axios.post(url, data, config);
        else if (method === 'PUT')
            request = Axios.put(url, data, config);
        try {
            const response = await request;
            return response.data;
        } catch (err) {
            if (err.response) {
                console.log(err.response);
                const response = err.response;
                if (response.status === 400)
                    throw new AppError('BAD_REQUEST', 'Bad request');
                if (response.status === 401)
                    throw new AppError('UNAUTHORIZED', 'Unauthorized');
                if (response.status === 500)
                    throw new AppError('INTERNAL_SERVER_ERROR', 'Internal server error');
            } else if (err.request)
                throw new AppError('NETWORK_ERROR', 'Network error');
            else throw err;
        }
    }

    public static async get(path: string, params: any = {}, options?: ApiOptions): Promise<any> {
        return await Api.request('GET', Config.apiUrl + path, params, options);
    }

    public static async post(path: string, data?: any, options?: ApiOptions): Promise<any> {
        return await Api.request('POST', Config.apiUrl + path, data, options);
    }

    public static async put(path: string, data?: any, options?: ApiOptions): Promise<any> {
        return await Api.request('PUT', Config.apiUrl + path, data, options);
    }

    public static async getGeo(params: string): Promise<any> {
        const geos = await Api.request('GET', 'https://nominatim.openstreetmap.org/search', {q: params, format: 'json'});
        const coordinates = {
            lat: geos[0].lat,
            lon: geos[0].lon
        }
        return coordinates;
    }

    public static async twitterLogin() {
        const { oauthUrl } = await Api.get('/auth/twitter', {}, { auth: true });
        window.location.href = oauthUrl;
    }

    public static async twitterLogout() {
        return await Api.post('/auth/twitter/logout', {}, { auth: true });
    }

    public static async facebookLogin() {
        const { oauthUrl } = await Api.get('/auth/facebook', {}, { auth: true });
        window.location.href = oauthUrl;
    }

    public static async login(username: string, password: string) {
        try {
            const response = await Api.post('/auth/login', { username, password });
            Api.token = response.token;
            localStorage.setItem('twitter_tracker_token', Api.token);
            return { success: true };
        } catch (err) {
            console.log(err);
            return { success: false, error: err.code === 'UNAUTHORIZED' ? 'Wrong credentials' : err.message };
        }
    }

    public static async getUser() {
        if (!Api.isLogged())
            return null;
        const user = await Api.get('/auth/user', {}, { auth: true });
        return user;
    }

    public static isLogged(): boolean {
        return !!Api.token;
    }

    public static async logout() {
        delete Api.token;
        localStorage.removeItem('twitter_tracker_token');
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