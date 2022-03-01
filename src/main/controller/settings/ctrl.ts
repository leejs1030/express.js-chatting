import { user_setting } from 'custom-type';
import { UserDAO } from '../../DAO';
import { NextFunction, Request, Response } from 'express';

// GET /
// 유저의 설정 정보를 불러서 페이지 렌더링
async function getUserConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { user } = req.session;
        const info = (await UserDAO.getSettingById(user.id));
        return res.status(200).render('settings/index.pug', {
            user, info,
            csrfToken: req.csrfToken(),
        });
    } catch (err) {
        return next(err);
    }
}

// POST /
// 유저의 설정 값 요청을 받아서 처리
async function postUserConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { user } = req.session;
        const user_setting: user_setting = {
            id: user.id,
            send_enter: req.body.send_enter,
        };
        await UserDAO.setSettingById(user_setting);
        return res.redirect(303, '/'); // 응답 코드는 303.  https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/303
    } catch (err) {
        return next(err);
    }
}

export {
    getUserConfig,
    postUserConfig,
};