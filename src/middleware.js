const session = require('express-session');
const PostgreSqlStore = require('connect-pg-simple')(session);


const setCookieHeader = (req, res, next) =>{
	res.setHeader('Set-Cookie', 'SameSite=None; secure; httpOnly');
    next();
};

const sessionmiddleware = (DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME, SESSION_SECRET, PROTOCOL) => session({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	store : new PostgreSqlStore({
        conString: `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
	}),
	cookie: {maxAge: null,
		secure: (PROTOCOL === 'https'), //https라면 secure한 쿠키 사용. 아니라면 그냥 사용.
		httpOnly: true,
	},
	resave: false,
});

const redirecter = (req, res, next) =>{ // /로 끝나면 리더렉션
	if (req.path.substr(-1) === '/' && req.path.length > 1) {
		const query = req.url.slice(req.path.length);
		const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');
		res.redirect(301, safepath + query);
	}
	else {
		next();
	}
};

const YEAR = 365 * 24 * 60 * 60 * 1000;
const keepSignIn = (req, res, next) => { // 만약 자동로그인 설정했다면, 세션 유효 기간을 현 시점으로부터 1년으로 갱신함.
    if(req.session.keepSignedIn){
        req.session.resave = true;
        req.session.cookie.expires = new Date(Date.now() + YEAR);
        req.session.cookie.maxAge = YEAR;
    }
    next();
}

module.exports = {
	setCookieHeader,
    sessionmiddleware,
    redirecter,
    keepSignIn,
}