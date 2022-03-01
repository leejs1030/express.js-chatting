import { errorAt } from '../lib/usefulJS';
import { ChannelDAO, SocialDAO, compressIntoTx } from '../DAO';
import { channelInfo, msg, user } from 'custom-type';

async function initialJoinRoom(socket: any, roomnum: number): Promise<0> {
    try {
        if (isNaN(roomnum)) { // NaN이라면, /channels 페이지에 있는 것.
            const temp = socket.handshake.session; // 세션 정보를 보고
            socket.join(temp.user.id); // 해당 유저의 id에 해당하는 룸에 넣어줌. (초대 받기 감지용)
            const clist = (await ChannelDAO.getChannelsByUserId(temp.user.id)); // 참가한 모든 채널의 룸에 넣어줌. (새 메시지 확인용)
            clist.forEach(e => socket.join(e.id)); // 참가한 모든 채널의 룸에 넣어줌. (새 메시지 확인용)
        }
        else socket.join(roomnum); //그게 아니라 숫자라면, /channels/:channelId에 있는 것. 해당 채널 룸에 넣기.
        return 0;
        // 따라서 해당 채널의 룸에 넣어줌.
    } catch (err) {
        throw errorAt("initialJoinRoom", err);
    }
}

const receiveAndSend = async (io: any, socket: any, receiveData: msg, roomnum: number) =>{
    try{
        const {user} = (socket.handshake.session) as {user: user};
        const receiveTime = await ChannelDAO.sendMsg(user.id, roomnum, receiveData.msg);
        const sendData: msg = {
            id: user.id,
            nick: user.nick,
            channel_id: roomnum,
            msg: receiveData.msg,
            msg_time: receiveTime,
        };
        return io.to(sendData.channel_id).emit(`update`, sendData);
    } catch(err){
        console.log(err);
        return err;
    }
}

const inviteFriend = async (io: any, socket: any, roomnum: number, targetId: string) =>{
    compressIntoTx(async (): Promise<channelInfo> => {
        if(!(await SocialDAO.isFriend(socket.handshake.session.user.id, targetId))) throw new Error("User can only invite their friends.");
        if(await ChannelDAO.isChannelMember(roomnum, targetId)) throw new Error("You can't invite who is already in channel.");
        await ChannelDAO.includeToChannel(roomnum, targetId);
        return (await ChannelDAO.getChannelInfoById(roomnum, targetId));
    })
        .then((channelInfo: channelInfo) => {
            io.to(targetId).emit(`invite`, {
                cid: roomnum,
                cname: channelInfo.name,
                cunread: channelInfo.unread,
                ctime: channelInfo.update_time,
            });
        })
        .catch((err: Error) => {throw errorAt('inviteFriend', err);});
}

export {
    initialJoinRoom,
    receiveAndSend,
    inviteFriend,
};