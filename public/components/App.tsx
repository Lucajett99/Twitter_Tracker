import * as React from 'react';
import TweetProvider from '../utils/TweetProvider';
import TweetCollection from '../utils/TweetCollection';
import Header from './Header';
import Search from './Search';
import Tweet from './Tweet';
import data from './Document.json';


interface IProps {

}

interface IState {
    tweets: any[];
}

export default class App extends React.Component<IProps, IState> {
    collection: TweetCollection;

    constructor(props: any) {
        super(props);
        this.state = { tweets: [] };
        this.collection = new TweetCollection();
        /*
        function readJSON(file : string ){
            console.log(file);
            let request = new XMLHttpRequest();
            let a = request.open('GET', file, false);
            request.send(null);
            console.log(a);
            if (request.status == 200)
            return request.responseText;
            
        }
        
        const temp = readJSON('./Document.json');
        const data = JSON.parse(temp);
        
        console.log(data);
        */  
    }
    
    public handleCapture(event: React.ChangeEvent<HTMLInputElement>): void {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const blob = new Blob([new Uint8Array(e.target.result as any)], { type: file.type });
            this.collection = await TweetCollection.load(blob);
        };
        reader.readAsArrayBuffer(file);
    }

    async componentDidMount() {
        /*
        console.log('Component did mount');
        // Prende i tweet DA TWITTER
        const tweets = await TweetProvider.getByKeywords('#covid19');
        console.log(tweets);
        // Inserisco i tweet appena presi nella collection di nome test
        this.collection.add(tweets);
        console.log(this.collection.getTweets());
        // Salva i dati in un file
        this.collection.save();
        this.setState({ tweets }, () => console.log('Updated state'));
        */
        /*
        const trends = await TweetProvider.getTrends();
        console.log(trends);
        */
        this.collection.add(await TweetProvider.getByKeywords('covid'));
        this.collection.add(await TweetProvider.getByKeywords('virus'));
        this.collection.add(await TweetProvider.getByKeywords('ospedali'));
        this.collection.add(await TweetProvider.getByKeywords('regioni'));
        console.log(this.collection.getWordOccurrences());
    }
    
    
    

    render() {
    //    var objJson1 = this.state.tweets;
   // var objJson1 = JSON.stringify(this.state.tweets);       //vettore -> stringa
       //var a =  JSON.parse(objJson1)
      //  console.log("json = ");
       // console.log(objJson1);

        return (
            <div>
                <Header/> 
                <Search/>
                <input
                    accept="application/json"
                    capture="camcorder"
                    id="test-upload"
                    onChange={this.handleCapture}
                    type="file"
                />
                <Tweet tweets={this.state.tweets}/>
            </div>
        );
    }
}