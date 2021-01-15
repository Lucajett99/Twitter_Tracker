import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { IToken } from '@twitter-tracker/shared';
import User from '../modules/User';
import Config from './Config';

export interface Routable {
    setRoutes(router: Router): void;
}

const modules: { name: string, class: Routable }[] = [];
export const Module = <T extends Routable>(target: T) => {
    modules.push({ name: (target as any).name, class: target });
};

export default abstract class Router {
    public static setup(app: Application) {
        Router.configMiddlewares(app);
        Router.registerModules();
        Router.configModules(app);
        Router.configErrorHandling(app);
    }

    private static configMiddlewares(app: Application) {
        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(cors(Config.cors));
        app.use('/', express.static(Config.distDir));
    }

    private static registerModules() {
        const dir = fs.readdirSync(Config.modulesDir);
        const files = dir.filter(file => file.endsWith('.js') || file.endsWith('.ts'));
        for (const file of files)
            require(path.join(Config.modulesDir, file));
    }

    private static configModules(app: Application) {
        for (const module of modules) {
            const router = express.Router();
            module.class.setRoutes(router);
            app.use(router);
        }
    }

    private static configErrorHandling(app: Application) {
        app.use(Router.handleError);
    }

    public static auth(req: Request, res: Response, next: () => void) {
        if (!req.headers.authorization)
            return res.status(401).send({ error: 'Missing authorization header' });
        const auth = req.headers.authorization.split(' ');
        const type = auth[0];
        if (type !== 'Bearer')
            return res.status(401).send({ error: 'Wrong authorization type: only Bearer token is accepted' });
        const token = auth[1];
        try {
            if (!token)
                return res.status(401).send({ error: 'Missing Bearer token' });
            const { username } = jwt.verify(token, Config.jwtSecret) as IToken;
            req.user = User.getByUsername(username);
            next();
        } catch (err) {
            res.status(401).send({ error: 'Bad token' });
        }
    }

    private static handleError(err: Error, req: Request, res: Response, next: () => void) {
        console.error(err);
    }
}