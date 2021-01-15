import { TextField, Box, Theme, withStyles, IconButton, Card, Button } from '@material-ui/core';
import * as React from 'react';
import moment from 'moment';
import SearchIcon from '@material-ui/icons/Search';
import ifEnter from '../../utils/Enter';
import Notification from '../Notification';
import TweetCollection from '../../utils/TweetCollection';
import { ISearchParams } from '@twitter-tracker/shared';
import { AddCircle } from '@material-ui/icons';

interface FilterProps {
    classes: any;
    onFilter?: (params: ISearchParams) => void;
    collection : TweetCollection;
    filterCollection:TweetCollection;

}

interface FilterState {
    width: number;
    error: string;
    numberAuthor : number;
}


const styles = (theme: Theme) => ({
    searchParam: {
        marginBottom: theme.spacing(1)
    }
});


class Filter extends React.Component<FilterProps, FilterState> {

    private authorComponents : any;

    constructor(props: any) {
        super(props);
        this.state = {
            width: window.innerWidth,
            error: '',
            numberAuthor : 1,   
        };
        window.addEventListener('resize', this.update);
        this.authorComponents = [];
        const tweets = this.props.collection.getTweets();
        this.props.filterCollection.add(tweets);
        this.authorComponents.push(<><TextField type="text" id={"author_1"} label="Author" onKeyDown={ifEnter(this.filter)} /><br/></>);
    }

    private update = () => this.setState({ width: window.innerWidth });
    private today = () => moment().format('YYYY-MM-DD');
    private fiveDaysAgo = () => moment().subtract(5, 'd').format('YYYY-MM-DD');

    private addAuthors = () => {
        const number  = this.state.numberAuthor + 1;
        this.setState({numberAuthor : number });
        const id = `author_${number}`;
        this.authorComponents.push(<><TextField type="text" id={id} label="Author" onKeyDown={ifEnter(this.filter)} /><br/></>);

    }

    private filter = () => {
        const keywords: string = (document.getElementById('keywords') as HTMLInputElement).value;
        let author: string = (document.getElementById('author_1') as HTMLInputElement).value;
        const since: Date = new Date((document.getElementById('start') as HTMLInputElement).value);
        const until: Date = new Date((document.getElementById('end') as HTMLInputElement).value);
        const place :string = (document.getElementById('place') as HTMLInputElement).value;
        const lang: string = (document.getElementById('language') as HTMLInputElement).value;
        
        for(let i = 1 ; i < this.state.numberAuthor;i++){
            const authori = (document.getElementById(`author_${i + 1}`) as HTMLInputElement).value;
            author = author +` ; ${authori}`;
        }


        const params: ISearchParams = {
            keywords,
            author,
            since,
            until,
            place,
            lang
        };

       this.props.onFilter(params);

    }


    render() {
        const { classes } = this.props;
        return (
            <div style={{ width: '100%' }}>
                 <Card style={{backgroundColor:'#C9C9C9'}}>
                    <Box display="flex"  margin={2} flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                        <TextField className={classes.searchParam} type="text" id="keywords" label="Keywords" onKeyDown={ifEnter(this.filter)}/>
                        <div>
                            {this.authorComponents}
                        </div>
                        <Button onClick={this.addAuthors} startIcon={<AddCircle fontSize={'large'}/>}/>
                        
                        <TextField
                            id="start"
                            className={classes.searchParam}
                            label="Start Date"
                            type="date"
                            defaultValue={this.fiveDaysAgo()}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onKeyDown={ifEnter(this.filter)}
                        />
                        <TextField
                            id="end"
                            className={classes.searchParam}
                            label="End Date"
                            type="date"
                            defaultValue={this.today()}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onKeyDown={ifEnter(this.filter)}
                        />
                        <TextField className={classes.searchParam} type="text" id="place" label="State" onKeyDown={ifEnter(this.filter)}/>
                        <TextField className={classes.searchParam} type="text" id="language" label="Language" onKeyDown={ifEnter(this.filter)}/>
                        <IconButton onClick={this.filter}><SearchIcon /></IconButton>
                    </Box>
                </Card>
                { this.state.error ? <Notification severity="error" text={this.state.error} onClose={() => this.setState({ error: '' })}></Notification> : null}
            </div>
        );
        }
}

export default withStyles(styles, { withTheme: false })(Filter);