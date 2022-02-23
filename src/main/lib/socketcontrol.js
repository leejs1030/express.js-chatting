const {isNumber} = require('../lib/usefulJS');
const {ChannelDAO, SocialDAO} = require('../DAO');

const initialJoinRoom = async (socket, roomnum) =>{
    try{
        if(isNumber(roomnum)) socket.join(roomnum); //만약 숫자라면, 해당 채널의 룸에 넣어줌.
        else{ // 아니라면
            const temp = socket.request.session; // 세션 정보를 보고
            socket.join(temp.user.id); // 해당 유저의 id에 해당하는 룸에 넣어줌. (초대 받기 감지용)
            const clist = (await ChannelDAO.getChannelsByUserId(temp.user.id)); // 참가한 모든 채널의 룸에 넣어줌. (새 메시지 확인용)
            clist.forEach((e) => {
                socket.join(String(e.id));
            }); // 참가한 모든 채널의 룸에 넣어줌. (새 메시지 확인용)
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
            msg_date: receiveTime,
        };
        return io.to(sendData.channel).emit(`update`, sendData);
    } catch(err){
        console.log(err);
        return err;
    }
}

const inviteFriend = async (io, socket, roomnum, targetId) =>{
    try{
        await ChannelDAO.includeToChannel(roomnum, targetId);
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