import path from 'path';
import fs from 'fs';
import Constants from '../config/Constants.json';

export default abstract class Config {
    public static init(): void {
        Config.configEnvironment();
        Config.checkEnvVars();
        Config.initFolders();
    }

    private static configEnvironment() {
        const envVars = require(Config.environmentFilePath);
        for (const envVar in envVars)
            process.env[envVar] = envVars[envVar];
    }

    private static checkEnvVars() {
        for (const envVar of Constants.requiredEnvVars)
            if (!process.env[envVar])
                throw new Error(`Missing required environment variable ${envVar}`);
    }

    private static initFolders() {
        for (const folderPath of Constants.folders) {
            const folder = path.join(Config.rootDir, folderPath);
            if (!fs.existsSync(folder))
                fs.mkdirSync(folder);
        }
    }

    public static get environment() {
        return process.env.NODE_ENV || 'development';
    }

    public static get production() {
        return Config.environment === 'production';
    }

    public static get rootDir() {
        return path.join(__dirname, '..');
    }

    public static get configDir() {
        return path.join(Config.rootDir, 'config');
    }

    public static get environmentsDir() {
        return path.join(Config.configDir, 'environments');
    }

    private static get environmentFilePath() {
        return path.join(Config.environmentsDir, `${Config.production ? '' : Config.environment}.json`);
    }

    public static get modulesDir() {
        return path.join(Config.rootDir, 'modules');
    }

    public static get usersDir() {
        return path.join(Config.rootDir, 'users');
    }

    public static get port() {
        return process.env.PORT || Constants.port;
    }

    public static get origin() {
        return process.env.ORIGIN || Constants.origin;
    }

    public static get cors() {
        return {
            origin: Config.origin,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTION']
        };
    }

    public static get jwtSecret(): string {
        return process.env.JWT_SECRET!;
    }

    public static get whitelist(): string[] {
        return Constants.whitelist;
    }

    public static get saltRounds() {
        return Constants.saltRounds;
    }

    public static get bearerToken() {
        return process.env.BEARER_TOKEN;
    }

    public static get twitterApiUrl() {
        return Constants.twitterApiUrl;
    }
}