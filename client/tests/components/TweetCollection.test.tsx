import { iter } from "@amcharts/amcharts4/core";
import TweetCollection from "../../src/utils/TweetCollection";
describe('Tweet Collection' , ()=>{

    it('empty collection', ()=>{
        const tc : TweetCollection = new TweetCollection({name : "test"});
        expect(tc.empty()).toBe(true);
        expect(tc.size()).toBe(0);
    });
    let test = "test";
    const tweetCollection : TweetCollection = new TweetCollection({name : test});
        
    it('name of TC',()=>{
        const name = tweetCollection.getName();
        expect(name).toBe(test);
    });

    it('change Name' , ()=>{
       let test = 'test_prova';
       tweetCollection.setName(test);
       const nameChanged = tweetCollection.getName();
       expect(nameChanged).toBe(test); 
    })

    it('contains 150 tweets',()=>{
        const tc : TweetCollection = new TweetCollection({name : "test"});
        let tweets:any[] = [];
        for(let i = 0;i< 150;i++)
            tc.add({author_id:"991597321",id:"1330211425856458755"+i,text:"Questo e un esempio di Tweet",user:{id:"991597321",name:"undefined",username:"utenteProva"}});
        let count = tc.size();
        expect(count).toBe(150);
    });

    it('clear function',()=>{
        const tc : TweetCollection = new TweetCollection({name : "test"});
        for(let i = 0;i< 150;i++)
            tc.add({author_id:"991597321",id:"1330211425856458755"+i,text:"Questo e un esempio di Tweet",user:{id:"991597321",name:"undefined",username:"utenteProva"}});
        tc.clear();
        let count = tc.size();
        expect(count).toBe(0);
    })

    it('transfer 150 tweets',()=>{
        const tc : TweetCollection = new TweetCollection({name : "test"});
        for(let i = 0;i< 150;i++)
            tc.add({author_id:"991597321",id:"1330211425856458755"+i,text:"Questo e un esempio di Tweet",user:{id:"991597321",name:"undefined",username:"utenteProva"}});
        let tappo = tc.getTweets();
        const transferTC : TweetCollection = new TweetCollection({name : 'transferTC' });
        transferTC.add(tappo);
        const counter = transferTC.size();
        expect(counter).toBe(150);
    })

    it('give a index elem' , ()=>{
        const tc : TweetCollection = new TweetCollection({name : "test"});
        for(let i = 0;i< 150;i++)
            tc.add({author_id:"991597321",id:i,text:"Questo e un esempio di Tweet",user:{id:"991597321",name:"undefined",username:"utenteProva"}});
        const compare = tc.getTweetByIndex(23)
        expect(compare.id).toBe(23);
    })

});