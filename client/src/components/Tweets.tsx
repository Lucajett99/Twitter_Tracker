import { Card, CardContent, Typography } from '@material-ui/core';
import * as React from 'react';
import Switch from '@material-ui/core/Switch';
import TagCloud from 'react-tag-cloud';
import randomColor from 'randomcolor';
import TweetCollection from '../utils/TweetCollection';
import Map from './Map';

interface IProps {
    tweetCollection: TweetCollection;
};

interface IState {
    checkedA : boolean;
};

export default class Tweets extends React.Component<IProps, IState>{
    lastOccurency : number; 	//Last occurency in WordCloud
    lastSize_wc : number;       //Last div size in WordCloud

    constructor(props: any) {
        super(props);
        this.lastOccurency = 0;
        this.lastSize_wc = 0;
        this.state = { checkedA : true};  
    }
    
    private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({checkedA : !this.state.checkedA});
      };

    private makeCard(i: number) {
        const cardstyle = {
            backgroundColor: i % 2? '#EFEFEF' : 'white',
            width : '100%',
            top:'10px',
            bottom :'10px',
            overflow:'visible',  
        }
    
        return (
            <Card style={cardstyle} key={i} className="card">
                <CardContent>
                    <Typography className="box" color="textSecondary" gutterBottom>
                        @{this.props.tweetCollection.getTweetByIndex(i).user.screen_name}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {this.props.tweetCollection.getTweetByIndex(i).text}
                    </Typography>
                </CardContent>
            </Card>
        );
    };
        
    makeArrayTag = function(word: string, i: number): any {
            let size;
            if(this.lastOccurency === 0) {
                this.lastOccurency = i;       //ultima occorrenza
                this.lastSize_wc = 90;    //ultima dimensione
                size = 90;
            }
            else{
                
                size =this.lastSize_wc - (this.lastOccurency / 2); 
                this.lastSize_wc = size;
                this.lastOccurency = i;
            }
            //let a = i * 12 + 10;

            return <div key={word} style={{fontSize: size }}>{word}</div>;
        
    }
            
    render() {
        const style = {
            border:'solid',
            borderColor:'#a4cde2',
            height:50 * screen.availHeight /100 + "px",
            backgroundColor:'#a4cde2'            
        };
        
        const tagCloud = {
            fontFamily: 'sans-serif',
            fontSize: 30,
            fontWeight: 'bold',
            fontStyle: 'italic',
            color: () => randomColor(),
            padding: 5,
            width: '100%',
            height: '100%'
        };
        
        const s_card = {
            height:'100%',
            width:'49%',
            overflow:'auto',
            display:'inline-block'
        };
        
        const s_tagcloud = {
            height:'100%',
            width:'49%',
            display:'inline-block'
        };
        
        let cards: Array<any> = [];
        
        for (let i = 0; i< this.props.tweetCollection.size(); i++){
            cards.push(this.makeCard(i));
        }

        const occurrencesArray = this.props.tweetCollection.getWordOccurrences();
        let arrtag: Array<any> = [];
        this.lastOccurency = 0;
        this.lastSize_wc = 0;
        for (let i = 0; i< occurrencesArray.length; i++){
            const word = occurrencesArray[i].word;
            const occurrences = occurrencesArray[i].occurrences;
            if(word !== "https"){
                arrtag.push(this.makeArrayTag(word, occurrences));
            }
            
        }
        //example of markers
        const markers = [{lat: 44.511991959639566, lng: 11.394528107037871}, {lat: 41.62696941602127, lng: 15.910143801295392}, {lat: 42.45629599160958, lng: 14.186660446036335}, {lat: 42.67156591572118, lng: 14.016446417157464}, {lat: 41.96041885679236, lng: 14.78224291107756}];
    
        if (!this.state.checkedA) {
            return (
               <div style={style}>
                    <label>Map</label>
                    <Switch checked={this.state.checkedA} onChange={this.handleChange} name="checkedA" color = "primary" inputProps={{ 'aria-label': 'secondary checkbox' } } />
                    <label>WordCloud</label>
                    <div style={style}>
                        <div style={s_tagcloud}>
                        <Map coordinateList={markers}/>
                        </div>
                        <div style={s_card}>{cards}</div>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div style={style}>
                    <label>Map</label>
                    <Switch checked={this.state.checkedA} onChange={this.handleChange} name="checkedA" color = "primary" inputProps={{ 'aria-label': 'secondary checkbox' }} />
                    <label>WordCloud</label>
                    <div style={style}>
                        <div style={s_tagcloud}>
                            <TagCloud key="tagCloud" style={tagCloud}>
                                {arrtag}
                            </TagCloud>
                        </div>
                        <div style={s_card}>{cards}</div>
                    </div>
                </div>
            );
        }
    }
}

/**
<div style={styles.large}>Transformers</div>
<div style={styles.large}>Simpsons</div>
<div style={styles.large}>Dragon Ball</div>
<div style={styles.large}>Rick & Morty</div>
<div style={{fontFamily: 'courier'}}>He man</div>
<div style={{fontSize: 30}}>World trigger</div>
<div style={{fontStyle: 'italic'}}>Avengers</div>
<div style={{fontWeight: 200}}>Family Guy</div>
<div style={{color: 'green'}}>American Dad</div>
*/
        