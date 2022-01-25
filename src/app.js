const controller = require('./controller');
const { errorHandler } = require('./lib/error-handler');
const express = require('express');
const app = express();
const morgan = require('morgan');
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, MODE, SESSION_SECRET } = process.env;
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const { keepSignIn, sessionmiddleware, redirecter } = require('./middleware');



app.set('strict routing', true); // 왜? 제대로 동작하지 않음.
app.set('case sensitive routing', true);
app.set('views', `${__dirname}/../views`);
app.set('view engine', 'pug');
app.set('socketio', io);
app.set('server', server);

app.use('/scripts', express.static(`${__dirname}/../public/scripts`));
app.use('/styles', express.static(`${__dirname}/../public/styles`));

app.use(redirecter);
app.use(morgan(MODE !== 'prod' ? 'dev' : 'combined'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csrf({cookie: true}));
app.use(sessionmiddleware(DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME, SESSION_SECRET));
app.use(keepSignIn);
app.use(methodOverride('_method'));
app.use('/', controller);
app.use(errorHandler);
  


module.exports = {server, io, app};
