require('./env');
const {app} = require('./app');
const {ChannelDAO} = require('./DAO');

const port = process.env.PORT || 4000;

const io = app.get('socketio');
const server = app.get('server');

const isNumber = (str) =>{
	let x = parseInt(str);
	if(isNaN(x)) return false;
	return true;
}

// const createchattingListner = (cid) =>{
// 	socket.o
// }


io.on('connection', (socket) => {
	let roomnum = socket.handshake.headers.referer.split('/');
	roomnum = roomnum[roomnum.length - 1];
	if(isNumber(roomnum)) socket.join(roomnum);
	
	console.log('connected');

	socket.on('disconnect', () => {
		return console.log('disconnect');
	});
	
	socket.on('new msg', async (receiveData) => {
		const receiveTime = await ChannelDAO.sendMsg(receiveData.id, roomnum, receiveData.msg);
		const sendData = {
			id: receiveData.id,
			nick: receiveData.nick,
			channel: roomnum,
			msg: receiveData.msg,
			stime: receiveTime
		};
		return io.to(sendData.channel).emit(`update`, sendData);
	});
	
	socket.on('read', async (uid) =>{
		return ChannelDAO.readMsgFromChannel(uid, roomnum);
	});
});

server.listen(port, () => {
	console.log(`listening on port ${port}`);
});