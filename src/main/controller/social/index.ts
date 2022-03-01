import { Router } from 'express';
import { authRequired } from '../auth/middleware'; // 로그인이 되어있는지 확인하기 위한 미들웨어
import * as ctrl from './ctrl';
const router = Router({
    caseSensitive: true,
});


router.get('/', authRequired, ctrl.indexPage); // /socials의 기본 페이지. 로그인 필요.

router.post('/requests', authRequired, ctrl.sendRequest); // 요청 추가
router.post('/blacks', authRequired, ctrl.addBlack); // 블랙 추가

router.post('/friends', authRequired, ctrl.allow); // 요청 승인
router.delete('/requests/:uid', authRequired, ctrl.deleteRequest); // 요청 거절 혹은 취소. 결국 db에서의 작업은 같음.

router.delete('/friends/:friend', authRequired, ctrl.deleteFriend); // 친구 삭제
router.delete('/blacks/:added', authRequired, ctrl.unBlack); // 블랙 삭제


export = router;