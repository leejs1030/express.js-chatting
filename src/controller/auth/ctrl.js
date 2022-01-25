const {UserDAO} = require('../../DAO');
const { generatePassword, verifyPassword } = require('../../lib/passwords');
const {getAlertScript} = require('../../lib/usefulJS');

//GET /
const signInForm = async (req, res, next) =>{
    try{
        const {user} = req.session;
        if(user) return res.redirect('/');
        else return res.status(200).render('auth/sign-in.pug', {user, csrfToken: req.csrfToken()});
    }catch(err){
        return next(err);
    }
};

//GET /
const signIn = async (req, res, next) =>{
    try{
        const {id, password, keepSignedIn} = req.body;
        if(!id || !password) throw new Error('BAD_REQUEST');


        if(keepSignedIn === undefined) req.session.keepSignedIn = false;
        else if(keepSignedIn === "on") req.session.keepSignedIn = true;
        

        const user = await UserDAO.getById(id);
        if(!user) throw new Error('UNAUTHORIZED');

        const isValid = await verifyPassword(password, user.password);
        if(!isValid) throw new Error('UNAUTHORIZED');

        req.session.user = {
            id: user.id,
            nick: user.nick,
        };
        // console.log(req.session);
        return res.redirect(303, '/');
    }catch(err){
        return next(err); //에러 객체가 error-handler에 전달됨.
    }
};

//GET /
const signUpForm = async (req, res, next) =>{
    try{
        const {user} = req.session;
        return res.status(200).render('auth/sign-up.pug', { user, csrfToken: req.csrfToken() });
    }catch(err){
        return next(err);
    }
};

//GET /
const signUp = async (req, res, next) =>{
    try{
        const {id, password, nick} = req.body;
        if(!id || id > 20 || !password || !nick || nick > 20) throw new Error('BAD_REQUEST');
        const encryptedPassword = await generatePassword(password);

        const result = await UserDAO.createUser(id, encryptedPassword, nick);
        if(result === false) return res.status(400).send(getAlertScript("이미 존재하는 ID입니다!"));
        else if(result === true) return res.redirect(303, '/auth/sign-in');
        else throw err;
    }catch(err){
        return next(err);
    }
};

//GET /
const signOut = async (req, res, next) =>{
    try{
        req.session.destroy(err => {
            if(err) throw err;
            else return res.redirect(303, '/');
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