import * as React from 'react';
import TweetProvider from '../utils/TweetProvider';
import Header from './Header';
import Search from './Search';
import Tweet from './Tweet';

interface IProps {

};

interface IState {
    tweets: any[];
};

export default class App extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = { tweets: [] };
    }

    async componentDidMount() {
        console.log('Component did mount');
        const tweets = await TweetProvider.getRecent('election');
        this.setState({ tweets }, () => console.log('Updated state'));
    }

    render() {
        let file1 = JSON.stringify(this.state.tweets, undefined, 2);
        console.log(file1);
        return <div>
        <Header/> 
        <Search/>
        <Tweet  file={file1} />      
        </div>;
    }
}