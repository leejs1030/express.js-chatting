require('./env');
const {app} = require('./app');
const {ChannelDAO} = require('./DAO');

const port = process.env.PORT || 4000;

const io = app.get('socketio');
const server = app.get('server');

io.on('connection', (socket) => {
	console.log('connected');
	socket.on('disconnect', () => {
		return console.log('disconnect');
	});
	socket.on('new msg', async (sendData) => {
		const receiveTime = await ChannelDAO.sendMsg(sendData.id, sendData.channel, sendData.msg);
		const receivedData = {
			id: sendData.id,
			nick: sendData.nick,
			channel: sendData.channel,
			msg: sendData.msg,
			stime: receiveTime
		};
		return io.emit(`update ${receivedData.channel}`, receivedData);
	});
	socket.on('read', async (uid, cid) =>{
		return ChannelDAO.readMsgFromChannel(uid, cid);
	});
});

server.listen(port, () => {
	console.log(`listening on port ${port}`);
});