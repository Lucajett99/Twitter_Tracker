import 'mocha';
import { expect } from 'chai';
import express, { Express, Router } from 'express';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bodyParser from 'body-parser';
import url from 'url';
import querystring from 'querystring';
import moment from 'moment';
import Config from '../../src/app/Config';
import TwitterApi from '../../src/modules/TwitterApi';
import User from '../../src/modules/User';

chai.use(chaiHttp);
chai.should();

const sampleUser = { username: 'testTwitterApi', password: 'passwordTest' };

describe('TwitterApi', () => {
    let app: Express;
    let token: string;
    let user: User;
    let oauthToken: string;

    before(() => {
        Config.init();
        const router = Router();
        router.use(bodyParser.json());
        TwitterApi.setRoutes(router);
        app = express();
        app.use(router);
        user = User.getByUsername(sampleUser.username);
        token = user.generateAuthToken();
    })
    it('should return the oauth url when user attempts Twitter login', async () => {
        const oauthUrl = await TwitterApi.twitterLoginAndGetRedirectUrl(user);
        const { protocol, host, query, pathname } = url.parse(oauthUrl);
        expect(protocol).to.equal('https:');
        expect(host).to.equal('api.twitter.com');
        expect(pathname).to.equal('/oauth/authenticate');
        expect(query).to.exist;
        const params = querystring.parse(query!);
        expect(params).to.have.property('oauth_token');
        const { oauth_token } = params;
        expect(oauth_token).not.to.be.empty;
        oauthToken = oauth_token as string;
    });
    it('should throw error when attempting to log a mock user in Twitter', async () => {
        const spy = chai.spy();
        try {
            await TwitterApi.completeTwitterLogin(user, { oauth_token: oauthToken, oauth_verifier: '' });
        } catch(err) {
            spy();
        }
        expect(spy).to.have.been.called;
    });
    describe('checkParams(params: ISearchParams)', () => {
        it('should throw error if both `keywords` and `author` are missing from params', () => {
            const params = {
                since: moment().toDate(),
                until: moment().toDate()
            };
            expect(() => TwitterApi.checkParams(params)).to.throw();
        });
        it('should throw error if `since` is after `until`', () => {
            const params = {
                keywords: 'test',
                since: moment().toDate(),
                until: moment().subtract(1, 'hour').toDate()
            };
            expect(() => TwitterApi.checkParams(params)).to.throw();
        });
        it('should ckeck search params', () => {
            const params = {
                keywords: 'test',
                since: moment().toDate(),
                until: moment().add(1, 'hour').toDate()
            };
            expect(() => TwitterApi.checkParams(params)).not.to.throw();
        });
    });
    it('should build the query for Twitter API given search params', () => {
        const params = {
            keywords: 'test',
            author: 'DamianoScevola; TomasoneMarco',
            since: moment().toDate(),
            until: moment().add(5, 'hours').toDate(),
            lang: 'it'
        };
        const query = TwitterApi.getQuery(params);
        expect(query).to.equal('test+from:DamianoScevola+OR+from:TomasoneMarco+since:' +
            moment(params.since).format('YYYY-MM-DD[T]HH:mm:ss') + '+until:' +
            moment(params.until).format('YYYY-MM-DD[T]HH:mm:ss') + '+lang:it');
    });
    it('should return the Twitter user id given the username', async () => {
        const id = await TwitterApi.getUserId('DamianoScevola');
        expect(id).to.equal('1318469344691691520');
    });
    it('should return a filtered stream given search params', async () => {
        const params = {
            keywords: 'twitter',
            since: moment().toDate(),
            until: moment().add(10, 'seconds').toDate()
        };
        const stream = await TwitterApi.getFilteredStream(params);
        expect(stream).to.exist;
        const tweets: any[] = [];
        stream!.on('data', (data) => tweets.push(data));
        await new Promise<void>(resolve => setTimeout(() => {
            expect(tweets).not.to.be.empty;
            resolve();
        }, 2000));
    });
    describe('GET /tweets', () => {
        it('should return an array of tweets matching the given search params', (done) => {
            const params = {
                keywords: 'ingsw2020'
            };
            chai.request(app)
                .get('/tweets')
                .query(params)
                .send()
                .end((err, res) => {
                    expect(res.body.statuses).to.be.an('array');
                    expect(res.body.statuses.map((t: any) => t.text).join(' ')).to.match(/.*#ingsw2020.*/);
                    done();
                });
        });
    });
    describe('GET /trends', () => {
        it('should return worldwide trends if no location is specified', () => {});
        it('should return trends around a given location', () => {});
    });
});