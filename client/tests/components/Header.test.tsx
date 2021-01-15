import React from 'react';
import {fireEvent, getByTestId, getByText, screen ,render} from '@testing-library/react';
import Header from '../../src/components/Header';
import Config from '../../src/utils/Config';

test('show title ',()=>{
    Config.init();
    const {queryByText} = render(<Header user={null} collection={null} userActionHandler={null} collectionActionHandler={null} onMobile={null}/>);
    const title = queryByText('Twitter Tracker');
    expect(title).toBeTruthy()
})
test('username on Header', ()=>{
    const userTest = {username : 'admin' , twitter : false}; 
    const {queryByText,getByText} = render(<Header user={userTest} collection={null} userActionHandler={null} collectionActionHandler={null} onMobile={false}/>);
    const username = getByText('admin');
    expect(username).toBeTruthy();
    const streamText = queryByText('Stream');
    expect(streamText).toBe(null);
});

test('do not show anything on Mobile', ()=>{
    const userTest = {username : 'admin' , twitter : false}; 
    const {queryByText,getByText} = render(<Header user={userTest} collection={null} userActionHandler={null} collectionActionHandler={null} onMobile={true}/>);
    const username = queryByText('admin');
    expect(username).toBe(null);
});