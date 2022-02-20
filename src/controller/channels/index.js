const { Router } = require('express');
const router = Router({
    caseSensitive: true,
});
const ctrl = require('./ctrl');
const { authRequired } = require('../auth/middleware'); // 로그인 여부 확인하는 미들웨어
const { doesChannelExist, membershipRequired, ownRequired, isChannelId, } = require('./middleware');
// 각각 채널 존재 여부를 확인, 멤버 여부를 확인, 만든 사람인지 확인, 적절한 채널 아이디인지 확인하는 미들웨어


router.param('channelId', isChannelId); // 정규 표현식으로 channelId가 올바른지 확인.
// 자연수만 허용됨. ex) 1, 2, 3, ... 는 허용
// 숫자가 아닌 게 있으면 허용되지 않음. ex) 2438a, asdf324u, 3 5, safd 등은 허용되지 않음.
// 0으로 시작하면 자연수가 아니라고 판단 ex) 01, 001, 02, 002 등은 허용되지 않음.

router.get('/', authRequired, ctrl.indexPage); // 채널 목록을 보여주는 기본 페이지.
router.post('/', authRequired, ctrl.createChannel); // POST요청을 받아서 채널 생성하기.

router.get('/:channelId', authRequired, doesChannelExist, membershipRequired, ctrl.showChannel); // 채널을 보여줌
router.put('/:channelId', authRequired, doesChannelExist, membershipRequired, ctrl.quitChannel); // 채널에서 나감
router.delete('/:channelId', authRequired, doesChannelExist, membershipRequired, ownRequired, ctrl.deleteChannel); // 채널을 삭제함

router.get('/:channelId/invitelist', authRequired, doesChannelExist, membershipRequired, ctrl.inviteFriend);
// 채널에 초대 가능한 유저(친구만 초대 가능하므로, 친구)들의 목록 을 보여주는 페이지

router.get('/:channelId/members', authRequired, doesChannelExist, membershipRequired, ctrl.memberList);
// 채널에 속한 멤버들을 보여주는 페이지



// router.post('/:channelId', authRequired, membershipRequired, ctrl.sendMsg); socket 사용 중.
// 현재는 미 사용.
// router.get('/:channelId/invitelist/:targetId', authRequired, membershipRequired, ctrl.includeToChannel); socket 사용 중.
// 현재는 미 사용. 필요하다면 put(혹은 patch?) 사용할 것.

module.exports = router;