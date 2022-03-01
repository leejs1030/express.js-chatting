import controller from './controller';
import { errorHandler } from './lib/error-handler';
import Express from 'express';
import morgan from 'morgan';
const { MODE, SESSION_SECRET, PROTOCOL, SSL_KEY, SSL_CERT } = process.env;
const http = require(PROTOCOL); //PROTOCOL이 http라면 http로, https라면 https로 실행한다.
import socket from 'socket.io';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import { keepSignIn, sessionmiddleware, redirecter, setCookieHeader } from './middleware';
import methodOverride from 'method-override';
import fs from 'fs';


const key = fs.readFileSync(SSL_KEY);
const cert = fs.readFileSync(SSL_CERT);

const app: Express.Application = Express();
const server: any = http.createServer({key, cert}, app);
const io: socket.Server = new socket.Server(server);

app.set('strict routing', true); // 맨 뒤에 / 오는 것 방지용
app.set('case sensitive routing', true); // 대소문자를 구분하기 위함
app.set('views', `${__dirname}/../../views`); // 뷰 엔진용
app.set('view engine', 'pug'); // 뷰 엔진용
app.set('socketio', io); // index.js에서 사용
app.set('server', server); // index.js에서 사용


app.use('/scripts', Express.static(`${__dirname}/../../public/scripts`)); // js 경로.
app.use('/styles', Express.static(`${__dirname}/../../public/styles`)); // css 경로.


app.use(setCookieHeader); // 보안적 이유로 쿠키 헤더 설정하는 미들웨어
app.use(redirecter); // 맨 뒤에 / 가 온다면, 아예 링크가 동작하지 않는 것보다는 리다이렉션이 좋을 것이란 판단.
app.use(morgan(MODE !== 'prod' ? 'dev' : 'combined')); // 로그를 남겨주는 미들웨어
app.use(Express.urlencoded({ extended: false })); // nested 쿼리 지원 X. 나중에 필요해지면 변경하는 것도 좋을 듯.
app.use(cookieParser()); // 쿠키-세션을 위함
app.use(sessionmiddleware(SESSION_SECRET, PROTOCOL)); // 쿠키-세션을 위함
app.use(keepSignIn); //로그인 상테 유지를 위한 미들웨어. 세션의 값을 보고 세션 유지 기한을 연장할지 말지 선택.
app.use(csrf({cookie: true})); // 보안상의 이유로 csrf 토큰 사용.
app.use(methodOverride('_method')); // GET/POST 이외의 메소드(PUT, DELETE)를 사용하기 위한 미들웨어
app.use('/', controller); // /로 들어오면 컨트롤러로 넘겨 줌.
app.use(errorHandler); // 에러를 보여주는 페이지. controller 에서 도중에 next(err);을 했을 때에 사용됨.
  


export {app};
