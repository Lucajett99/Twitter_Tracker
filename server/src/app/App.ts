import express, { Application } from 'express';
import http, { Server } from 'http';
import Config from './Config';
import Router from './Router';

export default abstract class App {
    private static _app: Application;
    private static _server: Server;

    public static start(): Application {
        Config.init();
        App._app = express();
        Router.setup(App._app);
        App._server = http.createServer(App._app);
        App._server.listen(Config.port, () => {
            if (Config.environment === 'development')
                console.info(`Server listening on port ${Config.port}`);
        });
        return App._app;
    }

    public static get server() {
        return App._server;
    }

    public static stop(): void {
        App._server.close();
    }
}