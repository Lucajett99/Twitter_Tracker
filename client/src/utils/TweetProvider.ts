import moment from 'moment';
import { Moment } from 'moment';

import { TimeRange, SearchParams, GeoCode } from './Interfaces';
import Api from './Api';

/**
 * Abstract class with methods to provide tweets from Twitter API
 */
export default abstract class TweetProvider {
    /*
    private static extractTime(timeRange: TimeRange) {
        if (!timeRange)
            return {};
        const now: Moment = moment();
        const oneWeekAgo: Moment = moment().subtract(7, 'd');
        const since: Moment = moment(timeRange.since);
        const until: Moment = moment(timeRange.until);
        if (since.isAfter(now) || until.isAfter(now))
            throw new Error('Start and end date cannot be in the future');
        if (since.isBefore(oneWeekAgo) || until.isBefore(oneWeekAgo))
            throw new Error('Start and end date cannot be past one week');
        if (since.isAfter(until))
            throw new Error('Start date must be before end date');
        return {
            since: since.isValid() ? since.format('YYYY-MM-DD') : undefined,
            until: until.isValid() ? until.format('YYYY-MM-DD') : undefined
        };
    }
    */


    private static extractGeocode(geocode: GeoCode): string {
        if (!geocode)
            return undefined;
        const { latitude, longitude, radius } = geocode;
        return `${latitude},${longitude},${radius}`;
    }

    /**
     * Provides recent Tweets matching search params.
     * Search params are specified as
     * {
     *     query: string
     *     author: string
     *     since: Date    
     *     until: Date
     * }
     * @param params Search object
     * @returns Array of filtered Tweets
     */
    public static async getBySearchParams(params: SearchParams): Promise<any[]> {
        if (!params.keywords && !params.author)
            throw new Error('Keywords and author params cannot both be null');
        const tweets = await Api.get('/tweets', params);
        return tweets.statuses;
    }

    /**
     * Retrieves the trends of the moment near the specified location.
     * If location is not specified trends are retrieved for all over the world.
     * @param location The name of the location (could be city, country, ...) (default: 'world')
     * @returns Array of trends
     */
    public static async getTrends(/*location: string = 'world'*/): Promise<any[]> {
        const result = await Api.get('/trends', { location: 'world' });
        return result[0].trends;
    }

}