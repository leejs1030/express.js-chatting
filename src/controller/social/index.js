const { Router } = require('express');
const { authRequired } = require('../auth/middleware');
const ctrl = require('./ctrl');
const router = Router({
    caseSensitive: true,
});



// router.get('/', authRequired, ctrl.indexPage);
// router.post('/', authRequired, ctrl.requestOrBlack); // 친구 요청 혹은 블랙 추가.
//분리하자. /social/requests post와 /social/blacks post로.

// router.get('/allow/:uid', authRequired, ctrl.allow); // 요청 승인. /people/friends post로. query로 정보 전달. 전달된 정보로 확인.
// router.get('/reject/:uid', authRequired, ctrl.reject); // 요청 거절. /people/requests delete로
// router.get('/cancel/:uid', authRequired, ctrl.cancelRequest); // 요청 취소. /people/requests delete로
// router.get('/delete/:uid', authRequired, ctrl.deleteFriend); // 친구 삭제. /people/friend-lists delete로
// router.get('/unblack/:uid', authRequired, ctrl.unBlack); // 블랙 취소. /people/blakcs delete로.


////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/', authRequired, ctrl.indexPage);

router.post('/requests', authRequired, ctrl.sendRequest); // 요청 추가
router.post('/blacks', authRequired, ctrl.addBlack); // 블랙 추가

router.post('/friends', authRequired, ctrl.allow); // 요청 승인
router.delete('/requests/:uid', authRequired, ctrl.deleteRequest); // 요청 거절 혹은 취소. 결국 같다.

router.delete('/friends/:friend', authRequired, ctrl.deleteFriend); // 친구 삭제
router.delete('/blacks/:added', authRequired, ctrl.unBlack); // 블랙 삭제


module.exports = router;