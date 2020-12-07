import * as React from 'react';
import TweetProvider from '../utils/TweetProvider';
import TweetCollection from '../utils/TweetCollection';
import Header from './Header';
import Search from './Search';
import Tweets from './Tweets';
import { SearchParams } from '../utils/Interfaces';
import axios from 'axios';
import { SpriteState } from '@amcharts/amcharts4/core';

interface IProps {

}

interface IState {
    collection: TweetCollection;
    user : string;
}

export default class App extends React.Component<IProps, IState> {
    
    constructor(props: any) {
        super(props);
        this.state = { collection: new TweetCollection() ,user : null };  
    }

    async componentDidMount() {
        // Sample data
        /*
        const tweets = await TweetProvider.getByKeywords('#covid19');
        this.collection.add(tweets);
        this.setState({ tweets }, () => console.log('Updated tweets'));
        const occurences = this.collection.getWordOccurrences();
        this.setState({ occurences }, () => console.log('Update occurences'));
        const trends = await TweetProvider.getTrends();
        this.setState({ trends }, () => console.log('Update trends'));
        */
    }

    private loadFile = async (blob: Blob) => {
        
        const collection = await TweetCollection.load(blob);
        const tweets = collection.getTweets();
        collection.add(tweets);
        this.setState({ collection }, () => console.log('Updated tweets'));
        
        //Aggiornare Tweet Collection nel Server
        if(this.state.user !== null){
            let tweets = this.state.collection.getTweets();

            var headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
              }
            var tweetsObject = JSON.parse(JSON.stringify(tweets));
            axios.post(`http://localhost:3000/updateTweets/${this.state.user}`, {tweetsObject} ,{headers}).then(res=>{
                //console.log(res);
                
            }).catch(err => console.log(err))
        }
    }

    private search = async (params: SearchParams) => {       
        const tweets = await TweetProvider.getBySearchParams(params);
        this.state.collection.add(tweets);
       
       //Aggiornare Tweet Collection nel Server
        if(this.state.user !== null){
            let tweets = this.state.collection.getTweets();

            var headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
              }
            var tweetsObject = JSON.parse(JSON.stringify(tweets));
            axios.post(`http://localhost:3000/updateTweets/${this.state.user}`, {tweetsObject} ,{headers}).then(res=>{
               // console.log(res);
                
            }).catch(err => console.log(err))
        

        }
        this.forceUpdate();
    }

    private save = () => this.state.collection.save();
    
    private reset = () => this.setState({ collection: new TweetCollection() });

    private setUser = (name : string , collection : any) : void => {
        //console.log(collection);
        let a : string = collection;
       // console.log(name);
        const data = {
            username : name,
            collection : collection
        }
        this.setState({user : name },()=> console.log("user update"));
        axios.post(`http://localhost:3000/loadCollection/`,{data}).then(res=>{
            //console.log(res.data);
            
            if(res.data !== "NO_FILES"){
                this.state.collection.add(res.data);
                this.setState({ collection:this.state.collection})
            }else{
                //console.log("There isn't Tweets Saved!");
            }
        }).catch(err => console.log(err))
    
    }
    private resetUser = (name : string ) : void => {
        this.setState({user : null});
        this.reset();
    }
    render(): React.ReactNode {
            return (
                <div>
                    <Header onFileLoad={this.loadFile} user={this.state.user} setProfile={this.setUser} resetProfile={this.resetUser}/> 
                    <Search onSearch={this.search} save={this.save} reset={this.reset}/>
                    <Tweets tweetCollection={this.state.collection}/>
                </div>
            );
        }
}