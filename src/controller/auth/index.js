const {Router} = require('express');
const ctrl = require('./ctrl');
const router = Router({caseSensitive: true});
router.get('/sign-in', ctrl.signInForm);
router.post('/sign-in', ctrl.signIn);

router.get('/sign-up', ctrl.signUpForm);
router.post('/sign-up', ctrl.signUp);

router.get('/sign-out', ctrl.signOut);

module.exports = router;