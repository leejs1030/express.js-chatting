import { user } from 'custom-type';
import session from 'express-session';
declare module "express-session" {
    interface Session {
        user?: user,
        keepSignedIn?: boolean,
        resave?: true,
    }
}