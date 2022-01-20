const { Router } = require('express');
const { authRequired } = require('../auth/middleware');
const ctrl = require('./ctrl');
const router = Router({
    caseSensitive: true,
});



router.get('/', authRequired, ctrl.indexPage);
router.post('/', authRequired, ctrl.requestOrBlack)
router.get('/allow/:uid', authRequired, ctrl.allow);
router.get('/reject/:uid', authRequired, ctrl.reject);
router.get('/cancel/:uid', authRequired, ctrl.cancelRequest);
router.get('/delete/:uid', authRequired, ctrl.deleteFriend);
router.get('/unblack/:uid', authRequired, ctrl.unBlack);


module.exports = router;