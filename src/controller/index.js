const { Router } = require('express');
const ctrl = require('./ctrl');
const channels = require('./channels');
const auth = require('./auth');
const people = require('./social');
const settings = require('./settings');
const router = Router({
    caseSensitive: true,
});

router.get('/', ctrl.indexPage);
router.use('/channels', channels);
router.use('/social', people);
router.use('/auth', auth);
router.use('/settings', settings);
module.exports = router;
