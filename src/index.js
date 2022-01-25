require('./env');
const {app} = require('./app');
const {ChannelDAO} = require('./DAO');
const socketcontrol = require('./lib/socketcontrol');
const { sessionmiddleware } = require('./middleware');
const port = process.env.PORT || 4000;
const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME, SESSION_SECRET, MODE } = process.env;

const io = app.get('socketio');
const server = app.get('server');

const channelPos = 2;
const isChannelURI = (URI) => (URI[channelPos] == 'channels');


io.use((socket, next) => {
	sessionmiddleware(DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME, SESSION_SECRET)(socket.request, {}, next);
});
io.on('connection', async (socket) => {
	let roomnum = socket.handshake.headers.referer.split('/').filter((i) => i);
	if(isChannelURI(roomnum)) roomnum = roomnum[channelPos + 1];

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