const indexPage = async (req, res, next) =>{
    try{
        const {user} = req.session;
        // if(!user) return res.redirect('/auth/sign_in');
        return res.render('index.pug', {user});
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