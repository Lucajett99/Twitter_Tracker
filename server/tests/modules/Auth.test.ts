import 'mocha';
import bodyParser from 'body-parser';
import { expect } from 'chai';
import chai from 'chai';
import url from 'url';
import querystring from 'querystring';
import chaiHttp from 'chai-http';
import express, { Express, Router } from 'express';
import jwt from 'jsonwebtoken';
import Auth from '../../src/modules/Auth';
import Config from '../../src/app/Config';

chai.use(chaiHttp);
chai.should();

const user = { username: 'user1', password: 'password1' };

describe('Auth', () => {
    let app: Express;
    let token: string;
    let oauthToken: string;

    before(() => {
        Config.init();
        const router = Router();
        router.use(bodyParser.json());
        Auth.setRoutes(router);
        app = express();
        app.use(router);
    });

    describe('POST /auth/login', () => {
        it('should login with a new user', (done) => {
            chai.request(app)
                .post('/auth/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.have.property('token');
                    token = res.body.token;
                    const data: any = jwt.verify(token, Config.jwtSecret);
                    expect(data.username).to.be.equal(user.username);
                    done();
                });
        });
        it('should log in with an existing user', (done) => {
            chai.request(app)
                .post('/auth/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.have.property('token');
                    token = res.body.token;
                    const data: any = jwt.verify(token, Config.jwtSecret);
                    expect(data.username).to.be.equal(user.username);
                    done();
                });
        });
        it('should throw unauthorized error with wrong password', (done) => {
            user.password += 'WRONG';
            chai.request(app)
                .post('/auth/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body).to.be.empty;
                    done();
                });
        });
    });

    describe('GET /auth/user', () => {
        it('should return info about the authenticated user', (done) => {
            chai.request(app)
                .get('/auth/user')
                .auth(token, { type: 'bearer' })
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.have.property('username', user.username);
                    expect(res.body.twitter).to.be.false;
                    expect(res.body).not.to.have.property('password');
                    done();
                });
        });
        it('should throw unauthorized error on wrong authorization header', (done) => {
            chai.request(app)
                .get('/auth/user')
                .auth(token + 'WRONG', { type: 'bearer' })
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
    });

    describe('GET /auth/twitter', () => {
        it('should return a valid oauth url', (done) => {
            chai.request(app)
                .get('/auth/twitter')
                .auth(token, { type: 'bearer' })
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.have.property('oauthUrl');
                    const { oauthUrl } = res.body;
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
                    done();
                });
        });
        it('should throw unauthorized error on wrong authorization header', (done) => {
            chai.request(app)
                .get('/auth/twitter')
                .auth(token + 'WRONG', { type: 'bearer' })
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
    });

    describe('POST /auth/twitter/logout', () => {
        it('should log the user out from Twitter if she is logged and return her info without credentials', (done) => {
            chai.request(app)
                .post('/auth/twitter/logout')
                .auth(token, { type: 'bearer' })
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.have.property('username', user.username);
                    expect(res.body).to.have.property('twitter', false);
                    done();
                });
        });
        it('should throw unauthorized error on wrong authorization header', (done) => {
            chai.request(app)
                .post('/auth/twitter/logout')
                .auth(token + 'WRONG', { type: 'bearer' })
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
    });

    describe('GET /auth/twitter/success', () => {
        it('should not complete the Twitter login because it is a mock user', (done) => {
            const params = { oauth_token: oauthToken };
            chai.request(app)
                .get('/auth/twitter/success')
                .query(params)
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                })
        });
        it('should throw not found error on non-authenticating user', (done) => {
            const params = { oauth_token: oauthToken + 'WRONG' };
            chai.request(app)
                .get('/auth/twitter/success')
                .query(params)
                .end((err, res) => {
                    res.should.have.status(404);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });
    });
});