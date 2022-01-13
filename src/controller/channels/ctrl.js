const {ChannelDAO, FriendDAO, UserDAO} = require('../../DAO');
const {getAlertScript} = require('../../lib/usefulJS');

const createChannel = async (req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelName} = req.body;
        if(!channelName) return res.send(getAlertScript("채널 이름을 입력해주세요!"));
        await ChannelDAO.createChannel(channelName, user.id);
        return res.redirect('back');
    } catch(err){
        return next(err);
    }
}

const indexPage = async (req, res, next) =>{
    try{
        const {user} = req.session;
        const channelList = await ChannelDAO.getChannelsByUserId(user.id);
        const {num} = await ChannelDAO.countChannelsByUserId(user.id);
        return res.render('channels/index.pug', {user, channelList, num, chan: JSON.stringify(channelList)});
    } catch(err){
        return next(err);
    }
};

const showChannel = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        const msglist = await ChannelDAO.getMsgFromChannel(channelId, user.id);
        const {send_enter} = await UserDAO.getSettingById(user.id);
        return res.render("channels/chattings.pug", {user, channelId, msglist, send_enter});
    } catch(err){
        return next(err);
    }
};

const sendMsg = async(req, res, next) =>{
    try{
        console.log("컨트롤러1");
        const {content} = req.body;
        if(content.length > 10000) return res.send(getAlertScript('0 ~ 10000 글자로 작성해주세요!'));
        const {user} = req.session;
        const {channelId} = req.params;
        await ChannelDAO.sendMsg(user.id, channelId, content);
        return res.redirect('back');
    } catch(err){
        return next(err);
    }
}

const inviteFriend = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        const flist = await FriendDAO.getFriendsByIdNotInChannel(user.id, channelId);
        return res.render('channels/invites.pug', {user, channelId, flist});
    } catch(err) {
        return next(err);
    }
}

const includeToChannel = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelId, targetId} = req.params;
        await FriendDAO.includeToChannel(channelId, targetId);
        return res.redirect('back');
    } catch(err){
        return next(err);
    }
}

const quitChannel = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        await ChannelDAO.quitChannel(channelId, user.id);
        return res.redirect('back');
    } catch(err){
        return next(err);
    }
}

const deleteChannel = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        await ChannelDAO.deleteChannel(channelId, user.id);
        return res.redirect('back');
    } catch(err){
        return next(err);
    }
}

const memberList = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        const memberList = await ChannelDAO.getMemberFromChannel(channelId);
        res.render('channels/member.pug', {user, channelId, memberList});
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