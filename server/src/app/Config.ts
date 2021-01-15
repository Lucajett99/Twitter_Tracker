import path from 'path';
import fs from 'fs';
import { CorsOptions } from 'cors';
import Constants from '../config/Constants.json';

export default abstract class Config {
    public static init(): void {
        Config.configEnvironment();
        Config.checkEnvVars();
        Config.initFolders();
    }

    private static configEnvironment() {
        if (fs.existsSync(Config.environmentFilePath)) {
            const envVars = require(Config.environmentFilePath);
            for (const envVar in envVars)
                process.env[envVar] = envVars[envVar];
        }
    }

    private static checkEnvVars() {
        for (const envVar of Constants.requiredEnvVars) {
            if (!process.env[envVar])
                throw new Error(`Missing required environment variable ${envVar}`);
        }
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

    public static get distDir() {
        return path.join(Config.rootDir, 'dist');
    }

    public static get port() {
        return process.env.PORT || Constants.port;
    }

    public static get origin() {
        return process.env.ORIGIN || Constants.origin;
    }

    public static get originWhitelist() {
        return [ Config.origin, ...Constants.originWhitelist ];
    }

    public static get cors() {
        const options: CorsOptions = {
            origin: Config.originWhitelist,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTION']
        };
        return options;
    }

    public static get jwtSecret(): string {
        return process.env.JWT_SECRET!;
    }

    public static get authWhitelist(): string[] {
        return Constants.authWhitelist;
    }

    public static get saltRounds() {
        return Constants.saltRounds;
    }

    public static get bearerToken() {
        return process.env.BEARER_TOKEN!;
    }

    public static get twitterApiUrl() {
        return Constants.twitterApiUrl;
    }

    public static get twitterStreamUrl() {
        return Constants.twitterStreamUrl;
    }

    public static get consumerKey() {
        return process.env.CONSUMER_KEY!;
    }

    public static get accessToken() {
        return process.env.ACCESS_TOKEN!;
    }

    public static get consumerSecret() {
        return process.env.CONSUMER_SECRET!;
    }

    public static get accessSecret() {
        return process.env.ACCESS_SECRET!;
    }

    public static get tweetBufferSize(): number {
        return Constants.tweetBufferSize;
    }

    public static get tagBlacklist(): string[] {
        return Constants.tagBlacklist;
    }

    public static get wordCloud() {
        return {
            width: Constants.wordCloud.width,
            height: Constants.wordCloud.height,
            padding: Constants.wordCloud.padding,
            font: Constants.wordCloud.font,
            scale: Constants.wordCloud.scale,
            maxWords: Constants.wordCloud.maxWords,
            minSize: Constants.wordCloud.minSize,
            maxSize: Constants.wordCloud.maxSize,
            type: 'image/png'
        }
    }

    public static get callbackUrl() {
        return Config.origin + Constants.callbackUrl;
    }

    public static get twitterRequestToken() {
        return Constants.twitterRequestToken;
    }

    public static get chunkSize() {
        return Constants.chunkSize;
    }

    public static get maxStreamAttempts() {
        return Constants.maxStreamAttempts;
    }

    public static get streamIntervalTime() {
        return Constants.streamIntervalTime;
    }

    public static get maxTweetsForWordCloud() {
        return Constants.maxTweetsForWordCloud;
    }
}