import 'mocha';
import express, { Express, Router } from 'express';
import bodyParser from 'body-parser';
import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import fs from 'fs';
import path from 'path';
import * as _ from 'lodash';
import moment from 'moment';
import Config from '../../src/app/Config';
import TweetCollection from '../../src/modules/TweetCollection';
import User from '../../src/modules/User';
import { doesNotMatch } from 'assert';

chai.use(chaiHttp);
chai.should();

const sampleCollection = {
    name: 'test',
    tweets: [],
    stream: {
        keywords: 'UNLIKELY_KEYWORD_78hg3ew8f747ge',
        since: moment().toDate(),
        until: moment().add(3, 'minutes').toDate()
    },
    share: {
        platforms: { twitter: true },
        objects: { wordCloud: true }
    }
};

const sampleTweets = [
    { text: 'test1', id: 1, id_str: '1' },
    { text: 'test2', id: 2, id_str: '2' },
    { text: 'test3', id: 3, id_str: '3' },
    { text: 'test4', id: 4, id_str: '4' },
    { text: 'test5', id: 5, id_str: '5' }
];
const user = { username: 'tweetCollectionUser', password: 'testPassword' };
const userDir = path.join(Config.usersDir, user.username);
const samplesDir = path.join(__dirname, '..', '..', '..', 'samples');

describe('TweetCollection', () => {
    let app: Express;
    let token: string;
    const collections: string[] = [];
    let samples: any[];

    before(() => {
        Config.init();
        const router = Router();
        router.use(bodyParser.json());
        TweetCollection.setRoutes(router);
        app = express();
        app.use(router);
        token = User.getByUsername(user.username).generateAuthToken();
        samples = fs.readdirSync(samplesDir);
        for (const sample of samples.slice(0, 3)) {
            fs.copyFileSync(path.join(samplesDir, sample), path.join(userDir, sample));
            collections.push(sample.split('.json')[0]);
        }
    });
    describe('GET /tweet-collections', () => {
        it('should return the tweet collection list of the user', (done) => {
            chai.request(app)
                .get('/tweet-collections')
                .auth(token, { type: 'bearer' })
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an('array');
                    for (const collection of collections)
                        expect(res.body).to.include(collection);
                    done();
                });
        });
        it('should throw an unauthorized error on wrong auth', (done) => {
            chai.request(app)
                .get('/tweet-collections')
                .send()
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
    });
    describe('PUT /tweet-collections/:name', () => {
        it('should throw error if trying to set share without a stream', (done) => {
            chai.request(app)
                .put('/tweet-collections/test')
                .auth(token, { type: 'bearer' })
                .send({ name: 'test', tweets: [], share: { platforms: { twitter: true }, objects: { wordCloud: true } } })
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.body).to.have.property('error');
                    done();
                });
                
        });
        it('should overwrite the tweet collection with request body', (done) => {
            chai.request(app)
                .put('/tweet-collections/test')
                .auth(token, { type: 'bearer' })
                .send(sampleCollection)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.have.property('name', 'test');
                    const file = fs.readFileSync(path.join(userDir, 'test.json'));
                    expect(file.toString()).to.equal(JSON.stringify(sampleCollection));
                    done();
                });
        });
        it('should throw an unauthorized error on wrong auth', (done) => {
            chai.request(app)
                .put('/tweet-collections/test')
                .send({ name: 'test', tweets: [] })
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
    });
    describe('POST /tweet-collections/:name/tweets', () => {
        it('should throw a not found error if tweet collection does not exist', (done) => {
            chai.request(app)
                .post('/tweet-collections/' + samples[3] + '/tweets')
                .auth(token, { type: 'bearer' })
                .send(sampleTweets)
                .end((err, res) => {
                    res.should.have.status(404);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
        it('should throw a bad request error if request body is not an array', (done) => {
            chai.request(app)
                .post('/tweet-collections/test/tweets')
                .auth(token, { type: 'bearer' })
                .send({ tweets: sampleTweets })
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
        it('should add tweets in request body to the tweet collection', (done) => {
            chai.request(app)
                .post('/tweet-collections/test/tweets')
                .auth(token, { type: 'bearer' })
                .send(sampleTweets)
                .end((err, res) => {
                    res.should.have.status(200);
                    const file = fs.readFileSync(path.join(userDir, 'test.json'));
                    const { tweets } = JSON.parse(file.toString());
                    expect(_.differenceWith(tweets, sampleTweets, _.isEqual)).to.be.empty;
                    done();
                });
        });
        it('should throw an unauthorized error on wrong auth', (done) => {
            chai.request(app)
                .post('/tweet-collections/test/tweets')
                .send([])
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
    });
    describe('GET /tweet-collections/:name/tweets', () => {
        it('should throw a not found error if tweet collection does not exist', (done) => {
            chai.request(app)
                .get('/tweet-collections/' + samples[3] + '/tweets')
                .auth(token, { type: 'bearer' })
                .send()
                .end((err, res) => {
                    res.should.have.status(404);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
        it('should return the entire tweets array if query is not specified', (done) => {
            chai.request(app)
                .get('/tweet-collections/test/tweets')
                .auth(token, { type: 'bearer' })
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(_.differenceWith(res.body, sampleTweets, _.isEqual)).to.be.empty;
                    done();
                });
        });
        it('should return the tweets array slice based on `from` and `to` params in query', (done) => {
            const from = 1;
            const to = 3;
            chai.request(app)
                .get('/tweet-collections/test/tweets')
                .query({ from, to })
                .auth(token, { type: 'bearer' })
                .send()
                .end((err, res) => {
                    expect(res.body.length).to.equal(to - from);
                    done();
                });
        });
        it('should throw an unauthorized error on wrong auth', (done) => {
            chai.request(app)
                .get('/tweet-collections/test/tweets')
                .send()
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
    });
    describe('GET /tweet-collections/:name', () => {
        it('should return the tweet collection info', (done) => {
            chai.request(app)
                .get('/tweet-collections/test')
                .auth(token, { type: 'bearer' })
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(JSON.stringify(_.omit(res.body, 'size'))).to.equal(JSON.stringify(_.omit(sampleCollection, 'tweets')));
                    done();
                });
        });
        it('should throw a not found error if tweet collection does not exist', (done) => {
            chai.request(app)
                .get('/tweet-collections/' + samples[3])
                .auth(token, { type: 'bearer' })
                .send()
                .end((err, res) => {
                    res.should.have.status(404);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
        it('should throw an unauthorized error on wrong auth', (done) => {
            chai.request(app)
                .get('/tweet-collections/test')
                .send()
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
    });
    describe('DELETE /tweet-collections/:name', () => {
        it('should delete the tweet collection and return its info', (done) => {
            chai.request(app)
                .delete('/tweet-collections/test')
                .auth(token, { type: 'bearer' })
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(JSON.stringify(_.omit(res.body, 'size'))).to.equal(JSON.stringify(_.omit(sampleCollection, 'tweets')));
                    expect(fs.existsSync(path.join(userDir, 'test.json'))).to.be.false;
                    done();
                })
        });
        it('should throw a not found error if tweet collection does not exist', (done) => {
            chai.request(app)
                .delete('/tweet-collections/' + samples[3])
                .auth(token, { type: 'bearer' })
                .send()
                .end((err, res) => {
                    res.should.have.status(404);
                    expect(res.body).to.have.property('error');
                    done();
                })
        });
        it('should throw an unauthorized error on wrong auth', (done) => {
            chai.request(app)
                .get('/tweet-collections/test')
                .send()
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
    });

    after(() => {
        fs.rmdirSync(path.join(userDir), { recursive: true });
    });
});