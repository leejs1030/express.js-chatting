import session from 'express-session';
const PostgreSqlStore = require('connect-pg-simple')(session);
import db from './lib/dbconnection';
import {Request, Response} from 'express';

function setCookieHeader(req: Request, res: Response, next: Function): void {
	res.setHeader('Set-Cookie', 'SameSite=None; secure; httpOnly');
	next();
}

const sessionmiddleware = (SESSION_SECRET: string, PROTOCOL: string) => session({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	store : new PostgreSqlStore({ pgPromise: db, }),
	cookie: {maxAge: null,
		secure: (PROTOCOL === 'https'), //https라면 secure한 쿠키 사용. 아니라면 그냥 사용.
		httpOnly: true,
	},
});

function redirecter(req: Request, res: Response, next: Function): void { // /로 끝나면 리더렉션
	if (req.path.substring(-1) === '/' && req.path.length > 1) {
		const query = req.url.slice(req.path.length);
		const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');
		res.redirect(301, safepath + query);
	}
	else {
		next();
	}
}

const YEAR = 365 * 24 * 60 * 60 * 1000;
function keepSignIn(req: Request, res: Response, next: Function): void {
	// 만약 자동로그인 설정했다면, 세션 유효 기간을 현 시점으로부터 1년으로 갱신함.
	if (req.session.keepSignedIn) {
		req.session.resave = true;
		req.session.cookie.expires = new Date(Date.now() + YEAR);
		req.session.cookie.maxAge = YEAR;
	}
	next();
}

export {
	setCookieHeader,
    sessionmiddleware,
    redirecter,
    keepSignIn,
}