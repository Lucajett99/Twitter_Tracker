import * as React from 'react';
import { Card, CardHeader, CardContent, Grid, TextField, Switch, Button, IconButton, Box, Theme, withStyles, FormControlLabel, Typography, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from '@material-ui/core';
import TwitterIcon from '@material-ui/icons/Twitter';
import CloudIcon from '@material-ui/icons/Cloud';
import TimelineIcon from '@material-ui/icons/Timeline';
import MapIcon from '@material-ui/icons/Map';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import moment from 'moment';
import TweetCollection from '../../utils/TweetCollection';
import Notification from '../Notification';
import Api from '../../utils/Api';
import { ISearchParams, IShare } from '@twitter-tracker/shared';


interface IState{
    checkedTW: boolean;
    checkedWordCloud: boolean;
    checkedMap: boolean;
    checkedTimeline: boolean;
    myCollections: TweetCollection[];
    datePost: any[];
    schedule: any[];
    error: string;
    openConfirmDialog: boolean;
}

interface IProps{
    classes: any;
    tweetCollection: TweetCollection;
    user:any;
}

const styles = (theme: Theme) => ({
    field: {
        margin: theme.spacing(2),
    },
    box: {
        display: "flex",
        margin: 2,
        "flex-direction": "row",
        "flex-wrap": "wrap"
    },
    postData: {
        height: "fit-content",
        maxWidth: '300px',
        border: 'solid 1px gray',
        borderRadius: '10px',
        marginTop: '18px'
    },
});


class Stream extends React.Component<IProps, IState> {
    private today = () => moment().format('YYYY-MM-DD[T]HH:mm');

	constructor(props: any) {
        super(props);
        this.state = {
            datePost: [],
            schedule: [],
            myCollections: [],
            checkedTW: false,
            checkedWordCloud: false,
            checkedMap: false,
            checkedTimeline: false,
            error: '',
            openConfirmDialog: false
        };
    }

    /**
     * Start the stream/share
     * @returns An async function
     */
    private startStream = async () => {
        const twitter: boolean = this.state.checkedTW;
        const wordCloud: boolean = this.state.checkedWordCloud;
        const map: boolean = this.state.checkedMap;
        const timeline: boolean = this.state.checkedTimeline;
        const keywords: string = (document.getElementById('keywords') as HTMLInputElement).value;
        const author: string = (document.getElementById('author') as HTMLInputElement).value;
        const since: string = (document.getElementById('startDate') as HTMLInputElement).value;
        const until: string = (document.getElementById('endDate') as HTMLInputElement).value;
        const message: string = (document.getElementById('message') as HTMLInputElement).value;

        if( !this.control(keywords, author, since, until) ) return;
        this.clean();
        const schedule: Date[] = this.state.schedule;
        const filter: ISearchParams = {};
        const stream: ISearchParams = {
            keywords,
            author,
            since,
            until
        }
        const share: IShare = {
            message,
            platforms: {
                twitter
            },
            objects: {
                wordCloud,
                map,
                timeline
            },
            filter,
            schedule
        };
        this.props.tweetCollection.stream = stream;
        this.props.tweetCollection.share = share;
        await this.props.tweetCollection.save();
    }

    /**
     * Controls if all fields are ok to stream and/or sharing (i.e. required fields, right dates, ...)
     * @param keywords The keywords to search
     * @param author The author to search
     * @param since The start date of the stream
     * @param until The end date of the stream
     * @returns If there is an exception or not
     */
    private control = (keywords: string, author: string, since: string, until: string) => {
        const startDate = moment(since, 'YYYY-MM-DD[T]hh:mm');
        const endDate = moment(until, 'YYYY-MM-DD[T]hh:mm');
        const schedule = this.state.schedule;
        if (!keywords && !author) {
            this.setState({ error: 'Keywords or author must be specified in order to perform a search' });
            return;
        }
        if(startDate.isAfter(endDate)){
            this.setState({ error: 'The start date must be befor the end date of the stream' });
            return;
        }
        if (endDate.isSameOrBefore(this.today())) {
            this.setState({ error: 'The end date must be in the future' });
            return;
        }
        if(this.state.checkedTW && this.state.schedule.length <= 0) {
            this.setState({ error: 'You must set the post date for your sharing' });
            return;
        }
        if(this.state.checkedTW && (!this.state.checkedWordCloud && !this.state.checkedMap && !this.state.checkedTimeline)) {
            this.setState({ error: 'You must set Word Cloud and/or Map and/or Timeline for your sharing' });
            return;
        }
        // tslint:disable-next-line:prefer-for-of
        for(let i = 0; i < schedule.length; i++){
            const date = schedule[i];
            if(date.isSameOrBefore(startDate)){
                this.setState({ error: 'The post date must be after the start date of the stream' });
                this.deleteDate(date);
                return;
            }
        }
        return true;
    }

    /**
     * Cleans all fields of the stream after started streaming
     */
    private clean = () : void => {
        const keywords = document.getElementById('keywords') as HTMLInputElement;
        const author = document.getElementById('author') as HTMLInputElement;
        const since = document.getElementById('startDate') as HTMLInputElement;
        const until = document.getElementById('endDate') as HTMLInputElement;
        const message = document.getElementById('message') as HTMLInputElement;
        const postDate = document.getElementById('postDate') as HTMLInputElement;
        keywords.value = "";
        author.value = "";
        since.value = this.today();
        until.value = this.today();
        postDate.value = this.today();
        message.value = "";
        this.setState({ checkedWordCloud: false, checkedMap: false, checkedTW: false, checkedTimeline: false, schedule: [], datePost: [] });
    }

    /**
     * Delete a date when deleteIcon is clicked
     * @param date The date that have to be deleted
     */
    private deleteDate = (date: any) : void => {
        const schedule = this.state.schedule;
        const datePost = this.state.datePost;
        schedule.forEach((element: any, i: number) => {
            // tslint:disable-next-line:triple-equals
            if(element == date){
                schedule.splice(i, 1);
                datePost.splice(i, 1);
            }
        });
        this.setState({ schedule, datePost });
    }

    /**
     * Add a date specified in the data field when addIcon is clicked and set the schedule
     */
    private addDate = () : void => {
        const inputDate = (document.getElementById('postDate') as HTMLInputElement).value.toString();
        const date = moment(inputDate);
        if(date.isSameOrBefore(this.today())){
            this.setState({ error: 'The post date must be in after the start date of the stream' });
            return;
        }
        const schedule = this.state.schedule;
        schedule.push(date);
        const datePost = this.state.datePost;
        const newDate = (
            <div key={inputDate}>
                { date.format('DD/MM/YYYY HH:mm') }
                <IconButton aria-label='delete' onClick={()=>{this.deleteDate(date)}}>
                    <DeleteIcon fontSize='small'/>
                </IconButton>
            </div>
        );
        datePost.push(newDate);
        this.setState({ schedule, datePost })
    }

    /**
     * Create the cards of stream and share
     * @returns Cards element
     */
    private makeCard() : any{
        const stream: any = this.props.tweetCollection.stream;
        const share: any = this.props.tweetCollection.share;
        const cards = [];
        if(stream) {
            const card = (
                <Card key={"streamCard"} data-testid="streamCard" style={{ margin: 20 }}>
                    <CardHeader title="Stream: "/>
                    <CardContent>
                        <Typography>Keywords: {stream.keywords} </Typography>
                        <Typography>Author: {stream.author} </Typography>
                        <Typography>since: {moment(stream.since).format('DD/MM/YYYY HH:mm')} </Typography>
                        <Typography>until: {moment(stream.until).format('DD/MM/YYYY HH:mm')} </Typography>
                    </CardContent>
                </Card>
            );
            cards.push(card);
        }
        if(share && share.platforms.twitter) {
            const schedule: any = [];
            share.schedule.forEach((date: any, index: number) => {
                schedule.push(<li key={index}>{moment(date).format('DD/MM/YYYY HH:mm')}</li>)
            })
            const card = (
                <Card key={"shareCard"} data-testid="shareCard" style={{ margin: 20 }}>
                    <CardHeader title="Share: "/>
                    <CardContent>
                        <Typography> Twitter: {share.platforms.twitter.toString()} </Typography>
                        <Typography> Word Cloud: {share.objects.wordCloud.toString()} </Typography>
                        <Typography> Map: {share.objects.map.toString()} </Typography>
                        <Typography> Timeline: {share.objects.timeline.toString()} </Typography>
                        <Typography> Message: {share.message} </Typography>
                        <Typography> Schedule: </Typography> 
                        <ul style={{fontSize: "1rem", fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`, fontWeight: 400, lineHeight: 1.5, letterSpacing: "0.00938em", margin: 0}}>
                            {schedule}
                        </ul>
                    </CardContent>
                </Card>
            );
            cards.push(card);
        }
        return cards;
    }

    private activeStream(): boolean {
        const stream = this.props.tweetCollection.stream;
        const share = this.props.tweetCollection.share;
        let value = false;
        if(stream){
            const until = moment(stream.until, 'YYYY-MM-DD[T]hh:mm');
            if(share && share.platforms){
                const schedule = share.schedule.map(date => moment(date));
                schedule.push(until);
                value = moment.max(schedule).isSameOrAfter(this.today()); 
            }
            else{
                value =  until.isSameOrAfter(this.today());
            }
        }
        return value;  
    }

    /**
     * Set the state of the switch switched
     * @param event The switch switched
     */
    private handleChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>) : void => {
        this.setState({...this.state, [event.target.name]: event.target.checked });
    };

    private handleCloseConfirmDialog = () => {
        this.setState({openConfirmDialog: false })
    }

    private handleOpenConfirmDialog = () => {
        this.setState({openConfirmDialog: true })
    }

    render(){
        const { classes } = this.props;
        return (
            <>
                <Dialog
                    open={this.state.openConfirmDialog}
                    onClose={this.handleCloseConfirmDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Warning</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure to start a Stream or a Share? You have to wait that all other Stream or Share finish before starting another one.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCloseConfirmDialog} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={async () => {this.handleCloseConfirmDialog(); await this.startStream()}} color="primary" autoFocus>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
                <Card style={{width: "60%"}}>
                    <Box className={classes.box}>
                        <TextField className={classes.field} type="text" id="keywords" label="Keywords"/>
                        <TextField className={classes.field} type="text" id="author" label="Author"/>
                    </Box>
                    <Box className={classes.box}>
                        <TextField
                            className={classes.field}
                            id="startDate"
                            label="Start Date"
                            type="datetime-local"
                            defaultValue={this.today()}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            className={classes.field}
                            id="endDate"
                            label="End Date"
                            type="datetime-local"
                            defaultValue={this.today()}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Box>
                    <Box className={classes.box}>
                        <FormControlLabel className={classes.field} control={<Switch checked={this.state.checkedTW} onChange={this.handleChangeSwitch} name="checkedTW" color="primary"/>} label={<TwitterIcon color="primary"/>} disabled={this.props.user && this.props.user.twitter ? false : true}/>
                    </Box>
                    <Box className={classes.box}>
                        <FormControlLabel className={classes.field} control={<Switch checked={this.state.checkedWordCloud} onChange={this.handleChangeSwitch} name="checkedWordCloud" color="primary"/>} label={<CloudIcon color="primary"/>} disabled={this.state.checkedTW ? false : true}/>
                        <FormControlLabel className={classes.field} control={<Switch checked={this.state.checkedMap} onChange={this.handleChangeSwitch} name="checkedMap" color="primary"/>} label={<MapIcon color="primary"/>} disabled={this.state.checkedTW ? false : true}/>
                        <FormControlLabel className={classes.field} control={<Switch checked={this.state.checkedTimeline} onChange={this.handleChangeSwitch} name="checkedTimeline" color="primary"/>} label={<TimelineIcon color="primary"/>} disabled={this.state.checkedTW ? false : true}/>
                    </Box>
                    <Box className={classes.box}>
                        <TextField  className={classes.field} id='message' label='Message in the tweet' variant={'outlined'} margin={'dense'} multiline={true} rows={3} style={{width: '80%'}} disabled={this.state.checkedTW ? false : true}/>
                    </Box>
                    <Box className={classes.box}>
                        <TextField
                            className={classes.field}
                            id='postDate'
                            label='Date to post'
                            type='datetime-local'
                            defaultValue={this.today()}
                            disabled={this.state.checkedTW ? false : true}
                            InputLabelProps={{ shrink: true }}
                        />
                        <IconButton className={classes.field} aria-label='add' onClick={this.addDate} disabled={this.state.checkedTW ? false : true}>
                            <AddIcon fontSize='small' />
                        </IconButton>
                        <div className={classes.postData}>
                            <Box display='block' displayPrint='none' m={1} overflow='auto' style={{maxHeight: '150px', minHeight: "30px"}}>
                                { this.state.checkedTW? this.state.datePost : null }
                            </Box>
                        </div>
                    </Box>
                    <Box className={classes.box}>
                        <Button id="streamButton" className={classes.field} size="large" color="primary" variant="contained" onClick={this.handleOpenConfirmDialog} disabled={this.activeStream()}>Start Stream</Button>
                    </Box>
                    { this.state.error ? <Notification severity="error" text={this.state.error} onClose={() => this.setState({ error: '' })}></Notification> : null }
                </Card>
                <Card style={{marginLeft: "auto", width: "35%"}}>
                    <Box key={"cards"} className={classes.box}>
                        {this.makeCard()}
                    </Box>
                </Card>
            </>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Stream);
