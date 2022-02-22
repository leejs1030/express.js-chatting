const { Router } = require('express');
const ctrl = require('./ctrl');
const channels = require('./channels');
const auth = require('./auth');
const social = require('./social');
const settings = require('./settings');
const router = Router({ // 대소문자 구분
    caseSensitive: true,
});

router.get('/', ctrl.indexPage); // ctrl.indexPage로 넘겨 줌.
router.use('/channels', channels); // channels 쪽 컨트롤러에게 넘겨 줌.
router.use('/social', social); // social 쪽 컨트롤러에게 넘겨 줌.
router.use('/auth', auth); // auth 쪽 컨트롤러에게 넘겨 줌.
router.use('/settings', settings); // settings 쪽 컨트롤러에게 넘겨 줌.
module.exports = router;
