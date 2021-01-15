import * as React from 'react';
import { LatLngExpression } from 'leaflet';
import { AppBar, Box, Button, CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle, ListItemIcon, Tab, Tabs, Typography } from '@material-ui/core';
import TweetCollection from '../utils/TweetCollection';
import Header from './Header';
import Login from './dialogs/Login';
import Search from './tabs/Search';
import Stream from './tabs/Stream';
import Filter from './tabs/Filter';
import Api from '../utils/Api';
import TabPanel from './TabPanel';
import Tweets from './tabs/Tweets';
import TweetProvider from '../utils/TweetProvider';
import Map from './tabs/Map';
import WordCloud from './tabs/WordCloud';
import Timeline from './tabs/TimeLine';
import { ISearchParams } from '@twitter-tracker/shared';
import { IUser } from '@twitter-tracker/shared';
import TrendBoard from './tabs/Trendboard';
import SaveFilter from './tabs/SaveFilter';
import { EventEmitter } from 'events';
import _ from 'lodash';
import moment from 'moment';
import Notification from './Notification';
import FileSaver from 'file-saver';
import domtoimage from 'dom-to-image';
import Config from '../utils/Config';
import { green } from '@material-ui/core/colors';

const twitterWoeid = require("twitter-woeid");

// tslint:disable-next-line:no-empty-interface
interface AppProps {

}

interface AppState {
    tweetCollection: TweetCollection | null;
    filterCollection : TweetCollection | null;
    user: IUser;
    mapCenter: LatLngExpression;
    trendsArray : any[];
    loginDialog: boolean;
    selectedTab: number;
    checked: boolean;
    loadingDialog: boolean;
    loadingProgress: number;
    success: string;
}

export default class App extends React.Component<AppProps, AppState> {

    constructor(props: any) {
        super(props);
        this.state = {
            tweetCollection: null,
            filterCollection : new TweetCollection({ name: 'myCollection' }),
            user : null,
            trendsArray : [],
            mapCenter: { lat: 41.902782, lng: 12.496366 }, // Rome
            loginDialog: false,
            selectedTab: 0,
            checked: false,
            loadingDialog: false,
            loadingProgress: 0,
            success: ''
        };

    }

    private onTrendClick = (selectedTrend : string) => {
        if (this.state.tweetCollection === null){
            this.new("collectionFromTrend");
        }
        
        this.setState({selectedTab : 1});
        const params: ISearchParams = { keywords : selectedTrend };
        this.search(params);
    }

    async componentDidMount() {
        if (Api.isLogged() && !this.state.user)
            this.setState({ user: await Api.getUser() });
        this.downloadTrends();
    }

    private async saveImage(name: string, idNode: any) : Promise<any> {
        const map = document.getElementById(idNode);
        const width = Config.imageWidth;
        const height = Config.imageHeight;
		const image = await domtoimage.toBlob(map, { width, height });
        const blob: Blob = new Blob([image], { type: 'image/png' });
        FileSaver.saveAs(blob, `${name}.png`);
    } 
    
    private new(name: string) {
        this.setState({ tweetCollection: new TweetCollection({ name }) });
        this.success('Collection created successfully');
    }

    private async load(blob: Blob, name: string) {
        const tweetCollection = await TweetCollection.load(blob, name);
        this.setState({ tweetCollection, selectedTab: 1 });
        this.success('Collection loaded');
    }

    private handleProgress(progress: EventEmitter) {
        progress.on('progress', (loadingProgress: number) => {
            this.setState({ loadingProgress });
            if (loadingProgress === 100) {
                this.handleCloseLoadingDialog();
                this.success('Loading complete');
            }
        });
    }

    private async downloadCollection(name: string){
        this.openLoadingDialog();
        const { tweetCollection, progress } = await TweetProvider.getTweetCollection(name);
        console.log(tweetCollection);
        this.setState({ tweetCollection, selectedTab: 1 });
        this.handleProgress(progress);
        if (tweetCollection.empty())
            progress.emit('progress', 100);
    }

    private downloadTrends = async () => {
        const location = (document.getElementById('location-form') as HTMLInputElement).value;
        (document.getElementById('location-form') as HTMLInputElement).value = "";
        let woeid = 23424853;
        if(location){
            const woeidResponse = twitterWoeid.getSingleWOEID(location);
            woeid =  woeidResponse[0] ? woeidResponse[0].woeid : 23424853;
        }
        const trends = await TweetProvider.getTrends(woeid);      
        this.setState({ trendsArray :  trends });  
    }

    private loginComplete = async () => {
        this.setState({ loginDialog: false });
        this.setState({ user: await Api.getUser() });
    };

    private search = async (params: ISearchParams) => {

        const place = params.place;
        const radius = params.radius;
        const coordinates = await TweetProvider.getGeolocation(place);
        this.setState({ mapCenter: coordinates? coordinates : { lat: 41.902782, lon: 12.496366 } }); // Coordinates of Roma if they are undefined
        if (coordinates) {
            const geocode = { latitude: coordinates.lat, longitude: coordinates.lon, radius };
            params.geocode = TweetProvider.extractGeocode(geocode);
        }
        const tweets = await TweetProvider.getBySearchParams(params);

        this.state.tweetCollection.add(tweets);
        this.forceUpdate();
    };

