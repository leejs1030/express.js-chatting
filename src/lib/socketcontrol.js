const {isNumber} = require('../lib/usefulJS');
const {ChannelDAO, SocialDAO} = require('../DAO');

const initialJoinRoom = async (socket, roomnum) =>{
    try{
        if(isNumber(roomnum)) socket.join(roomnum);
        else{
            const temp = socket.request.session;
            socket.join(temp.user.id);
            const clist = (await ChannelDAO.getChannelsByUserId(temp.user.id));
            clist.forEach((e) => {
                socket.join(String(e.id));
            });
        }
    } catch(err){
        console.log(err);
        return err;
    }
}

const receiveAndSend = async (io, receiveData, roomnum) =>{
    try{
        const receiveTime = await ChannelDAO.sendMsg(receiveData.id, roomnum, receiveData.msg);
        const sendData = {
            id: receiveData.id,
            nick: receiveData.nick,
            channel: roomnum,
            msg: receiveData.msg,
            msg_date: receiveTime
        };
        return io.to(sendData.channel).emit(`update`, sendData);
    } catch(err){
        console.log(err);
        return err;
    }
}

const inviteFriend = async (io, socket, roomnum, targetId) =>{
    try{
        await SocialDAO.includeToChannel(roomnum, targetId);
        const channelInfo = (await ChannelDAO.getChannelInfoById(roomnum, targetId));
        io.to(targetId).emit(`invite`, {
            cid: roomnum,
            cname: channelInfo.name,
            cunread: channelInfo.unread,
            ctime: channelInfo.updatetime,
        });
    } catch(err){
        console.log(err);
        return err;
    }
}

module.exports = {
    initialJoinRoom,
    receiveAndSend,
    inviteFriend,
};