const {ChannelDAO} = require('../../DAO');
const {getAlertScript} = require('../../lib/usefulJS');

const doesChannelExist = async(req, res, next) =>{
    try{
        const {channelId} = req.params;
        const result = await ChannelDAO.getChannelInfoById(channelId);
        if(result instanceof Error) return res.status(404).send(getAlertScript('존재하지 않는 채널입니다!'));
        else return next();
        
    } catch(err){
        return console.log(err);
    }
}

const membershipRequired = async(req, res, next) =>{
    try{
        const {channelId} = req.params;
        const {user} = req.session;
        const result = await ChannelDAO.isChannelMember(channelId, user.id);
        if(result) return next();
        else return res.status(403).send(getAlertScript('속하지 않은 채널입니다!'));
    } catch(err){
        return console.log(err);
    }
};

const ownRequired = async(req, res, next) =>{
    try{
        const {channelId} = req.params;
        const {user} = req.session;
        const result = await ChannelDAO.isChannelCreater(channelId, user.id);
        if(result) return next();
        else return res.status(403).send(getAlertScript('관리자만이 접근할 수 있습니다!'));
    } catch(err){
        return console.log(err);
    }
};

const digits = new RegExp('^[0-9]+$');

const isChannelId = (req, res, next, id) =>{
    if(digits.exec(id))
        next();
    else res.status(400).send(getAlertScript('적절하지 않은 채널 id입니다! 자연수로 입력해주세요.'))
};

module.exports = {doesChannelExist,
    membershipRequired,
    ownRequired,
    isChannelId,
};