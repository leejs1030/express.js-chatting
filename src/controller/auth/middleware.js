const authRequired = async (req, res, next) => {
    try {
        if (req.session.user) return next();
        else return res.status(302).redirect('/auth/sign-in');
    } catch (err) {
        return next(err);
    }
};


module.exports = { authRequired };