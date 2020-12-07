import User from '../../modules/User';

declare global {
    declare namespace Express {
        export interface Request {
            user: User;
        }
    }
}