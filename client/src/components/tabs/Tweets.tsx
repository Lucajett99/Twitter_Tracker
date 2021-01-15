import { Card, CardContent, CardHeader, Avatar, Typography, Button, Dialog, DialogActions, DialogContent, CardActions } from '@material-ui/core';
import * as React from 'react';
import moment from 'moment';
import TweetCollection from '../../utils/TweetCollection';
import TweetEmbed from 'react-tweet-embed';
interface IProps {
    tweetCollection: TweetCollection;
    width: string;
};

interface IState {
    selectedTab : number;
    open: boolean;
    id: string;
};

export default class Tweets extends React.Component<IProps, IState>{
    lastOccurency : number; 	// Last occurency in WordCloud
    lastSizeWc : number;       // Last div size in WordCloud

    constructor(props: any) {
        super(props);
        this.lastOccurency = 0;
        this.lastSizeWc = 0;
        this.state = {open: false, id: "", selectedTab: 0};
    }

    private setDialog = (value: boolean, id: string) => {
        this.setState({ open: value, id });
    }

    private makeCard(i: number) {
        const cardstyle = {
            backgroundColor: i % 2? '#EFEFEF' : 'white',
            width : '100%',
            top:'10px',
            bottom :'10px',
            overflow:'visible',
        }
        const tweet = this.props.tweetCollection.getTweetByIndex(i);
        const createdAt = moment(new Date(tweet.created_at)).format('DD/MM/YYYY HH:mm');
        const images: any = [];
        if(tweet.extended_entities) {
            tweet.extended_entities.media.forEach((image: any) => {
                images.push(<img key={image.id_str} src={image.media_url} style={{width: "100px", height: "100px", display: "inline", margin:"5px"}}/>)
            })
        }
        return (
            <Card key={tweet.id} style={cardstyle} className="card">
                <CardHeader
                    avatar={<Avatar aria-label="ProfileImage" src={tweet.user.profile_image_url}/>}
                    title={"@" + tweet.user.screen_name}
                    subheader={createdAt}
                />
                <CardContent>
                    <Typography variant="h5" component="h2" data-testid="cards">
                        {tweet.text}
                    </Typography>
                    {images}
                </CardContent>
                <CardActions>
                    <Button style={{marginLeft: "auto"}} variant="outlined" color="primary" onClick={() => this.setDialog(true, tweet.id_str)}> 
                        Show
                    </Button>
                </CardActions>
            </Card>
        );
    };
    render() {
        const sCard = {
            width: this.props.width,
            overflow:'auto',
            marginTop: '20px',
            // marginLeft: 40,
            height: 63 * screen.availHeight /100 + "px"
        };

        const cards: any[] = [];

        for (let i = 0; i < this.props.tweetCollection.size(); i++){
            cards.unshift(this.makeCard(i));
        }

        return (
            <>
                <div>
                    <Dialog open={this.state.open} onClose={() => {this.setDialog(false, "")}}>
                        <DialogContent style={{ minWidth: 550 }}>
                            <TweetEmbed id={this.state.id} options={{ width: 550 }} />
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={() => {this.setDialog(false, "")}} color="primary" autoFocus>
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div style={sCard}>{ cards }</div>
            </>
        );

    }
}