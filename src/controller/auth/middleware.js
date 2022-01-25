const authRequired = async (req, res, next) => {
    try {
        if (req.session.user) return next();
        else return res.redirect(302, '/auth/sign-in');
    } catch (err) {
        return next(err);
    }
};

const RateLimit = require('express-rate-limit');
const limiter = (t, n) => RateLimit({
	windowMs: t * 1000, // t 초에
	max: n // n회까지 로그인 시도 허용
});

module.exports = { authRequired, limiter };