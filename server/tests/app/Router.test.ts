import 'mocha';
import express, { Express } from 'express';
import chai, { expect } from 'chai';
import spies from 'chai-spies';
import Config from '../../src/app/Config';
import Router from '../../src/app/Router';
import User from '../../src/modules/User';

chai.use(spies);

const user = { username: 'test', password: 'test' };

const routes = [
    'POST /auth/login',
    'GET /auth/user',
    'GET /auth/twitter',
    'POST /auth/twitter/logout',
    'GET /auth/twitter/success',
    'GET /tweet-collections',
    'PUT /tweet-collections/:name',
    'POST /tweet-collections/:name/tweets',
    'GET /tweet-collections/:name/tweets',
    'GET /tweet-collections/:name',
    'DELETE /tweet-collections/:name',
    'GET /tweets',
    'GET /trends'
];

describe('Router', () => {
    let app: Express;
    let token: string;

    before(() => {
        Config.init();
        app = express();
        Router.setup(app);
        token = User.getByUsername(user.username).generateAuthToken();
    });
    it('should setup all sub-routers for the app', () => {
        const listEndpoints = require('express-list-endpoints');
        const endpoints = listEndpoints(app);
        const exists = (route: any) => {
            const parts = route.split(' ');
            const method = parts[0];
            const path = parts[1];
            return !!endpoints.find((r: any) => r.path === path && r.methods.includes(method));
        };
        for (const route of routes)
            expect(exists(route)).to.be.true;
    });
    describe('auth middleware', () => {
        it('should throw an unauthorized error if authorization header is missing', () => {
            const req: any = {
                headers: { authorization: '' }
            };
            const send = chai.spy();
            const status = chai.spy((code: number) => ({ send }));
            const res: any = { status };
            const next = chai.spy();
            Router.auth(req, res, next);
            expect(status).to.have.been.called.with.exactly(401);
            expect(send).to.have.been.called.once;
            expect(next).not.to.have.been.called;
        });
        it('should throw an unauthorized error if authorization type is not bearer', () => {
            const req: any = {
                headers: { authorization: 'OAuth ' + token }
            };
            const send = chai.spy();
            const status = chai.spy((code: number) => ({ send }));
            const res: any = { status };
            const next = chai.spy();
            Router.auth(req, res, next);
            expect(status).to.have.been.called.with.exactly(401);
            expect(send).to.have.been.called.once;
            expect(next).not.to.have.been.called;
        });
        it('should throw an unauthorized error if token is missing', () => {
            const req: any = {
                headers: { authorization: 'Bearer' }
            };
            const send = chai.spy();
            const status = chai.spy((code: number) => ({ send }));
            const res: any = { status };
            const next = chai.spy();
            Router.auth(req, res, next);
            expect(status).to.have.been.called.with.exactly(401);
            expect(send).to.have.been.called.once;
            expect(next).not.to.have.been.called;
        });
        it('should throw an unauthorized error if a bad token is provided', () => {
            const req: any = {
                headers: { authorization: 'Bearer ' + token + 'BAD' }
            };
            const send = chai.spy();
            const status = chai.spy((code: number) => ({ send }));
            const res: any = { status };
            const next = chai.spy();
            Router.auth(req, res, next);
            expect(status).to.have.been.called.with.exactly(401);
            expect(send).to.have.been.called.once;
            expect(next).not.to.have.been.called;
        });
        it('should set the request user and call next request handler', () => {
            const req: any = {
                headers: { authorization: 'Bearer ' + token }
            };
            const send = chai.spy();
            const status = chai.spy((code: number) => ({ send }));
            const res: any = { status };
            const next = chai.spy();
            Router.auth(req, res, next);
            expect(status).not.to.have.been.called;
            expect(send).not.to.have.been.called;
            expect(next).to.have.been.called.with.exactly();
            expect(req.user).to.exist.and.have.property('username', user.username);
        });
    });
});