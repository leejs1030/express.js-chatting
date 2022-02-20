const { Router } = require('express');
const { authRequired } = require('../auth/middleware'); // 로그인이 되어있는지 확인하기 위한 미들웨어
const router = Router({
    caseSensitive: true,
});
const ctrl = require('./ctrl');

router.get('/', authRequired, ctrl.getUserConfig); // 로그인 필요. 클라이언트에게 설정 창을 보여줌.
router.post('/', authRequired, ctrl.postUserConfig); // 클라이언트의 POST로부터 설정 값 받아서 처리.


module.exports = router;