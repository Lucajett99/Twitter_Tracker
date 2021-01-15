import React from 'react';
import { queryByTestId, render } from '@testing-library/react';
import Map from '../../../src/components/tabs/Map';
import TweetCollection from '../../../src/utils/TweetCollection';

test('render map' , ()=>{
    const tc : TweetCollection = new TweetCollection({name :"Collection"});
    let tweets:any[] = [];
    tweets.push( {"author_id":"991597321","id":"1330211425856458755","text":"Questo e un esempio di Tweet","user":{"id":"991597321","name":"Calcio d'Angolo","username":"utenteProva"}});
    tc.add(tweets);
    const {queryByText} = render(<Map tweetCollection={tc} mapCenter={null} ></Map>);
    
})