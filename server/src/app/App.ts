import express, { Application } from 'express';
import http, { Server } from 'http';
import Config from './Config';
import Router from './Router';

export default abstract class App {
    private static app: Application;
    private static server: Server;

    public static start(): Application {
        Config.init();
        App.app = express();
        Router.setup(App.app);
        App.server = http.createServer(App.app);
        App.server.listen(Config.port, () => console.info(`Server listening on port ${Config.port}`));
        return App.app;
    }

    public static stop(): void {
        App.server.close();
    }
}