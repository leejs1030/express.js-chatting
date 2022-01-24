const {SocialDAO} = require('../../DAO');
const {getAlertScript} = require('../../lib/usefulJS');


const indexPage = async (req, res, next) =>{
    try{
        const {user} = req.session;
        const reqreceived = await SocialDAO.getReceivedById(user.id);
        const reqsent = await SocialDAO.getSentById(user.id);
        const friendlist = await SocialDAO.getFriendsById(user.id);
        const blacklist = await SocialDAO.getBlacksById(user.id);
        const counts = await SocialDAO.getCountsById(user.id);
        return res.render('social/index.pug', {user, reqreceived, reqsent, friendlist, blacklist, counts,
            csrfToken: req.csrfToken(),
        });
    } catch(err){
        return next(err);
    }
};

const allow = async (req, res, next) =>{
    try{
        const {user} = req.session;
        // const {uid} = req.params;
        const {uid} = req.body;
        await SocialDAO.allowRequest(uid, user.id);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    };
}

const deleteRequest = async (req, res, next) =>{
    try{
        const {user} = req.session;
        const {me} = req.query;
        const {uid} = req.params;
        if(me == 'receiver') await SocialDAO.cancelRequest(uid, user.id);
        else if(me == 'sender') await SocialDAO.cancelRequest(user.id, uid);
        else throw new Error('BAD_REQUEST')
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    };
}

const sendRequest = async (req, res, next) =>{
    try{
        const {user} = req.session;
        const {targetid} = req.body;
        if(user.id == targetid) return res.send(getAlertScript('자신에겐 할 수 없습니다!'));
        let result = await SocialDAO.newRequest(user.id, targetid);

        if(result == 1) return res.send(getAlertScript('이미 요청이 존재하거나, 친구이거나, 블랙리스트인 사용자에게는 요청할 수 없습니다!'));
        else if(result == 2) return res.send(getAlertScript('찾을 수 없는 id입니다!'));
        else if(result == 3) return res.send(getAlertScript('이미 블랙되어있는 상대입니다!'));
        else return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
};


const addBlack = async (req, res, next) =>{
    try{
        const {user} = req.session;
        console.log(req.body);
        const {targetid} = req.body;
        if(user.id == targetid) return res.send(getAlertScript('자신에겐 할 수 없습니다!'));
        let result = await SocialDAO.newBlack(user.id, targetid);

        if(result == 1) return res.send(getAlertScript('이미 요청이 존재하거나, 친구이거나, 블랙리스트인 사용자에게는 요청할 수 없습니다!'));
        else if(result == 2) return res.send(getAlertScript('찾을 수 없는 id입니다!'));
        else if(result == 3) return res.send(getAlertScript('이미 블랙되어있는 상대입니다!'));
        else return res.redirect(303, 'back');

    } catch(err){
        return next(err);
    }
};

const deleteFriend = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {friend} = req.params;
        SocialDAO.deleteFriend(user.id, friend);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
};

const unBlack = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {added} = req.params;
        SocialDAO.unBlack(user.id, added);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
};


module.exports = {
    indexPage,
    allow,
    deleteRequest,
    sendRequest,
    addBlack,
    deleteFriend,
    unBlack,
};