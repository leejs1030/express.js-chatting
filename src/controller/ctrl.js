const {SocialDAO} = require('../DAO');

const indexPage = async (req, res, next) =>{
    try{
        const {user} = req.session;
        let counts = 0;
        if(user){
            counts = await SocialDAO.getCountsById(user.id); //요청받은 숫자
        }
        return res.render('index.pug', {user, counts,
            csrfToken: req.csrfToken(),
        });
    }catch(err){
        return next(err);
    }
};


module.exports = {
    indexPage,
};