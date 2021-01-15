declare module 'login-with-twitter' {
    export default class LoginWithTwitter {
        constructor(config: {consumerKey: string, consumerSecret: string, callbackUrl: string});
        public login(loginHandler: (err: Error, tokenSecret: string, url: string) => void);
        public callback(oauth: { oauth_token: string, oauth_verifier: string }, tokenSecret: string, callbackHandler: (err: Error, user: any) => void);
    }
}