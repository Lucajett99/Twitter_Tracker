import User from '../../modules/User';

declare global {
    export namespace Express {
        export interface Request {
            user: User;
        }
    }
}