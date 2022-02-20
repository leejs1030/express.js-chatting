require('./env'); // 환경변수
const {app} = require('./app'); // app
const {ChannelDAO} = require('./DAO'); // dao
const socketcontrol = require('./lib/socketcontrol'); // socket
const { sessionmiddleware } = require('./middleware'); // session middleware. 소켓에서도 세션 확인하고자 사용.
// 세션을 소켓에서 사용하여, id 위조의 가능성을 차단함.
const port = process.env.PORT || 4000; // 포트(환경변수 사용)
const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME, SESSION_SECRET, MODE } = process.env; // 환경변수

const io = app.get('socketio'); // 소켓
const server = app.get('server'); // 서버

const channelPos = 2; // URI에서 "channels"가 등장하는 위치.
const isChannelURI = (URI) => (URI[channelPos] == 'channels'); // 채널 URI인지 확인하기.


io.use((socket, next) => {
	sessionmiddleware(DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME, SESSION_SECRET)(socket.request, {}, next); // 소켓에서 세션 사용.
});
io.on('connection', async (socket) => {
	let roomnum = socket.handshake.headers.referer.split('/').filter((i) => i); // 주소를 /단위로 끊어서 리스트로 저장.
	if(isChannelURI(roomnum)) roomnum = roomnum[channelPos + 1]; // 만약 채널 URI라면, roomnum을 스칼라 값(채널 ID)으로 설정.

	socketcontrol.initialJoinRoom(socket, roomnum); // 처음 소켓에 접속하면 접속 채널 등의 정보를 통해 적절한 room에 넣어줌.

	socket.on('new msg', async (receiveData) => { return await socketcontrol.receiveAndSend(io, receiveData, roomnum); });
	// 새 메시지를 누가 보내면, 서버에서 받아서 다른 사람들에게 전달. db도 수정함.
	socket.on('read', async (uid) =>{ return await ChannelDAO.readMsgFromChannel(uid, roomnum); });
	// 새 메시지를 읽으면, db에 읽었음을 확인.
	socket.on('disconnect', async () => { return await socket.removeAllListeners(); });
	socket.on('invite', async (targetId) => { return await socketcontrol.inviteFriend(io, socket, roomnum, targetId); });
	// 다른 사람을 채널에 초대 요청을 누가 보내면, 서버에서 받아서 해당 사람에게 알려줌.
	socket.on('join to', async () => { return await socketcontrol.initialJoinRoom(socket, roomnum); });
	// 새 채널에 초대받았다면, 새로운 룸에 접속시키기 위해서(해당 룸의 메시지를 봐야 하므로) 사용.
});

server.listen(port, () => {
	console.log(`listening on port ${port}`);
});