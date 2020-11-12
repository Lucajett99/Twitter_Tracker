import TwitterApi from './TwitterApi';

export default abstract class TweetProvider {

    public static async getRecent(rule: string): Promise<any[]> {
        const tweets = await TwitterApi.getRecent(rule);
        console.log(JSON.stringify(tweets, undefined, 2));
        return tweets.data;
    }

}