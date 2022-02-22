const {UserDAO} = require('../../DAO');

// GET /
const getUserConfig = async (req, res, next) =>{ // 유저의 설정 정보를 불러서 페이지 렌더링
    try {
        const {user} = req.session;
        const info = (await UserDAO.getSettingById(user.id));
        return res.status(200).render('settings/index.pug', {user, info,
            csrfToken: req.csrfToken(),
        });
    } catch (err) {
        return next(err);
    }
}

// POST /
const postUserConfig = async (req, res, next) =>{ // 유저의 설정 값 요청을 받아서 처리
    try {
        const {user} = req.session;
        await UserDAO.setSettingById(user.id, req.body);
        return res.redirect(303, '/'); // 응답 코드는 303.  https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/303
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getUserConfig,
    postUserConfig,
};