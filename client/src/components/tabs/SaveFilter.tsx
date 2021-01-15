import * as react from 'react';
import React from 'react';
import { AppBar, Button, ListItemIcon, Tab, Tabs } from '@material-ui/core';
import {CloudUpload, GetApp, ThreeSixtyTwoTone } from '@material-ui/icons';
import TweetCollection from 'client/src/utils/TweetCollection';

// tslint:disable-next-line:no-empty-interface
interface SaveFilterProps{
    save : (tweetCollection : TweetCollection) => void
    filterCollection : TweetCollection
}

// tslint:disable-next-line:no-empty-interface
interface SaveFilterState{

}

export default class SaveFilter extends React.Component<SaveFilterProps, SaveFilterState> {
    constructor(props: any){
        super(props)
    }

    render(){   
        return  <div style={{position : 'absolute' ,right : '5px' ,bottom:'50%'}}>
                    {this.props.filterCollection.size() > 0 ?
                    <><Button onClick={()=>{this.props.filterCollection.download()}}>
                        <ListItemIcon>
                            <GetApp fontSize="small" />
                        </ListItemIcon>Save in Local</Button><br/>
                        <Button onClick={()=>{this.props.save(this.props.filterCollection)}}>
                        <ListItemIcon>
                        <CloudUpload fontSize="small" />
                        </ListItemIcon>Save in Cloud</Button>
                    </>:""}
                </div>
    }
}