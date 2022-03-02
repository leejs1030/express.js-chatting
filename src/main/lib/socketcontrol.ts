import { errorAt } from '../lib/usefulJS';
import { ChannelDAO, SocialDAO, compressIntoTx } from '../DAO';
import { channelInfo, msg, user } from 'custom-type';
import socket from 'socket.io';

async function initChattingListener(io: socket.Server ,socket: socket.Socket, roomnum: number) {
	// 처음 소켓에 접속하면 접속 채널 등의 정보를 통해 적절한 room에 넣어줌.
	await initialJoinRoom(socket, roomnum);
	// 새 메시지를 누가 보내면, 서버에서 받아서 다른 사람들에게 전달. db도 수정함.
	socket.on('new msg', async (receiveData: msg) => await receiveAndSend(io, socket, receiveData, roomnum));
	// 새 메시지를 읽으면, db에 읽었음을 확인.
	socket.on('read', async () => await ChannelDAO.readMsgFromChannel((socket.handshake.session.user?.id) as string, roomnum));
	socket.on('disconnect', async () => socket.removeAllListeners());
	// 다른 사람을 채널에 초대 요청을 누가 보내면, 서버에서 받아서 해당 사람에게 알려줌.
	socket.on('invite', async (targetId: string) => await inviteFriend(io, socket, roomnum, targetId));
	// 새 채널에 초대받았다면, 새로운 룸에 접속시키기 위해서(해당 룸의 메시지를 봐야 하므로) 사용.
	socket.on('join to', async (channelInfo: channelInfo) => socket.join(channelInfo.id.toString()));
}

async function initialJoinRoom(socket: socket.Socket, roomnum: number): Promise<0> {
    try {
        if (isNaN(roomnum)) { // NaN이라면, /channels 페이지에 있는 것.
            const temp = socket.handshake.session as {user: user}; // 세션 정보를 보고
            socket.join(temp.user.id); // 해당 유저의 id에 해당하는 룸에 넣어줌. (초대 받기 감지용)
            const clist = (await ChannelDAO.getChannelsByUserId(temp.user.id)); // 참가한 모든 채널의 룸에 넣어줌. (새 메시지 확인용)
            clist.forEach(e => socket.join(e.id.toString())); // 참가한 모든 채널의 룸에 넣어줌. (새 메시지 확인용)
        }
        else socket.join(roomnum.toString()); //그게 아니라 숫자라면, /channels/:channelId에 있는 것. 해당 채널 룸에 넣기.
        return 0;
        // 따라서 해당 채널의 룸에 넣어줌.
    } catch (err) {
        throw errorAt("initialJoinRoom", err);
    }
}

async function receiveAndSend(io: socket.Server, socket: socket.Socket, receiveData: msg, roomnum: number): Promise<boolean> {
    try {
        const { user } = (socket.handshake.session) as { user: user; };
        const receiveTime = await ChannelDAO.sendMsg(user.id, roomnum, receiveData.msg);
        const sendData: msg = {
            id: user.id,
            nick: user.nick,
            channel_id: roomnum,
            msg: receiveData.msg,
            msg_time: receiveTime,
        };
        return io.to(sendData.channel_id?.toString() as string).emit(`update`, sendData);
    } catch (err) {
        throw errorAt("receiveAndSend", err);
    }
}

async function inviteFriend(io: socket.Server, socket: socket.Socket, roomnum: number, targetId: string): Promise<boolean> {
    return compressIntoTx(async (): Promise<channelInfo> => {
        if (!(await SocialDAO.isFriend(socket.handshake.session.user?.id as string, targetId))) throw new Error("User can only invite their friends.");
        if (await ChannelDAO.isChannelMember(roomnum, targetId)) throw new Error("You can't invite who is already in channel.");
        await ChannelDAO.includeToChannel(roomnum, targetId);
        return (await ChannelDAO.getChannelInfoById(roomnum, targetId));
    })
        .then((channelInfo: channelInfo) => io.to(targetId).emit(`invite`, channelInfo))
        .catch((err: Error) => { throw errorAt('inviteFriend', err); });
}

export {
    initChattingListener,
    initialJoinRoom,
    receiveAndSend,
    inviteFriend,
};