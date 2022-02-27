import { SocialDAO } from '../../DAO';
import { getAlertScript } from '../../lib/usefulJS';

// GET /
const indexPage = async (req, res, next) =>{ // /social의 기본 화면
    try{
        const {user} = req.session;
        const {reqreceived, reqsent, friendlist, blacklist, counts} = await SocialDAO.getSocialsById(user.id);
        return res.status(200).render('social/index.pug', {user, reqreceived, reqsent, friendlist, blacklist, counts,
            csrfToken: req.csrfToken(),
        });
    } catch(err){
        return next(err);
    }
};

// POST /requests
const sendRequest = async (req, res, next) =>{ // 요청 전송
    try{
        const {user} = req.session;
        const {targetid} = req.body;
        if(user.id == targetid) return res.status(409).send(getAlertScript('자신에겐 할 수 없습니다!'));
        let result = await SocialDAO.newRequest(user.id, targetid);

        if(!result) return res.redirect(303, 'back');
        else if(result == 1) return res.status(409).send(getAlertScript('이미 요청이 존재하거나, 친구이거나, 블랙리스트인 사용자에게는 요청할 수 없습니다!'));
        else if(result == 2) return res.status(404).send(getAlertScript('찾을 수 없는 id입니다!'));
        else throw new Error('BAD_REQUEST');
    } catch(err){
        return next(err);
    }
};

// POST /blacks
const addBlack = async (req, res, next) =>{ // 블랙 추가
    try{
        const {user} = req.session;
        console.log(req.body);
        const {targetid} = req.body;
        if(user.id == targetid) return res.status(409).send(getAlertScript('자신에겐 할 수 없습니다!'));
        let result = await SocialDAO.newBlack(user.id, targetid);

        if(!result) return res.redirect(303, 'back');
        else if(result == 2) return res.status(404).send(getAlertScript('찾을 수 없는 id입니다!'));
        else if(result == 3) return res.status(409).send(getAlertScript('이미 블랙되어있는 상대입니다!'));
        else throw new Error('BAD_REQUEST');
    } catch(err){
        return next(err);
    }
};

// POST /friends
const allow = async (req, res, next) =>{ // 요청 수락
    try{
        const {user} = req.session;
        const {uid} = req.body;
        await SocialDAO.allowRequest(uid, user.id);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    };
}

// DELETE /requests/:uid
const deleteRequest = async (req, res, next) =>{ // 요청 취소 or 거절. 결국 행동은 같음
    try{
        const {user} = req.session;
        const {me} = req.query;
        const {uid} = req.params;
        if(me == 'receiver') await SocialDAO.cancelRequest(uid, user.id);
        else if(me == 'sender') await SocialDAO.cancelRequest(user.id, uid);
        else throw new Error('BAD_REQUEST');
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    };
}

// DELETE /friends/:friend
const deleteFriend = async(req, res, next) =>{ // 친구 삭제
    try{
        const {user} = req.session;
        const {friend} = req.params;
        SocialDAO.deleteFriend(user.id, friend);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
};

// DELETE /blacks/:added
const unBlack = async(req, res, next) =>{ // 블랙 해제
    try{
        const {user} = req.session;
        const {added} = req.params;
        SocialDAO.unBlack(user.id, added);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
};


export {
    indexPage,
    sendRequest,
    addBlack,
    allow,
    deleteRequest,
    deleteFriend,
    unBlack,
};