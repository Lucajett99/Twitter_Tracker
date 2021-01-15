import express, { Request, Response } from 'express';
import Router from '../app/Router';
import Config from '../app/Config';
import { Module } from '../app/Router';
import TwitterApi from './TwitterApi';
import User from './User';

@Module
export default abstract class Auth {
    public static setRoutes(router: express.Router): void {
        router.post('/auth/login', async (req: Request, res: Response) => {
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

        router.get('/auth/user', Router.auth, async (req: Request, res: Response) => {
            const user = req.user;
            res.send(user.info);
        });

        router.get('/auth/twitter', Router.auth, async (req: Request, res: Response) => {
            const username = req.user.username;
            const user: User = User.getByUsername(username);
            const oauthUrl = await TwitterApi.twitterLoginAndGetRedirectUrl(user);
            res.send({ oauthUrl });
        });

        router.post('/auth/twitter/logout', Router.auth, async (req: Request, res: Response) => {
            const username = req.user.username;
            const user: User = User.getByUsername(username);
            user.deleteTwitterAuth();
            res.send(user.info);
        });

        router.get('/auth/twitter/success', async (req: Request, res: Response) => {
            const oauthToken = req.query.oauth_token?.toString()!;
            const oauthVerifier = req.query.oauth_verifier?.toString()!;
            const user: User | null = User.getByOauthToken(oauthToken);
            if (!user)
                return res.status(404).send({ error: 'User with the given oauth_token not found' });
            const oauth = {
                oauth_token: oauthToken,
                oauth_verifier: oauthVerifier
            };
            try {
                await TwitterApi.completeTwitterLogin(user, oauth);
                res.redirect(Config.origin);
            } catch (err) {
                res.status(401).send({ error: 'Twitter did not allow authentication' });
            }
        });
    }
}