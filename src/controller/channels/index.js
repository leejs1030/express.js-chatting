const { Router } = require('express');
const router = Router({
    caseSensitive: true,
});
const ctrl = require('./ctrl');
const { authRequired } = require('../auth/middleware');
const { doesChannelExist, membershipRequired, ownRequired, isChannelId, } = require('./middleware');


router.param('channelId', isChannelId);

router.get('/', authRequired, ctrl.indexPage);
router.post('/', authRequired, ctrl.createChannel);
router.get('/:channelId', authRequired, doesChannelExist, membershipRequired, ctrl.showChannel);

router.put('/:channelId', authRequired, doesChannelExist, membershipRequired, ctrl.quitChannel); // put 사용하기.
router.delete('/:channelId', authRequired, doesChannelExist, membershipRequired, ownRequired, ctrl.deleteChannel); // delete 사용하기.

router.get('/:channelId/invitelist', authRequired, doesChannelExist, membershipRequired, ctrl.inviteFriend);

router.get('/:channelId/members', authRequired, doesChannelExist, membershipRequired, ctrl.memberList);



// router.post('/:channelId', authRequired, membershipRequired, ctrl.sendMsg); socket 사용 중.
// 현재는 미 사용.
// router.get('/:channelId/invitelist/:targetId', authRequired, membershipRequired, ctrl.includeToChannel); socket 사용 중.
// 현재는 미 사용. 필요하다면 put(혹은 patch?) 사용할 것.

module.exports = router;