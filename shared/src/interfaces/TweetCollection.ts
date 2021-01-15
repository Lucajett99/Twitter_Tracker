import { ISearchParams } from './SearchParams';
import { IShare } from './Share';
import { ITweet } from './Tweet';

export interface ITweetCollection {
    name: string;
    tweets?: ITweet[];
    size?: number;
    stream?: ISearchParams;
    share?: IShare;
}
