const { Router } = require('express');
const { authRequired } = require('../auth/middleware');
const router = Router({
    caseSensitive: true,
});
const ctrl = require('./ctrl');

router.get('/', authRequired, ctrl.getUserConfig);
router.post('/', authRequired, ctrl.postUserConfig);


module.exports = router;