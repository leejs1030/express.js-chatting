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
        console.log(counts);
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
        const {uid} = req.params;
        await SocialDAO.allowRequest(uid, user.id);
        return res.redirect('back');
    } catch(err){
        return next(err);
    };
}

const reject = async (req, res, next) =>{
    try{
        const {user} = req.session;
        const {uid} = req.params;
        await SocialDAO.rejectRequest(uid, user.id);
        return res.redirect('back');
    } catch(err){
        return next(err);
    };
}

const requestOrBlack = async (req, res, next) =>{
    try{
        const {user} = req.session;
        console.log(req.body);
        const {action, targetid} = req.body;
        if(user.id == targetid) return res.send(getAlertScript('자신에겐 할 수 없습니다!'));
        let result = 0;
        if(action == 'request'){
            result = await SocialDAO.newRequest(user.id, targetid);
        }
        else if(action == 'black'){
            result = await SocialDAO.newBlack(user.id, targetid);
        }
        if(result == 1) return res.send(getAlertScript('이미 요청이 존재하거나, 친구이거나, 블랙리스트인 사용자에게는 요청할 수 없습니다!'));
        else if(result == 2) return res.send(getAlertScript('찾을 수 없는 id입니다!'));
        else if(result == 3) return res.send(getAlertScript('이미 블랙되어있는 상대입니다!'));
        else return res.redirect('back');
    } catch(err){
        return next(err);
    }
};

const cancelRequest = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {uid} = req.params;
        SocialDAO.cancelRequest(user.id, uid);
        return res.redirect('back');
    } catch(err){
        return next(err);
    }
};

const deleteFriend = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {uid} = req.params;
        SocialDAO.deleteFriend(user.id, uid);
        return res.redirect('back');
    } catch(err){
        return next(err);
    }
};

const unBlack = async(req, res, next) =>{
    try{
        const {user} = req.session;
        const {uid} = req.params;
        SocialDAO.unBlack(user.id, uid);
        return res.redirect('back');
    } catch(err){
        return next(err);
    }
};


module.exports = {
    indexPage,
    allow,
    reject,
    requestOrBlack,
    cancelRequest,
    deleteFriend,
    unBlack,
};