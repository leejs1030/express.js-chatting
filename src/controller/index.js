const { Router } = require('express');
const ctrl = require('./ctrl');
const channels = require('./channels');
const auth = require('./auth');
const friends = require('./friends');
const router = Router();

router.get('/', ctrl.indexPage);
router.use('/channels', channels);
router.use('/friends', friends);
router.use('/auth', auth);
module.exports = router;
