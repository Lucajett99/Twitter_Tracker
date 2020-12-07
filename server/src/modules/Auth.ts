import { Request, Response, Router } from 'express';
import { Module } from '../app/Router';
import User from './User';

@Module
export default abstract class Auth {
    public static setRoutes(router: Router): void {
        router.post('/login', (req: Request, res: Response) => {
            const username = req.body.username;
            const password = req.body.password;

            const user = User.getByUsername(username);
            if (!user.hasCredentials())
                user.setPassword(password);

            if (!user.checkPassword(password))
                res.status(401).send();
            else
                res.send({ token: user.generateAuthToken() });
        });
    }
}