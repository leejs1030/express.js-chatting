import { Router } from 'express';
import ctrl = require('./ctrl');
import { limiter } from './middleware';
const router = Router({
    caseSensitive: true,
});



router.get('/sign-in', ctrl.signInForm); // 로그 인 페이지 보이기
router.post('/sign-in', limiter(60 * 60, 10), ctrl.signIn); // 로그 인 하기. 1 시간에 10회 이상 불가능.

router.get('/sign-up', ctrl.signUpForm); // 회원 가입 페이지 보이기
router.post('/sign-up', ctrl.signUp); // 회원 가입 하기

router.post('/sign-out', ctrl.signOut); //GET으로 하면 브라우저가 미리 로딩하는 과정에서 로그아웃 될 수도 있음.
// POST로 하면 그런 일이 생기지 않음.

export {router};