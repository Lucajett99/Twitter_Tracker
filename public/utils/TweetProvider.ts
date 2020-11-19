import moment from 'moment';
import { Moment } from 'moment';

import { TimeRange } from './Interfaces';
import Api from './Api';

/**
 * Abstract class with methods to provide tweets from Twitter API
 */
export default abstract class TweetProvider {
    /**
     * Provides recent Tweets by keywords
     * @param keywords List of keywords to filter Tweets by
     * @returns Array of Tweets filtered by keywords
     */
    public static async getByKeywords(...keywords: string[]): Promise<any[]> {
        if (keywords.length === 0)
            throw new Error('At least one keyword must be specified');
        const query = keywords.join(' ');
        const tweets = await Api.get('/recent', { query });
        return tweets.data;
    }

    /**
     * Provides recent Tweets for a specific Twitter user
     * @param user The username of the specific user
     * @returns Array of Tweets filtered by user
     */
    public static async getByUser(user: string): Promise<any[]> {
        if (!user)
            throw new Error('User param cannot be an empty string');
        const query = `from:${user}`;
        const tweets = await Api.get('/recent', { query });
        return tweets.data;
    }

    /**
     * Provides recent Tweets matching query and between a certain time range.
     * It is not possible to retrieve tweets by time range only, query must be always specified.
     * @param query List of keywords or rules to filter Tweets by
     * @param timeRange An object containing two JavaScript Date Objects: start and end
     * @returns Array of filtered Tweets
     */
    public static async getByQueryAndTime(query: string, timeRange: TimeRange): Promise<any[]> {
        if (!query)
            throw new Error('Query param cannot be an empty string');
        const now: Moment = moment();
        const oneWeekAgo: Moment = moment().subtract('7d');
        const start_time: Moment = moment(timeRange.start);
        const end_time: Moment = moment(timeRange.end);
        if (start_time.isAfter(now) || end_time.isAfter(now))
            throw new Error('Start and end date cannot be in the future');
        if (start_time.isBefore(oneWeekAgo) || end_time.isBefore(oneWeekAgo))
            throw new Error('Start and end date cannot be past one week');
        if (start_time.isAfter(end_time))
            throw new Error('Start date must be before end date');
        const tweets = await Api.get('/recent', { query, start_time, end_time });
        return tweets.data;
    }

    /**
     * Retrieves the trends of the moment near the specified location.
     * If location is not specified trends are retrieved for all over the world.
     * @param location The name of the location (could be city, country, ...) (default: 'world')
     * @returns Array of trends
     */
    public static async getTrends(/*location: string = 'world'*/): Promise<any> {
        const result = await Api.get('/trends', { location: 'world' });
        return result[0].trends;
    }

}