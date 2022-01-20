const authRequired = async (req, res, next) => {
    try {
        if (req.session.user) return next();
        else
            return res.redirect('/auth/sign-in');
    } catch (err) {
        return next(err);
    }
};


module.exports = { authRequired };