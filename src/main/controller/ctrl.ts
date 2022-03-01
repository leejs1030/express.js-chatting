import { SocialDAO } from '../DAO';
import { NextFunction, Request, Response } from 'express';

//GET /
//초기 화면
async function indexPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { user } = req.session;
        let counts = 0;
        if (user) { // 로그인 한 상태라면
            counts = (await SocialDAO.getReceivedById(user.id)).length; //요청받은 숫자
        }
        return res.status(200).render('index.pug', {
            user, counts,
            csrfToken: req.csrfToken(),
        }); // 페이지 렌더링 응답
    } catch (err) {
        return next(err);
    }
}


export {
    indexPage,
};