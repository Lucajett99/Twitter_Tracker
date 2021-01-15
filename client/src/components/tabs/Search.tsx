import { TextField, Box, Theme, withStyles, IconButton, Card, Button } from '@material-ui/core';
import * as React from 'react';
import moment from 'moment';
import SearchIcon from '@material-ui/icons/Search';
import ifEnter from '../../utils/Enter';
import Notification from '../Notification';
import TweetCollection from '../../utils/TweetCollection';
import { ISearchParams } from '@twitter-tracker/shared';
import { AddCircle } from '@material-ui/icons';
import { number } from '@amcharts/amcharts4/core';

interface SearchProps {
    classes: any;
    onSearch?: (params: ISearchParams) => Promise<void>;
    collection : TweetCollection;
}

interface SearchState {
    width: number;
    error: string;
    numberAuthor : number;
}


const styles = (theme: Theme) => ({
    searchParam: {
        marginBottom: theme.spacing(1)
    }
});


class Search extends React.Component<SearchProps, SearchState> {

    authorComponents : any;

    constructor(props: any) {
        super(props);
        this.state = {
            width: window.innerWidth,
            error: '',
            numberAuthor : 1,
        };
        window.addEventListener('resize', this.update);
        this.authorComponents = [];
        this.authorComponents.push(<><TextField key={"author_1"} type="text" id={"author_1"} label="Author" onKeyDown={ifEnter(this.search)} /><br/></>);
    }

    private update = () => this.setState({ width: window.innerWidth });
    private today = () => moment().format('YYYY-MM-DD');
    private fiveDaysAgo = () => moment().subtract(5, 'd').format('YYYY-MM-DD');

    private addAuthors = () => {
        const num  = this.state.numberAuthor + 1;
        this.setState({ numberAuthor: num });
        const id = `author_${num}`;
        this.authorComponents.push(<><TextField key={id} type="text" id={id} label="Author" onKeyDown={ifEnter(this.search)} /><br/></>);

    }
    private search = () => {
        const keywords: string = (document.getElementById('keywords') as HTMLInputElement).value;
        let author: string = (document.getElementById('author_1') as HTMLInputElement).value;
        const since: Date = new Date((document.getElementById('start') as HTMLInputElement).value);
        const until: Date = new Date((document.getElementById('end') as HTMLInputElement).value);
        const place: string = (document.getElementById('place') as HTMLInputElement).value;
        const radius: string = (document.getElementById('radius') as HTMLInputElement).value;
        const lang : string =(document.getElementById('lang') as HTMLInputElement).value;
        for(let i = 1 ; i < this.state.numberAuthor;i++){
            const authori = (document.getElementById(`author_${i + 1}`) as HTMLInputElement).value;
            author = author +` ; ${authori}`;
        }

        if (!keywords && !author) {
            this.setState({ error: 'Specify either keywords or author to start the search'});
            return;
        }

        const params: ISearchParams = {
            keywords,
            author,
            since,
            until,
            place,
            radius,
            lang
        };
        if (this.props.onSearch)
            this.props.onSearch(params);
    }

    render() {
        const { classes } = this.props;
        return (
            <div style={{ width: '100%' }}>
                 <Card>
                    <Box display="flex" margin={2} flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                        <TextField className={classes.searchParam} type="text" id="keywords" label="Keywords" onKeyDown={ifEnter(this.search)}/>
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
                            onKeyDown={ifEnter(this.search)}
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
                            onKeyDown={ifEnter(this.search)}
                        />
                        <TextField className={classes.searchParam} type="text" id="place" label="Place" onKeyDown={ifEnter(this.search)}/>
                        <TextField className={classes.searchParam} type="number" id="radius" label="Radius" onKeyDown={ifEnter(this.search)}/>
                        <TextField className={classes.searchParam} type="text" id="lang" label="Language" onKeyDown={ifEnter(this.search)}/>
                        <IconButton onClick={this.search}><SearchIcon /></IconButton>
                    </Box>
                </Card>
                { this.state.error ? <Notification severity="error" text={this.state.error} onClose={() => this.setState({ error: '' })}></Notification> : null}
            </div>
        );
        }
}

export default withStyles(styles, { withTheme: true })(Search);