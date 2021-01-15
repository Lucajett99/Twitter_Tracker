import FacebookAuth from './FacebookAuth';
import TwitterAuth from './TwitterAuth';

export default interface IIndex {
    username: string;
    password: string;
    twitterAuth?: TwitterAuth;
    facebookAuth?: FacebookAuth;
}