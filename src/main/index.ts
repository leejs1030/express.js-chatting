require('./env'); // 환경변수
import { io, server } from './app'; // app
import { sessionmiddleware } from './middleware'; // session middleware. 소켓에서도 세션 확인하고자 사용.
import sharedsession from "express-socket.io-session";// 세션을 소켓에서 사용하여, id 위조의 가능성을 차단함.
import socket from 'socket.io';
import { initChattingListener } from './lib/socketcontrol';
const PORT = process.env.PORT || 4000; // 포트(환경변수 사용)
const { SESSION_SECRET, PROTOCOL } = process.env; // 환경변수


const channelPos = 2; // URI에서 "channels"가 등장하는 위치.
const isChannelURI = (URI: string[]) => (URI[channelPos] === 'channels'); // 채널 URI인지 확인하기.

// socket - express 간 세션 공유
io.use(
	(socket: socket.Socket, next: ((err?: any) => void)) =>
		sharedsession(sessionmiddleware(SESSION_SECRET as string, PROTOCOL as string))(socket as any, next)
);

io.on('connection', async (socket: socket.Socket) => {
	// 주소를 /단위로 끊어서 리스트로 저장. '' 문자열은 자동으로 제거됨.
	const URIs: string[] = (socket.handshake.headers.referer as string).split('/').filter(i => i);
	const roomnum = (isChannelURI(URIs)) ? parseInt(URIs[channelPos + 1]) : null;
	if(roomnum !== null) await initChattingListener(io, socket, roomnum);
});

server.listen(PORT, () => console.log(`protocol: ${PROTOCOL}\nport: ${PORT}`));