import { Router } from 'express';
import * as ctrl from './ctrl';
import channels from './channels';
import auth from './auth';
import social from './social';
import settings from './settings';
const router = Router({ // 대소문자 구분
    caseSensitive: true,
});

router.get('/', ctrl.indexPage); // ctrl.indexPage로 넘겨 줌.
router.use('/channels', channels); // channels 쪽 컨트롤러에게 넘겨 줌.
router.use('/social', social); // social 쪽 컨트롤러에게 넘겨 줌.
router.use('/auth', auth); // auth 쪽 컨트롤러에게 넘겨 줌.
router.use('/settings', settings); // settings 쪽 컨트롤러에게 넘겨 줌.
export = router;
