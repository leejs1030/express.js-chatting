const {UserDAO} = require('../../DAO');
const { generatePassword, verifyPassword } = require('../../lib/passwords');
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

        const isValid = await verifyPassword(password, user.password);
        if(!isValid) throw new Error('UNAUTHORIZED');

        console.log("hi");
        console.log(req.session);
        if(req.session.num === undefined){
            req.session.num = await 1;
        } else {
            req.session.num = await req.session.num + 1;
        }
        req.session.user = await {
            id: user.id,
            nick: user.nick,
        };
        console.log(req.session.user.id);
        console.log(req.session);
        return await res.redirect('/');
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
        const encryptedPassword = await generatePassword(password);
        await UserDAO.create(id, encryptedPassword, nick);

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