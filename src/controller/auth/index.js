const {Router} = require('express');
const ctrl = require('./ctrl');
const router = Router({
    caseSensitive: true,
});
router.get('/sign-in', ctrl.signInForm);
router.post('/sign-in', ctrl.signIn);

router.get('/sign-up', ctrl.signUpForm);
router.post('/sign-up', ctrl.signUp);

router.post('/sign-out', ctrl.signOut); //post로 바꿔야 함.

module.exports = router;