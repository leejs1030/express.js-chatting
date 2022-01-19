const {ChannelDAO} = require('../../DAO');
const {getAlertScript} = require('../../lib/usefulJS');

const membershipRequired = async(req, res, next) =>{
    try{
        const {channelId} = req.params;
        const {user} = req.session;
        const result = await ChannelDAO.isChannelMember(channelId, user.id);
        if(result){
            return next();
        } else {
            return res.send(getAlertScript('속하지 않은 채널은 볼 수 없습니다!'));
        }
    } catch(err){
        return console.log(err);
    }
};

const ownRequired = async(req, res, next) =>{
    try{
        const {channelId} = req.params;
        const {user} = req.session;
        const result = await ChannelDAO.isChannelCreater(channelId, user.id);
        if(result){
            // return next();
            next();
        } else {
            return res.send(getAlertScript('관리자만이 채널을 삭제할 수 있습니다!'));
        }
    } catch(err){
        return console.log(err);
    }
};

module.exports = {membershipRequired, ownRequired};