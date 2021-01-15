import React from 'react';
import moment from 'moment';
import { fireEvent, render } from '@testing-library/react';
import Stream from '../../../src/components/tabs/Stream';
import TweetCollection from '../../../src/utils/TweetCollection';
import { ITweetCollection } from '../../../../shared/src/interfaces/TweetCollection';
import { ISearchParams } from '../../../../shared/src/interfaces/SearchParams';
import { IShare } from  '../../../../shared/src/interfaces/Share';
import { IUser } from '../../../../shared/src/interfaces/User';

describe('<Stream />', () => {
    it('should create the stream card when the stream is defined', () => {
        const keywords = "Test";
        const since = moment().format('YYYY-MM-DD[T]HH:mm');
        const until = moment().add(5, 'd').format('YYYY-MM-DD[T]HH:mm');
        const stream: ISearchParams = {
            keywords,
            since,
            until
        };
        const user: IUser = {
            username: "Test",
            twitter: true
        }
        const collectionParams: ITweetCollection = {
            name: "Test",
            stream,
        }
        const tweetCollection: TweetCollection = new TweetCollection(collectionParams);
        const { queryByTestId } = render(<Stream tweetCollection={tweetCollection} user={user}/>);
        const streamCard = queryByTestId('streamCard');
        expect(streamCard).not.toBe(null);
    });

    it('should not create the stream card when the stream is not defined', () => {
        const user: IUser = {
            username: "Test",
            twitter: true
        }
        const collectionParams: ITweetCollection = {
            name: "Test",
        }
        const tweetCollection: TweetCollection = new TweetCollection(collectionParams);
        const { queryByTestId } = render(<Stream tweetCollection={tweetCollection} user={user} ></Stream>);
        const streamCard = queryByTestId('streamCard');
        expect(streamCard).toBe(null);
    });

    it('should create the share card when the share is defined', () => {
        const date = moment("2020-12-30T22:30");
        const schedule: any = [date];
        const filter: ISearchParams = {};
        const keywords = "Test";
        const since = moment().format('YYYY-MM-DD[T]HH:mm');
        const until = moment().add(5, 'd').format('YYYY-MM-DD[T]HH:mm');
        const stream: ISearchParams = {
            keywords,
            since,
            until
        };
        const share: IShare = {
            message: "",
            platforms: {twitter: true},
            objects: {
                wordCloud: true,
                map: false,
                timeline: false
            },
            filter,
            schedule
        };
        const user: IUser = {
            username: "Test",
            twitter: true
        };
        const collectionParams: ITweetCollection = {
            name: "Test",
            stream,
            share
        };
        const tweetCollection: TweetCollection = new TweetCollection(collectionParams);
        const { queryByTestId } = render(<Stream tweetCollection={tweetCollection} user={user}/>);
        const shareCard = queryByTestId('shareCard');
        expect(shareCard).not.toBe(null);
    });

    it('should not create the share card when the share is not defined', () => {
        const keywords = "Test";
        const since = moment().format('YYYY-MM-DD[T]HH:mm');
        const until = moment().add(5, 'd').format('YYYY-MM-DD[T]HH:mm');
        const stream: ISearchParams = {
            keywords,
            since,
            until
        };
        const user: IUser = {
            username: "Test",
            twitter: true
        };
        const collectionParams: ITweetCollection = {
            name: "Test",
            stream,
        };
        const tweetCollection: TweetCollection = new TweetCollection(collectionParams);
        const { queryByTestId } = render(<Stream tweetCollection={tweetCollection} user={user}/>);
        const shareCard = queryByTestId('shareCard');
        expect(shareCard).toBe(null);
    });
});