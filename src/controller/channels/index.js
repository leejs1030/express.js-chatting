const { Router } = require('express');
const router = Router({caseSensitive: true});
const ctrl = require('./ctrl');
const { authRequired } = require('../auth/middleware');
const { membershipRequired, ownRequired } = require('./middleware');

// const {server, io} = require('../../app');

// io.on('connection', (socket) => {
// 	console.log('a user connected');
// 	socket.on('disconnect', () => {
// 		console.log('user disconnected');
// 	});
// 	socket.on('new msg', (msg) => {
// 		console.log(msg);
// 		io.emit('received', msg);
// 	});
// });

router.get('/', authRequired, ctrl.indexPage);
router.post('/', authRequired, ctrl.createChannel);
router.get('/:channelId', authRequired, membershipRequired, ctrl.showChannel);
router.post('/:channelId', authRequired, membershipRequired, ctrl.sendMsg);

router.get('/invite/:channelId', authRequired, membershipRequired, ctrl.inviteFriend);
router.get('/invite/:channelId/:targetId', authRequired, membershipRequired, ctrl.includeToChannel);

router.get('/members/:channelId', authRequired, membershipRequired, ctrl.memberList);

router.get('/quit/:channelId', authRequired, membershipRequired, ctrl.quitChannel);
router.get('/delete/:channelId', authRequired, membershipRequired, ownRequired, ctrl.deleteChannel);

module.exports = router;