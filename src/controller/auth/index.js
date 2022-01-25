const {Router} = require('express');
const ctrl = require('./ctrl');
const router = Router({
    caseSensitive: true,
});
const RateLimit = require('express-rate-limit');


const limiter = (t, n) => RateLimit({
	windowMs: t * 1000, // t 초에
	max: n // n회까지 로그인 시도 허용
});

router.get('/sign-in', ctrl.signInForm);
router.post('/sign-in', limiter(60 * 60, 10), ctrl.signIn);

router.get('/sign-up', ctrl.signUpForm);
router.post('/sign-up', ctrl.signUp);

router.post('/sign-out', ctrl.signOut); //post로 바꿔야 함.

module.exports = router;