const controller = require('./controller');
const { errorHandler } = require('./lib/error-handler');
const express = require('express');
const app = express();
const morgan = require('morgan');
const session = require('express-session');
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, MODE, SESSION_SECRET } = process.env;
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const connectPgSimple = require('connect-pg-simple');
let PostgreSqlStore = require('connect-pg-simple')(session);

const sessionmiddleware = session({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	store : new PostgreSqlStore({
        conString: `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
      }),
	cookie: {maxAge: null},
	resave: false,
});


app.set('strict routing', true); // 왜? 제대로 동작하지 않음.
app.set('case sensitive routing', true);
app.set('views', `${__dirname}/../views`);
app.set('view engine', 'pug');
app.set('socketio', io);
app.set('server', server);
app.use('/scripts', express.static(`${__dirname}/../public/scripts`));
app.use('/styles', express.static(`${__dirname}/../public/styles`));
app.use((req, res, next) => { // 수동적으로 strict하게 redirect
	if (req.path.substr(-1) === '/' && req.path.length > 1) {
	  const query = req.url.slice(req.path.length);
	  const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');
	  console.log(query);
	  console.log(safepath);
	  res.redirect(301, safepath + query);
	}
	else {
	  next();
	}
});
app.use(morgan(MODE !== 'prod' ? 'dev' : 'combined'));
app.use(express.urlencoded({ extended: false }));



app.use(cookieParser());
app.use(csrf({cookie: true}));
app.use(sessionmiddleware);
const YEAR = 365 * 24 * 60 * 60 * 1000;
app.use(function (req, res, next) {
	if(req.session.keepSignedIn){
			req.session.resave = true;
			req.session.cookie.expires = new Date(Date.now() + YEAR);
			req.session.cookie.maxAge = YEAR;
	}
	next();
});
app.use('/', controller);
app.use(errorHandler);
  


module.exports = {server, io, app, sessionmiddleware};
