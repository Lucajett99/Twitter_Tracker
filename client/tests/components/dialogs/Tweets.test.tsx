import React from 'react';
import {fireEvent, getByTestId, getByText, screen ,render} from '@testing-library/react';
import Header from '../../../src/components/Header';
import Notification from '../../../src/components/Notification';
import SaveFilter from '../../../src/components/tabs/SaveFilter';
import TweetCollection from '../../../src/utils/TweetCollection';
import { iteratee, rest } from "lodash";
import Tweets from '../../../src/components/tabs/Tweets';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';

test('display empty tc',()=>{
    const tc : TweetCollection = new TweetCollection({name :"emptyCollection"});
    const {queryByTestId} = render(<Tweets width='50%' tweetCollection={tc} />);
    let display = queryByTestId('cards');
    expect(display).toBe(null);  
})

describe('visualize tweets',()=>{
    const tc : TweetCollection = new TweetCollection({name :"Collection"});
    let tweets:any[] = [];
    tweets.push( {"author_id":"991597321","id":"1330211425856458755","text":"Questo e un esempio di Tweet","user":{"id":"991597321","name":"Calcio d'Angolo","username":"utenteProva"}});
    tc.add(tweets);
    test('from test',()=>{
        const {queryByText} = render(<Tweets width='50%' tweetCollection={tc} />);
        let  tweetIs = queryByText('Questo e un esempio di Tweet');
        expect(tweetIs).toBeTruthy();
        
    })

    test('from Cards',()=>{
        const {queryByTestId} = render(<Tweets width='50%' tweetCollection={tc} />);
        let cont = queryByTestId('cards');
        expect(cont).not.toBe(null);
    })
    
});

test('large quantity of Tweets',()=>{
    const TEST = 300;
    const tc : TweetCollection = new TweetCollection({name :"fullCollection"});
    let tweets:any[] = [];
    
    for(let i = 0;i<TEST;i++){
        tweets.push( {"author_id":"991597321","id":i,"text":"Questo e un esempio di Tweet"+i,"user":{"id":"991597321","name":"Calcio d'Angolo","username":"utenteProva"}});
    }
    tc.add(tweets);
    const {queryByText} = render(<Tweets width='50%' tweetCollection={tc} />);
    for(let i = 0;i < TEST ;i++){
        let  tweetIs = queryByText('Questo e un esempio di Tweet'+i);
        expect(tweetIs).toBeTruthy();
    }

})