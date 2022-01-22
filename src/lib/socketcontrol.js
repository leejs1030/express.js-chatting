const {isNumber} = require('../lib/usefulJS');
const {ChannelDAO, SocialDAO} = require('../DAO');

const initialJoinRoom = async (socket, roomnum) =>{
	if(isNumber(roomnum)) socket.join(roomnum);
	else{
		const temp = socket.request.session;
		socket.join(temp.user.id);
		const clist = (await ChannelDAO.getChannelsByUserId(temp.user.id));
		clist.forEach((e) => {
			socket.join(String(e.id));
		});
	}
}

const receiveAndSend = async (io, receiveData, roomnum) =>{
    const receiveTime = await ChannelDAO.sendMsg(receiveData.id, roomnum, receiveData.msg);
    const sendData = {
        id: receiveData.id,
        nick: receiveData.nick,
        channel: roomnum,
        msg: receiveData.msg,
        msg_date: receiveTime
    };
    return io.to(sendData.channel).emit(`update`, sendData);
}

const inviteFriend = async (io, socket, roomnum, targetId) =>{
    await SocialDAO.includeToChannel(roomnum, targetId);
    const channelInfo = (await ChannelDAO.getChannelInfoById(roomnum))[0];
    const unread = (await ChannelDAO.getChannelUnreadById(roomnum, targetId))[0].unread;
    io.to(targetId).emit(`invite`, {
        cid: roomnum,
        cname: channelInfo.name,
        cunread: unread,
        ctime: channelInfo.updatetime,
    });
}

module.exports = {
    initialJoinRoom,
    receiveAndSend,
    inviteFriend,
};