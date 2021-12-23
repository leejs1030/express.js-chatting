require('./env');
const {server, io} = require('./app');
const {ChannelDAO} = require('./DAO');

const port = process.env.PORT || 4000;
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);


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
		return io.emit('update', receivedData);
	});
	socket.on('read', async (uid, cid) =>{
		return ChannelDAO.readMsgFromChannel(uid, cid);
	});
});

server.listen(port, () => {
	console.log(`listening on port ${port}`);
});