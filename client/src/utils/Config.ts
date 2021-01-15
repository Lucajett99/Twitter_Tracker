export default abstract class Config {
    private static environmentVars: any;

    public static init() {
        if (process.env.NODE_ENV === 'production')
            Config.environmentVars = require('../environments/production.json');
        else
            Config.environmentVars = require('../environments/development.json');
    }

    public static get apiUrl(): string {
        return Config.environmentVars.API_URL;
    }
    public static get chunkSize(): number {
        return Config.environmentVars.CHUNK_SIZE;
    }
    public static get imageWidth(): number {
        return Config.environmentVars.IMAGE_WIDTH;
    }
    public static get imageHeight(): number {
        return Config.environmentVars.IMAGE_HEIGHT;
    }
}