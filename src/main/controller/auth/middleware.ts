const authRequired = async (req, res, next) => { // 로그인 여부 확인하기
    try {
        if (req.session.user) return next(); // 로그인 했으면 다음 미들웨어로
        else return res.redirect(302, '/auth/sign-in'); // 아니면 로그인 페이지로 리더렉션. 302 Found
        // 
    } catch (err) {
        return next(err);
    }
};

import { rateLimit } from "express-rate-limit";
const limiter = (t, n) => rateLimit({
	windowMs: t * 1000, // t 초에
	max: n // n회까지 로그인 시도 허용
}); // 로그인을 여러 번 시도하는 것을 방지하기 위함.

export { authRequired, limiter };