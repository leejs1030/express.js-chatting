const { Router } = require('express');
const router = Router({
    caseSensitive: true,
});
const ctrl = require('./ctrl');
const { authRequired } = require('../auth/middleware');
const { doesChannelExist, membershipRequired, ownRequired, } = require('./middleware');
const { getAlertScript } = require('../../lib/usefulJS');
const digits = new RegExp('^[0-9]+$')


router.param('channelId', (req, res, next, id) =>{
    if(digits.exec(id)){
        next();
    }else{
        res.send(getAlertScript('적절하지 않은 채널 id입니다! 자연수로 입력해주세요.'))
    }
});

router.get('/', authRequired, ctrl.indexPage);
router.post('/', authRequired, ctrl.createChannel);
router.get('/:channelId', authRequired, doesChannelExist, membershipRequired, ctrl.showChannel);
// router.post('/:channelId', authRequired, membershipRequired, ctrl.sendMsg);
router.put('/:channelId', authRequired, doesChannelExist, membershipRequired, ctrl.quitChannel); // put 사용하기.
router.delete('/:channelId', authRequired, doesChannelExist, membershipRequired, ownRequired, ctrl.deleteChannel); // delete 사용하기.

router.get('/:channelId/invitelist', authRequired, doesChannelExist, membershipRequired, ctrl.inviteFriend);
// router.get('/:channelId/invitelist/:targetId', authRequired, membershipRequired, ctrl.includeToChannel); // put 사용하기.

router.get('/:channelId/members', authRequired, doesChannelExist, membershipRequired, ctrl.memberList);


module.exports = router;