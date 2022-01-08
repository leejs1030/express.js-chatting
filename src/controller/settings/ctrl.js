const {getAlertScript} = require('../../lib/usefulJS');
const {UserDAO} = require('../../DAO');

const getUserConfig = async (req, res, next) =>{
    try {
        const {user} = req.session;
        const info = (await UserDAO.getSettingById(user.id));
        return res.render('./settings/index.pug', {user, info});
    } catch (err) {
        return next(err);
    }
}

const postUserConfig = async (req, res, next) =>{
    try {
        const {user} = req.session;
        await UserDAO.setSettingById(user.id, req.body);
        return res.redirect('/');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getUserConfig,
    postUserConfig,
};