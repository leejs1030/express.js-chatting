const {ChannelDAO, SocialDAO, UserDAO} = require('../../DAO');
const { getChannelUnreadById } = require('../../DAO/channel');
const {getAlertScript} = require('../../lib/usefulJS');
// const {app} = require('../../app');

const createChannel = async (req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelName} = req.body;
        if(!channelName) return res.status(400).send(getAlertScript("채널 이름을 입력해주세요!"));
        await ChannelDAO.createChannel(channelName, user.id);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
}

const indexPage = async (req, res, next) =>{
    try{
        const {user} = req.session;
        const channelList = await ChannelDAO.getChannelsByUserId(user.id);
        const {num} = await ChannelDAO.countChannelsByUserId(user.id);
        return res.status(200).render('channels/index.pug', {user, num, channelList: JSON.stringify(channelList), 
            csrfToken: req.csrfToken()});
    } catch(err){
        return next(err);
    }
};

const showChannel = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        const unread = (await getChannelUnreadById(channelId, user.id))[0].unread
        const msglist = await ChannelDAO.getMsgFromChannel(channelId, user.id);
        const {send_enter} = await UserDAO.getSettingById(user.id);
        const channelName = (await ChannelDAO.getChannelInfoById(channelId))[0].name;

        return res.status(200).render("channels/chattings.pug", {user, channelId, send_enter, channelName, unread,
            initialMsgs: JSON.stringify(msglist),
            csrfToken: req.csrfToken(),
        });
    } catch(err){
        return next(err);
    }
};

const sendMsg = async(req, res, next) =>{
    try{
        return; // 현재 사용하지 않음. 소켓 파트로 대체.
        // /scripts/chattingsockets.js에서 new msg 소켓 보내면, /src/index.js에서 받아서 처리.
        const {content} = req.body;
        if(content.length > 10000 || !content){
            return res.status(400).send(getAlertScript('0 ~ 10000 글자로 작성해주세요!'));
        }
        const {user} = req.session;
        const {channelId} = req.params;
        const receiveTime = await ChannelDAO.sendMsg(user.id, channelId, content);
        const io = req.app.get('socketio');
        let sendData = {
            id: user.id,
			nick: user.nick,
			channel: channelId,
			msg: content,
			stime: receiveTime,
        };

        io.to(sendData.channel).emit(`update`, sendData);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
}

const inviteFriend = async(req, res, next) =>{
    try{
        const io = req.app.get('socketio'); io.emit('hello', 'hello');
        const {user} = req.session;
        const {channelId} = req.params;
        const flist = await SocialDAO.getFriendsByIdNotInChannel(user.id, channelId);
        return res.status(200).render('channels/invites.pug', {user, channelId, flist:JSON.stringify(flist),
            csrfToken: req.csrfToken(),
        });
    } catch(err) {
        return next(err);
    }
}

const includeToChannel = async(req, res, next) =>{
    try{
        return; // 현재 사용하지 않음. 소켓 파트로 대체.
        // /scripts/invitesockets.js에서 전송하면 /src/index.js에서 받아서 처리.
        console.log('hello');
        const {user} = req.session;
        const {channelId, targetId} = req.params;
        await SocialDAO.includeToChannel(channelId, targetId);
        const channelInfo = (await ChannelDAO.getChannelInfoById(channelId))[0];
        const unread = (await ChannelDAO.getChannelUnreadById(channelId, targetId))[0].unread;
        const io = req.app.get('socketio');
        io.to(targetId).emit(`invite`, {
            cid: channelId,
            cname: channelInfo.name,
            cunread: unread,
            ctime: channelInfo.updatetime,
        });
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
}

const quitChannel = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        await ChannelDAO.quitChannel(channelId, user.id);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
}

const deleteChannel = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        await ChannelDAO.deleteChannel(channelId, user.id);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
}

const memberList = async (req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        let memberList = await ChannelDAO.getMemberFromChannel(channelId);
        for(const member of memberList){
            if(user.id == member.id){
                member.canRequest = member.canBlack = false;
            } else {
                member.canBlack = await SocialDAO.canAddBlack(user.id, member.id);
                member.canRequest = await SocialDAO.canSendRequest(user.id, member.id);
            }
        }
        return res.status(200).render('channels/member.pug', {user, channelId, memberList: JSON.stringify(memberList),
            csrfToken: req.csrfToken(),
        });
    }catch(err){
        return next(err);
    }
}

module.exports = {
    createChannel,
    indexPage,
    showChannel,
    sendMsg,
    inviteFriend,
    includeToChannel,
    quitChannel,
    deleteChannel,
    memberList
}