    private download = () => {
        this.state.tweetCollection.download();
        this.success('Download complete');
    };

    private reset = () => {
        this.state.tweetCollection.clear();
        this.success('Collection reset');
        this.forceUpdate();
    }

    private save = async ( tweetCollection : TweetCollection) => {
        if(tweetCollection.size() <= 0)
            await tweetCollection.save();
        else{
            this.openLoadingDialog();
            const progress = await tweetCollection.save();
            this.handleProgress(progress);
        }
    }

    private close = () => {
        this.setState({ tweetCollection: null });
        this.success('Collection closed');
    }

    private handleUserAction = async (action: 'login' | 'logout' | 'twitterLogin' | 'twitterLogout') => {
        switch (action) {
            case 'login':
                this.setState({ loginDialog: true });
                break;
            case 'logout':
                this.setState({ user: null });
                Api.logout();
                break;
            case 'twitterLogin':
                this.state.tweetCollection? this.state.tweetCollection.save() : null;
                await Api.twitterLogin();
                break;
            case 'twitterLogout':
                await Api.twitterLogout();
                break;
        }
    };

    private handleCollectionAction = async (action: 'new' | 'load' | 'download' | 'open' | 'save' | 'close' | 'reset', params?: any) => {
        switch (action) {
            case 'new':
                this.new(params.name);
                this.state.filterCollection.clear();
                break;
            case 'load':
                this.load(params.blob, params.name);
                break;
            case 'download':
                this.download();
                break;
            case 'save':
                this.save(this.state.tweetCollection);
                break;
            case 'open':
                if (params){
                    this.downloadCollection(params);
                }
                break;
            case 'close':
                this.close();
                this.state.filterCollection.clear();
                break;
            case 'reset':
                this.reset();
                this.state.filterCollection.clear();
                break;
        }
    };

    private openLoadingDialog() {
        this.setState({ loadingProgress: 0, loadingDialog: true });
    }

    private handleCloseLoadingDialog = () => {
        this.setState({ loadingDialog: false })
    }

    private handleChangeTab = (event: React.ChangeEvent<{}>, selectedTab: number) => {
        this.setState({ selectedTab });
    };

    private filter = (params : ISearchParams) => {

        const since = moment(params.since).format('YYYY-MM-DD');
        const until = moment(params.until).format('YYYY-MM-DD');

        const tweets = this.state.tweetCollection.getTweets();

        this.state.filterCollection.clear();
        let place : any[] = [];
        
        /**Filter by KeyWords */
        const key = tweets.filter(t => t.text.includes(params.keywords));
        /**Filter by Authors */
        const auth = params.author.split(' ; ');
        let author : any[] = [];
        let paramsEmpty : Boolean = true;
        auth.forEach(elem => {  if(elem !== "") paramsEmpty = false;})
        if(paramsEmpty){
            author = tweets;
        }else{
            for(let i = 0;i<auth.length;i++){
                tweets.forEach(elem=>{
                    if(elem.user.screen_name === auth[i]){
                        author.push(elem);
                    }
                })
            }
        }

        /**Filter by Place */
        if(params.place && params.place !== "" ){
            key.forEach(elem => {
                if(elem.place && elem.place.country === params.place){
                    place.push(elem);
                }
            })
        }else{
            place = key;
        }
        
        /**Filter By Language */
        const language = tweets.filter(t =>  t.lang.includes(params.lang));
        const array3: any[] = [] ;

        /**Union by different Array without Duplicates */
        for (let i=0;i<key.length;i++){
            if(author.indexOf(key[i]) !== -1 && language.indexOf(key[i]) !== -1 && place.indexOf(key[i])!== -1){
                const date = moment(new Date(key[i].created_at)).format('YYYY-MM-DD');
                if((moment(date).isAfter(since) && moment(date).isBefore(until) )|| date===until || date === since)
                    array3.push(key[i]);    
            }
        }

        this.state.filterCollection.add(array3);

        
        this.forceUpdate();
    }

    private success(message: string) {
        this.setState({ success: message });
    }


