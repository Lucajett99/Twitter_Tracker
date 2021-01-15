import React from 'react';
import {fireEvent, getByTestId, getByText, screen ,render} from '@testing-library/react';
import SaveFilter from '../../../src/components/tabs/SaveFilter';
import TweetCollection from '../../../src/utils/TweetCollection';
import { iteratee, rest } from "lodash";

describe('<SaveFilters/>',()=>{

    test('visualize button to Save in Cloud ',()=>{
        const tc : TweetCollection = new TweetCollection({name :"emptyCollection"});
        const {queryByText} = render(<SaveFilter save={null} filterCollection={tc} />);
        const ButtonCloud = queryByText('Save in Cloud');
        expect(ButtonCloud).toBe(null);
    });
    
    test('visualize button to Save in Local on FilterCollection empty',()=>{
        const tc : TweetCollection = new TweetCollection({name :"emptyCollection"});
        const {queryByText} = render(<SaveFilter save={null} filterCollection={tc} />);
        const ButtonLocal = queryByText('Save in Local');
        expect(ButtonLocal).toBe(null);
    });
   
    test('visualize button to Save in Cloud ',()=>{
        const tc : TweetCollection = new TweetCollection({name :"emptyCollection"});
        const tweets = {author : 'prova' , tweets : 'example tweet'};
        tc.add(tweets);
        const {queryByText} = render(<SaveFilter save={null} filterCollection={tc} />);
        const ButtonCloud = queryByText('Save in Cloud');
        expect(ButtonCloud).toBeTruthy();
    });
    
    test('visualize button to Save in Local on FilterCollection empty',()=>{
        const tc : TweetCollection = new TweetCollection({name :"emptyCollection"});
        const tweets = {author : 'prova' , tweets : 'example tweet'};
        tc.add(tweets);       
        const {queryByText} = render(<SaveFilter save={null} filterCollection={tc} />);
        const ButtonLocal = queryByText('Save in Local');
        expect(ButtonLocal).toBeTruthy();
   
    });

})