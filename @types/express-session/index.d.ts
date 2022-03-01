import session from 'express-session';
declare module "express-session" {
    interface Session {
      user?: {
        id: string,
        nick: string,
      },
      keepSignedIn?: boolean,
      resave?: true,
    }
}