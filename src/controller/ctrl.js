const {FriendDAO} = require('../DAO');

const indexPage = async (req, res, next) =>{
    try{
        const {user} = req.session;
        const num = await FriendDAO.countReceivedById(user.id); //요청받은 숫자
        return res.render('index.pug', {user, num});
    }catch(err){
        return next(err);
    }
};

const eeee = async(req, res, next )=>{
    try{
        throw new Error('NOT_FOUND');
    }catch(err){
        return next(err);
    }
}


module.exports = {
    indexPage, eeee,
};