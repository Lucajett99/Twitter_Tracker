import { EventEmitter } from 'events';
import { ISearchParams, IGeocode, ITweetCollection, ITweet } from '@twitter-tracker/shared';
import Api from './Api';
import TweetCollection from './TweetCollection';
import Config from './Config';
export default abstract class TweetProvider {
    public static extractGeocode(geocode: IGeocode): string {
        if (!geocode)
            return undefined;
        if(!(geocode.radius))
            geocode.radius = "10";  // set default radius
        const { latitude, longitude, radius } = geocode;
        return `${latitude},${longitude},${radius}km`;
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
    public static async getBySearchParams(params: ISearchParams): Promise<any[]> {
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
    public static async getTrends(woeid: number = 1): Promise<any[]> {
        const result = await Api.get('/trends', {woeid});
        return result[0].trends;
    }

    /**
     * Provide latitude and longitude of a place
     * @param place The name of the place you want to search
     * @returns Coordinates
     */
    public static async getGeolocation(place: string): Promise<any> {
        const result = place? await Api.getGeo(place) : undefined;
        return result;
    }

    public static async getTweetCollections(): Promise<ITweetCollection[]>{
        const list = await Api.get('/tweet-collections', {}, { auth: true });
        return list;
    }

    public static async getTweetCollection(name: string): Promise<{ tweetCollection: TweetCollection, progress: EventEmitter }> {
        const collection: ITweetCollection = await Api.get(`/tweet-collections/${name}`, {}, { auth: true });
        const tweetCollection = new TweetCollection(collection);
        const size: number = collection.size;
        const progress: EventEmitter = new EventEmitter();
        (async () => {
            let nextTweet = 0;
            if (size === 0)
                return progress.emit('progress', 100);
            while (nextTweet < size) {
                const from = nextTweet;
                const to = Math.min(from + Config.chunkSize, size);
                const tweets: ITweet[] = await Api.get(`/tweet-collections/${name}/tweets`, { from, to }, { auth: true });
                nextTweet = to;
                tweetCollection.add(tweets);
                const percentage = 100 * to / size;
                progress.emit('progress', Math.round(percentage));
            }
        })();
        return { tweetCollection, progress };
    }

}