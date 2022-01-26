const controller = require('./controller');
const { errorHandler } = require('./lib/error-handler');
const express = require('express');
const morgan = require('morgan');
// const http = require('http');
// const https = require('https');
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, MODE, SESSION_SECRET, PROTOCOL, SSL_KEY, SSL_CERT } = process.env;
const http = require(PROTOCOL); //PROTOCOL이 http라면 http로, https라면 https로 실행한다.
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const { keepSignIn, sessionmiddleware, redirecter, setCookieHeader } = require('./middleware');
const methodOverride = require('method-override');
const fs = require('fs');


const key = fs.readFileSync(SSL_KEY);
const cert = fs.readFileSync(SSL_CERT);

const app = express();
const server = http.createServer({key, cert}, app);
const io = new require("socket.io")(server);

app.set('strict routing', true); // 왜? 제대로 동작하지 않음.
app.set('case sensitive routing', true);
app.set('views', `${__dirname}/../views`);
app.set('view engine', 'pug');
app.set('socketio', io);
app.set('server', server);

app.use('/scripts', express.static(`${__dirname}/../public/scripts`));
app.use('/styles', express.static(`${__dirname}/../public/styles`));


app.use(setCookieHeader);
app.use(redirecter);
app.use(morgan(MODE !== 'prod' ? 'dev' : 'combined'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csrf({cookie: true}));
app.use(sessionmiddleware(DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME, SESSION_SECRET, PROTOCOL));
app.use(keepSignIn);
app.use(methodOverride('_method'));
app.use('/', controller);
app.use(errorHandler);
  


module.exports = {server, io, app};
