const {UserDAO} = require('../../DAO');
const getAlertScript = msg => `<script>alert("${msg}");history.back();</script>`;

//GET /
const signInForm = async (req, res, next) =>{
    try{
        const {user} = req.session;
        if(user) return res.redirect('/');
        else return res.render('auth/sign-in.pug', {user});
    }catch(err){
        return next(err);
    }
};

//GET /
const signIn = async (req, res, next) =>{
    try{
        const {id, password} = req.body;
        if(!id || !password) throw new Error('BAD_REQUEST');

        const user = await UserDAO.getById(id);
        if(!user) throw new Error('UNAUTHORIZED');
        if(password != user.password) throw new Error('UNAUTHORIZED');

        req.session.user = {
            id: user.id,
            nick: user.nick,
        };
        return res.redirect('/');
    }catch(err){
        return next(err); //에러 객체가 error-handler에 전달됨.
    }
};

//GET /
const signUpForm = async (req, res, next) =>{
    try{
        const {user} = req.session;
        return res.render('auth/sign-up.pug', { user });
    }catch(err){
        return next(err);
    }
};

//GET /
const signUp = async (req, res, next) =>{
    try{
        const {id, password, nick} = req.body;
        if(!id || id > 20 || !password || !nick || nick > 20) throw new Error('BAD_REQUEST');
        const isExist = await UserDAO.getById(id);
        if(isExist) {
            return res.send(getAlertScript("이미 존재하는 ID입니다!"));
        }
        await UserDAO.create(id, password, nick);

        return res.redirect('/auth/sign_in');
    }catch(err){
        return next(err);
    }
};

//GET /
const signOut = async (req, res, next) =>{
    try{
        req.session.destroy(err => {
            if(err) throw err;
            else return res.redirect('/');
        });
    }catch(err){
        return next(err);
    }
};

module.exports = {
    signInForm,
    signIn,
    signUpForm,
    signUp,
    signOut
};