import 'mocha';
import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import Config from '../../src/app/Config';
import Constants from '../../src/config/Constants.json';

describe('Config', () => {
    const environmentsDir = path.join(__dirname, '..', '..', 'src', 'config', 'environments');
    it('should load environment variables', () => {
        const env: any = {};
        for (const reqEnvVar of Constants.requiredEnvVars)
            env[reqEnvVar] = 'TEST';
        env.TEST = 'TEST';
        const testEnvPath = path.join(environmentsDir, 'test1.json');
        fs.writeFileSync(testEnvPath, JSON.stringify(env));
        process.env.NODE_ENV = 'test1';
        Config.init();
        for (const reqEnvVar of Constants.requiredEnvVars)
            expect(process.env).to.have.property(env[reqEnvVar], 'TEST');
        expect(process.env).to.have.property('TEST', 'TEST');
        fs.unlinkSync(testEnvPath);
        process.env.NODE_ENV = 'development';
    });
    it('should throw error if a required environment variable is missing', () => {
        const env: any = {};
        for (const reqEnvVar of Constants.requiredEnvVars.slice(1))
            env[reqEnvVar] = 'TEST';
        const testEnvPath = path.join(environmentsDir, 'test2.json');
        fs.writeFileSync(testEnvPath, JSON.stringify(env));
        process.env.NODE_ENV = 'test2';
        delete process.env[Constants.requiredEnvVars[0]];
        expect(Config.init).to.throw();
        fs.unlinkSync(testEnvPath);
        process.env.NODE_ENV = 'development';
    });
    it ('should build the working folder structure', () => {
        const rootDir = path.join(__dirname, '..', '..', 'src');
        for (const folder of Constants.folders)
            expect(fs.existsSync(path.join(rootDir, folder))).to.be.true;
    });
});