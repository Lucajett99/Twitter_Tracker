import { TextField} from '@material-ui/core';
import * as React from 'react';
import { Moment } from 'moment';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import { SearchParams } from '../utils/Interfaces';
import { Button } from '@material-ui/core';
import { IconButton } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import { RotateLeft } from '@material-ui/icons';

interface SProps {
    onSearch?: (params: SearchParams) => Promise<void>;
    save: any;
    reset: any;
}

export default class Search extends React.Component<SProps> {
    
    constructor(props: any) {
        super(props);
    }

    private today = () => moment().format('YYYY-MM-DD');
    private fiveDaysAgo = () => moment().subtract(5, 'd').format('YYYY-MM-DD');

    private keyDown = (event: any) => {
        const ENTER = 13;
        if (event.keyCode == ENTER)
            this.search();
    }
    
    private search = () => {
        const keywords: string = (document.getElementById('keywords') as HTMLInputElement).value;
        const author: string = (document.getElementById('author') as HTMLInputElement).value;
        const since: Date = new Date((document.getElementById('start') as HTMLInputElement).value);
        const until: Date = new Date((document.getElementById('end') as HTMLInputElement).value);

        if (!keywords && !author) {
            alert('Keywords or author must be specified in order to perform a search');
            return;
        }
        
        const params: SearchParams = {
            keywords,
            author,
            since,
            until
        };

        this.props.onSearch(params);
    }
   
    render() {
        const style = {
            border: 'solid',
            borderColor: 'rgb(164, 205, 226)',
            height: 10 * screen.availHeight /100 + 'px',
            backgroundColor: 'rgb(164, 205, 226)'
        };

        const attribute = {
            height: '40%',
            width: '80%',
            margin: '12px',
        };

        const attrGrid={
            width: '50%'
        };
  
        return (
            <div style={style}>
                <Grid container spacing={0}>
                    <Grid item xs={2}>
                        <TextField type='text' id='keywords' label='Keywords' style={attribute} onKeyDown={this.keyDown}/>
                    </Grid>
                    <Grid item xs={2}>
                        <TextField type='text' id='author' label='Author' style={attribute} onKeyDown={this.keyDown}/>
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            id="start"
                            label="Start Date"
                            type="date"
                            style={attribute}
                            defaultValue={this.fiveDaysAgo()}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onKeyDown={this.keyDown}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            id="end"
                            label="End Date"
                            type="date"
                            style={attribute}
                            defaultValue={this.today()}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onKeyDown={this.keyDown}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button color="inherit" variant="contained" style={attribute} startIcon={<SaveIcon/>} onClick={this.props.save}>Save</Button>
                    </Grid>
                    <Grid item xs={2}>
                        <Button color="inherit" variant="contained" style={attribute} startIcon={<RotateLeft/>} onClick={this.props.reset}>Reset</Button>
                    </Grid>
                </Grid>
            </div>
        );
        }
}
