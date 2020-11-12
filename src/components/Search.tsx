import { TextField } from '@material-ui/core';
import * as React from 'react';
import SearchIcon from '@material-ui/icons/Search';

import Grid from '@material-ui/core/Grid';

export default class Header extends React.Component{
   
    render(){
        const style = {
        
            border:'solid',
            borderColor:'#a4cdd2',
            height:10 * screen.availHeight /100 + "px",
            backgroundColor:'#a4cdd2'
        
    }

    const attribute={
        height:'70%',
        width:'100%'
    }
    const attrGrid={
        width:"90%"
    }
        return <div style={style}>
                <Grid container spacing={1} alignItems="flex-end"  >
                <Grid item>
                    <SearchIcon/>
                 </Grid>
                    <Grid item style= {attrGrid}>
                        <TextField id="search" label="Search" style={attribute} />
                    </Grid>
                </Grid>
            </div>
    }
}
