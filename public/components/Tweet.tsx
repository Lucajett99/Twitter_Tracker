import {Card,CardActions,CardContent,Button,Typography} from '@material-ui/core';
import * as React from 'react';
import data from './Document.json';
import TagCloud from 'react-tag-cloud';
import randomColor from 'randomcolor';
import CloudItem from './CloudItem';
import TweetCollection from '../utils/TweetCollection';

interface IProps {
   tweets : Array<any>;
};

interface IState {
  data: Array<any>;
};


export default class Tweet extends React.Component<IProps, IState>{
  json: { author: any; text: any; }[];

    constructor(props: any) {
        super(props);
    //    this.state = { data: [] };

        console.log("constructor Tweet");
        console.log(this.json);
        //this.json = props.data;
        //console.log(this.json);
      }

makeCards = function(i : number):any{
    
 // console.log(this.json[i]);
    const cardstyle = {
      backgroundColor: i % 2? '#EFEFEF' : 'white',
      width : '100%',
      top:'10px',
      bottom :'10px',
      overflow:'visible',
      
    }
   
      return  <Card style={cardstyle} className="card">
                <CardContent>
                  <Typography className="box" color="textSecondary" gutterBottom>
                    {this.json[i].id}
                  </Typography>
                  <Typography variant="h5" component="h2">
                  {this.json[i].text}
                  </Typography>
                  </CardContent>
              </Card>
}

makeArrayTag = function(i : number,j : number):any{
//  return  <CloudItem text={this.data[i].tag[j]}/>

  }

  render(){
        this.json = this.props.tweets;
        
        const style={

                border:'solid',
                borderColor:'#a4cde2',
                height:50 * screen.availHeight /100 + "px",
                backgroundColor:'#a4cde2'
            
        }

        const tagCloud={
          fontFamily: 'sans-serif',
          fontSize: 30,
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: () => randomColor(),
          padding: 5,
          width: '100%',
          height: '100%'
        }


        const s_card = {
            height:'100%',
            width:'49%',
            //maxWidth:'500px',
            border:'solid',
            borderColor:'yellow',
            //position:'absolute',
  
            overflow:'auto',
          display:'inline-block'
          }

        const s_tagcloud = {
            height:'100%',
            //maxWidth:'500px',
            width:'49%',
            border:'solid',
            borderColor:'red',
            //position:'absolute',
         
            display:'inline-block'
        }

        var cards : Array<any> = [];

        for(let i = 0;i< this.json.length ;i++){
            cards.push(this.makeCards(i));
        }

        var Arrtag : Array<any> = [];

        for(let i = 0;i< this.json.length;i++){
            //for(let j = 0;j<this.json[i].tag.length;j++){
             //   Arrtag.push(this.makeArrayTag(i,j) );
            //}

        }

          return<div style={style}>
                  <div style={s_tagcloud}>
                               <TagCloud style={tagCloud}>
                                  {Arrtag}
                               </TagCloud>
                             </div>
                    <div style={s_card}>{cards}</div>
               </div>
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