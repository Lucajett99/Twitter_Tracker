import 'mocha';
import { expect } from 'chai';
import App from '../../src/app/App';

describe('App', () => {
    it('should start and return the app instance', () => {
        const app = App.start();
        expect(app).to.exist;
        const server = App.server;
        expect(server.listening).to.be.true;
    });
    it('should stop the app server from listening', () => {
        App.stop();
        expect(App.server.listening).to.be.false;
    });
});