    render(): React.ReactNode {
        const onMobile : boolean = screen.availWidth < 800 || screen.availHeight < 500;
        return (
                <div>
                <Header
                    user={this.state.user}
                    collection={this.state.tweetCollection}
                    userActionHandler={this.handleUserAction}
                    collectionActionHandler={this.handleCollectionAction}
                    onMobile ={onMobile}
                />
                {this.state.success ? <Notification severity="success" text={this.state.success} onClose={() => this.setState({ success: '' })}></Notification> : null}
                {!onMobile ?<div>
                { this.state.tweetCollection ? <div>
                <AppBar position="static" style={{ backgroundColor: "rgb(29, 161, 242)" }}>
                    <Tabs value={this.state.selectedTab} onChange={this.handleChangeTab}  scrollButtons="auto" centered>
                        <Tab label="Trends" />
                        <Tab label="Search" />
                        <Tab label="Filter" />
                        <Tab label="Map" />
                        <Tab label="WordCloud" />
                        <Tab label="Timeline" />
                        {this.state.user? <Tab label="Stream" />:''}
                    </Tabs>
                </AppBar>
                <TabPanel value={this.state.selectedTab} index={0}>
                   <TrendBoard trendCollection={this.state.trendsArray} getTrends={this.downloadTrends} goToSearch={this.onTrendClick}/>
                </TabPanel>
                <TabPanel value={this.state.selectedTab} index={1}>
                    <Search onSearch={this.search} collection={this.state.tweetCollection}></Search>
                    <Tweets width="100%" tweetCollection={this.state.tweetCollection} />
                </TabPanel>
                <TabPanel value={this.state.selectedTab} index={2}>
                    <Filter onFilter={this.filter} collection={this.state.tweetCollection} filterCollection={this.state.filterCollection}></Filter>
                    <Tweets width="80%" tweetCollection={this.state.filterCollection} />
                    <SaveFilter save={this.save} filterCollection={this.state.filterCollection}/>
                </TabPanel>
                <TabPanel value={this.state.selectedTab} index={3}>
                    <Tweets width="50%" tweetCollection={this.state.tweetCollection} />
                    <Map tweetCollection={this.state.tweetCollection} mapCenter={this.state.mapCenter} />
                    <AppBar position="static" style={{ backgroundColor: "rgb(29, 161, 242)", marginTop:'1%'}}><Button size="large" variant="outlined" style={{color: 'white'}} onClick={() => {this.saveImage("MyMap", "myMap")}}>Download Image</Button></AppBar>
                </TabPanel>
                <TabPanel value={this.state.selectedTab} index={4}>
                    <Tweets width="40%" tweetCollection={this.state.tweetCollection} />
                    <WordCloud tweetCollection={this.state.tweetCollection} />
                    <AppBar position="static" style={{ backgroundColor: "rgb(29, 161, 242)", marginTop:'1%'}}><Button size="large" variant="outlined" style={{color: 'white'}} onClick={() => {this.saveImage("MyWordCloud", "svg")}}>Download Image</Button></AppBar>
                </TabPanel>
                <TabPanel value={this.state.selectedTab} index={5}>
                    <Tweets width="48%" tweetCollection={this.state.tweetCollection} />
                    <Timeline tweetCollection={this.state.tweetCollection} />
                    <AppBar position="static" style={{ backgroundColor: "rgb(29, 161, 242)", marginTop:'1%'}}><Button size="large" variant="outlined" style={{color: 'white'}} onClick={() => {this.saveImage("MyTimeline", "chartdiv")}}>Download Image</Button></AppBar>
                </TabPanel>
                <TabPanel value={this.state.selectedTab} index={6}>
                    <Stream tweetCollection={this.state.tweetCollection} user={this.state.user}/>
                </TabPanel> </div> :
                <div>
                    <AppBar position="static" style={{ backgroundColor: "rgb(29, 161, 242)" }}>
                        <Tabs value={this.state.selectedTab} onChange={this.handleChangeTab}  scrollButtons="auto" centered>
                            <Tab label="Trends"  />
                            <Tab label="Search" disabled />
                            <Tab label="Filter"  disabled />
                            <Tab label="Map"  disabled/>
                            <Tab label="WordCloud" disabled/>
                            <Tab label="Timeline" disabled/>
                            {this.state.user? <Tab label="Stream"  disabled/>:''}
                        </Tabs>
                    </AppBar>
                    <TabPanel value={this.state.selectedTab} index={0}>
                        <TrendBoard trendCollection={this.state.trendsArray} getTrends={this.downloadTrends} goToSearch={this.onTrendClick}/>
                    </TabPanel>
               </div>
            }
            </div>:
                <h3 style={{color:'#2ea1f2',borderRadius:'5px',marginTop:'35%',padding:'2px',alignContent:'center',border:'solid'}}>This application is avaible only for PC Desktop.<br/>We apologize for the inconvenience caused</h3>
            }
            
                <Login open={this.state.loginDialog} onClose={this.loginComplete}></Login>
                <Dialog
                    open={this.state.loadingDialog}
                    onClose={this.handleCloseLoadingDialog}
                >
                    <DialogTitle id="alert-dialog-title">Loading</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Loading collection, please wait for completion...
                        </DialogContentText>
                        <Box position="relative" display="inline-flex">
                            <CircularProgress variant="determinate" value={this.state.loadingProgress} />
                            <Box
                                top={0}
                                left={0}
                                bottom={0}
                                right={0}
                                position="absolute"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
                                    this.state.loadingProgress,
                                )}%`}</Typography>
                            </Box>
                        </Box>
                    </DialogContent>
                </Dialog>
               
            </div>
           
        );

        }
    
}

