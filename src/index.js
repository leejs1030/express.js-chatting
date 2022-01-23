require('./env');
const {app, sessionmiddleware} = require('./app');
const {ChannelDAO} = require('./DAO');
const socketcontrol = require('./lib/socketcontrol');

const port = process.env.PORT || 4000;

const io = app.get('socketio');
const server = app.get('server');

const channelPos = 2;
const isChannelURI = (URI) => (URI[channelPos] == 'channels');


io.use((socket, next) => {
	sessionmiddleware(socket.request, {}, next);
});
io.on('connection', async (socket) => {
	let roomnum = socket.handshake.headers.referer.split('/').filter((i) => i);
	// console.log(roomnum);
	if(isChannelURI(roomnum)) roomnum = roomnum[channelPos + 1];
	// console.log(roomnum);

	socketcontrol.initialJoinRoom(socket, roomnum);

	socket.on('new msg', async (receiveData) => { socketcontrol.receiveAndSend(io, receiveData, roomnum); });
	socket.on('read', async (uid) =>{ return await ChannelDAO.readMsgFromChannel(uid, roomnum); });
	socket.on('disconnect', () => { socket.removeAllListeners(); });
	socket.on('invite', (targetId) => { socketcontrol.inviteFriend(io, socket, roomnum, targetId); });
	socket.on('join to', _ => { socketcontrol.initialJoinRoom(socket, roomnum); });
});

server.listen(port, () => {
	console.log(`listening on port ${port}`);
});