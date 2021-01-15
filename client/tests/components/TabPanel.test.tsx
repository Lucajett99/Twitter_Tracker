import { render } from "@testing-library/react";
import React from "react";
import TweetCollection from "../../src/utils/TweetCollection";
import Tweets from "../../src/components/tabs/Tweets";
import TabPanel from "../../src/components/TabPanel";

test('render TabPanel' , ()=>{
    const tc : TweetCollection = new TweetCollection({name :"Collection"});
    let tweets:any[] = [];
    tweets.push( {"author_id":"991597321","id":"1330211425856458755","text":"Questo e un esempio di Tweet","user":{"id":"991597321","name":"Calcio d'Angolo","username":"utenteProva"}});
    tc.add(tweets);
    const {queryByText} = render(<TabPanel value = {0} index={0}> <Tweets width="50%" tweetCollection={tc} /></TabPanel>);
    let  tweetIs = queryByText('Questo e un esempio di Tweet');
    expect(tweetIs).toBeTruthy();
})
