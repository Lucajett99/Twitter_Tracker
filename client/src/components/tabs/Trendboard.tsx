import { Card, CardContent,  Typography, TextField, CardHeader} from '@material-ui/core';
import * as React from 'react';
import MapIcon from '@material-ui/icons/Map';
import ifEnter from 'client/src/utils/Enter';

interface IProps {
    trendCollection: any[];
    getTrends : any;
    goToSearch : any;
}

interface IState {
    selectedTab : number;
};

export default class TrendBoard extends React.Component<IProps, IState>{
    private cards : any[] = [];
    constructor(props: any) {
        super(props);
    }

    private makeCards() {
        this.cards = [];
        const trend = this.props.trendCollection;
        for (let i = 0; i < trend.length; i++){ 
            const cardstyle = {
                backgroundColor: i % 2? '#EFEFEF' : 'white',
                width : '100%',
                top:'10px',
                bottom :'10px',
                overflow:'visible',
            }

            const card = (
                <Card key={'t' + i} style={cardstyle} className="card" onClick={() => this.props.goToSearch(trend[i].name)}>
                    {trend[i].tweet_volume  ? <CardHeader subheader = {trend[i].tweet_volume + " Tweets related"} /> : " " }
                    <CardContent>
                        <Typography variant="h5" component="h2">
                            {trend ? trend[i].name : null}
                        </Typography>
                    </CardContent>
                </Card>
            );
            this.cards.push(card);
        }
        return this.cards.reverse();
    }; 

    render() {
        const sCard = {
            width: '60%',
            overflow:'auto',
            marginTop: '20px',
            // marginLeft: 40,
            height: 63 * screen.availHeight /100 + "px"
        };

        return (
            <div style={{width : '90%', display : 'inline-block'}}>
                <MapIcon color="primary" style={{fontSize : 45}} />
                <TextField id='location-form' label='Insert here the place you want to visualize trends' variant={'outlined'} margin={'dense'} rows={1} style={{width: '50%'}} onKeyDown={ifEnter(this.props.getTrends)} />
                <div style={sCard}>{ this.makeCards() }</div>
            </div>
        );

    }
}

