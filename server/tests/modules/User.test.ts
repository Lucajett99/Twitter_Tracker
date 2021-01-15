import 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import * as _ from 'lodash';
import path from 'path';
import jwt from 'jsonwebtoken';
import User from '../../src/modules/User';
import Config from '../../src/app/Config';

const sampleUser = { username: 'testUser', password: 'testPassword' };
const userDir = path.join(Config.usersDir, sampleUser.username);
const samplesDir = path.join(__dirname, '..', '..', '..', 'samples');

describe('User', () => {
    let user: User;
    let samples: string[];
    const collections: string[] = [];

    before(() => {
        Config.init();
        samples = fs.readdirSync(samplesDir);
        fs.rmdirSync(userDir, { recursive: true });
    });
    it('should return user with the given username', () => {
        user = User.getByUsername(sampleUser.username);
        expect(user).to.exist;
        expect(user).to.have.property('username', sampleUser.username);
        expect(user instanceof User).to.be.true;
        expect(fs.existsSync(userDir)).to.be.true;
        expect(fs.existsSync(path.join(userDir, 'index.json'))).to.be.true;
        for (const sample of samples.slice(0, 3)) {
            fs.copyFileSync(path.join(samplesDir, sample), path.join(userDir, sample));
            collections.push(sample.split('.json')[0]);
        }
    });
    it('should return user info', () => {
        const info = user.info;
        expect(info).to.exist;
        expect(info.username).to.equal(sampleUser.username);
        expect(info.twitter).to.be.false;
    });
    it('should temporairly set user\'s oauth token and index user by it', () => {
        const oauthToken = 'testOauthToken';
        user.setOAuthToken(oauthToken);
        expect(User.getByOauthToken(oauthToken)).to.equal(user);
    });
    it('should return null when no user with given oauth token is present', () => {
        expect(User.getByOauthToken('INEXISTENT')).not.to.exist;
    });
    it('should return the user\'s tweet collections list', () => {
        const list = user.getTweetCollections();
        expect(_.differenceWith(list, collections)).to.be.empty;
    });
    it('should set the user\'s password and check it', () => {
        user.setPassword(sampleUser.password);
        expect(user.hasCredentials()).to.be.true;
        expect(user.checkPassword(sampleUser.password)).to.be.true;
    });
    it('should throw error if password is wrong', () => {
        expect(user.checkPassword(sampleUser.password + 'WRONG')).to.be.false;
    });
    it('should generate the authentication json web token', () => {
        const token = user.generateAuthToken();
        let decoded;
        expect(() => decoded = jwt.verify(token, Config.jwtSecret)).not.to.throw();
        expect(decoded).to.have.property('username', sampleUser.username);
    });
    it('should set Twitter access tokens', () => {
        const twitterAuth = {
            userId: '1234',
            userName: 'test',
            userToken: 'token',
            userTokenSecret: 'secret'
        };
        user.setTwitterAuth(twitterAuth);
        const index = JSON.parse(fs.readFileSync(path.join(userDir, 'index.json')).toString());
        expect(_.isEqual(index.twitterAuth, twitterAuth)).to.be.true;
    });
    it('should return tweet collection having given name', () => {
        const tweetCollection = user.loadTweetCollection(collections[0]);
        expect(tweetCollection).to.exist;
    });
    it('should return null if tweet collection having given name does not exist', () => {
        const tweetCollection = user.loadTweetCollection(samples[3]);
        expect(tweetCollection).not.to.exist;
    });
    it('should store tweet collection on file system', () => {
        const sampleCollection: any = {
            name: 'sample',
            tweets: [
                { text: 'test1', id: 1, id_str: '1' },
                { text: 'test2', id: 2, id_str: '2' }
            ]
        }
        user.storeTweetCollection('sample', sampleCollection);
        const tweetCollection = user.loadTweetCollection('sample');
        expect(JSON.stringify(tweetCollection)).to.equal(JSON.stringify(sampleCollection));
    });
    it('should delete tweet collection having given name', () => {
        user.deleteTweetCollection('sample');
        expect(user.getTweetCollections()).not.to.include('sample');
    });
    it('should remove Twitter access info from index file', () => {
        user.deleteTwitterAuth();
        const index = JSON.parse(fs.readFileSync(path.join(userDir, 'index.json')).toString());
        expect(index).not.to.have.property('twitterAuth');
    });
    after(() => {
        fs.rmdirSync(userDir, { recursive: true });
    });
});