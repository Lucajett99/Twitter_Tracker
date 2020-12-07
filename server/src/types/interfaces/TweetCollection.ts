import ITweet from './Tweet';

export default interface ITweetCollection {
    name: string;
    tweets: ITweet[];
}