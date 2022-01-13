const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const controller = require('./controller');
const { errorHandler } = require('./lib/error-handler');
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, MODE, SESSION_SECRET } = process.env;
const app = express();

const http = require('http');
const server = http.createServer(app);
// const { Server } = require("socket.io");
const io = new require("socket.io")(server);


app.set('views', `${__dirname}/../views`);
app.set('view engine', 'pug');
app.set('socketio', io);
app.set('server', server);

app.use('/scripts', express.static(`${__dirname}/../public/scripts`));
app.use('/styles', express.static(`${__dirname}/../public/styles`));
// app.use('/modules', express.static(`${__dirname}/../node_modules`));

app.use(morgan(MODE !== 'prod' ? 'dev' : 'combined'));
app.use(express.urlencoded({ extended: true }));

let PostgreSqlStore = require('connect-pg-simple')(session);

app.use(session({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	store : new PostgreSqlStore({
        conString: `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
      }),
	cookie: {maxAge: null},
	resave: false,
	// cookie: { maxAge: 5 * 1000 },
}));

// app.use((req, res, next) => {
// });

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



module.exports = {server, io, app};
