import React from 'react';
import {fireEvent, getByTestId, getByText, screen ,render, queryByTestId} from '@testing-library/react';
import { AppBar, Button, Dialog } from '@material-ui/core';


test('should pass', () => {
    expect(true).toBeTruthy()
});

test('show AppBar' , ()=>{
    const {queryByText} = render(<AppBar position="static" style={{ backgroundColor: "rgb(29, 161, 242)", marginTop:'1%'}}><Button size="large" variant="outlined" style={{color: 'white'}} onClick={null}>Download Image</Button></AppBar>)
    const test = queryByText('Download Image');
    expect(test).toBeTruthy();
})
