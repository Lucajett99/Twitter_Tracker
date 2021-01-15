import { ISearchParams } from './SearchParams';

export interface IShare {
    message: string;
    platforms: {
        twitter?: boolean;
        facebook?: boolean;
    },
    objects: {
        wordCloud?: boolean;
        map?: boolean;
        timeline?: boolean;
    },
    filter: ISearchParams;
    schedule: Date[];
}