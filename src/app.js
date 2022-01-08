const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const controller = require('./controller');
const { errorHandler } = require('./lib/error-handler');
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, MODE, SESSION_SECRET } = process.env;
const app = express();



app.set('views', `${__dirname}/../views`);
app.set('view engine', 'pug');

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
	cookie: {maxAge : 10 * 1000}, //60 * 60 * 1000},
	// cookie: {maxAge: null},
	// cookie: { maxAge: 5 * 1000 },
}));

// app.use((req, res, next) => {
// });

app.use(function (req, res, next) {
	if(req.session.keepSignedIn){
			req.session.cookie.expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
			req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000;
			console.log(req.session);
	}
	next();
});
app.use('/', controller);
app.use(errorHandler);


const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

module.exports = {server, io};
