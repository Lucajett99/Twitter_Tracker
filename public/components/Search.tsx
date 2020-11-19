import { FormControlLabel, FormLabel, RadioGroup, TextField } from '@material-ui/core';
import * as React from 'react';
import SearchIcon from '@material-ui/icons/Search';

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl/FormControl';
import { Radio } from '@material-ui/core';

export default class Header extends React.Component{
   
    render(){
        const style = {
        
            border:'solid',
            borderColor:'#a4cdd2',
            height:10 * screen.availHeight /100 + "px",
            backgroundColor:'#a4cdd2'
        
    }

    const attribute={
        height:'40%',
        width:'100%'
    }
    const attrGrid={
        width:"50%"
    }
    const sRadio={
        top:'10px',
        left:'75px'
    }
        return <div style={style}>
                <Grid container spacing={1} alignItems="flex-end"  >
                <Grid item>
                    <SearchIcon/>
                 </Grid>
                    <Grid item style= {attrGrid}>
                        <TextField id="search" label="Search" style={attribute} />
                    </Grid>

                    <FormControl component="fieldset" style={sRadio}>
                        <FormLabel component="legend">Filter By:</FormLabel>
                        <RadioGroup row aria-label="position" name="position" defaultValue="top">
                            <FormControlLabel
                            value="top"
                            control={<Radio color="primary" />}
                            label="Keywords"
                            labelPlacement="start"
                            />
                            <FormControlLabel
                            value="start"
                            control={<Radio color="primary" />}
                            label="Geolocalization"
                            labelPlacement="start"
                            />
                            <FormControlLabel
                            value="bottom"
                            control={<Radio color="primary" />}
                            label="Authors"
                            labelPlacement="start"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </div>
    }
}
