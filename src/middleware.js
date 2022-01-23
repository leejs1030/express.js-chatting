const session = require('express-session');
const PostgreSqlStore = require('connect-pg-simple')(session);


const sessionmiddleware = (DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME, SESSION_SECRET) => session({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	store : new PostgreSqlStore({
        conString: `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
      }),
	cookie: {maxAge: null},
	resave: false,
});

const redirecter = (req, res, next) =>{
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
const keepSignIn = (req, res, next) => {
    if(req.session.keepSignedIn){
        req.session.resave = true;
        req.session.cookie.expires = new Date(Date.now() + YEAR);
        req.session.cookie.maxAge = YEAR;
    }
    next();
}

module.exports = {
    sessionmiddleware,
    redirecter,
    keepSignIn,
}