const {UserDAO} = require('../../DAO');
const { generatePassword, verifyPassword } = require('../../lib/passwords'); // 해시+솔트+반복으로 비밀번호 암호화&검증
const {getAlertScript} = require('../../lib/usefulJS');

//GET /sign-in
const signInForm = async (req, res, next) =>{ // 로그 인 페이지 보여주기
    try{
        const {user} = req.session; // 유저 정보 불러와서
        if(user) return res.redirect('/'); // 이미 유저 정보가 존재 = 로그인 상태면 리다이렉션
        else return res.status(200).render('auth/sign-in.pug', {user, csrfToken: req.csrfToken()}); // 아니라면 로그인 페이지 보이기
    }catch(err){
        return next(err);
    }
};

//POST /sign-in
const signIn = async (req, res, next) =>{ // 로그 인 시도
    try{
        const {id, password, keepSignedIn} = req.body; // 입력 받은 값
        if(!id || !password) throw new Error('BAD_REQUEST'); // 잘못된 요청


        if(keepSignedIn === undefined) req.session.keepSignedIn = false; // 자동 로그인 off 
        else if(keepSignedIn === "on") req.session.keepSignedIn = true; // 자동 로그인 on
        

        const user = await UserDAO.getById(id); // id로 유저 찾기
        if(!user) throw new Error('UNAUTHORIZED'); // 못 찾았으면 Unauthorized

        const isValid = await verifyPassword(password, user.password); // 패스워드 비교하기
        if(!isValid) throw new Error('UNAUTHORIZED'); // 틀렸으면 Unauthorized

        req.session.user = {
            id: user.id,
            nick: user.nick,
        };
        return res.redirect(303, '/'); // 로그인 성공
    }catch(err){
        return next(err); //에러 객체를 error-handler에 전달
    }
};

//GET /sign-up
const signUpForm = async (req, res, next) =>{ // 회원 가입 페이지 보여주기
    try{
        const {user} = req.session; // 유저 정보 불러와서
        if(user) return res.redirect('/'); // 이미 유저 정보가 존재 = 로그인 상태면 리다이렉션
        return res.status(200).render('auth/sign-up.pug', { user, csrfToken: req.csrfToken() }); // 아니라면 회원 가입 페이지 보이기
    }catch(err){
        return next(err);
    }
};

//POST /sign-up
const signUp = async (req, res, next) =>{ // 회원 가입 시도
    try{
        const {id, password, nick} = req.body;
        if(!id || id > 20 || !password || !nick || nick > 20) throw new Error('BAD_REQUEST'); // 잘못된 입력 처리
        const encryptedPassword = await generatePassword(password); // 비밀번호를 암호화.

        const result = await UserDAO.createUser(id, encryptedPassword, nick); // 유저 정보 생성. 성공하면 true. 실패하면 false.
        if(result === false) return res.status(400).send(getAlertScript("이미 존재하는 ID입니다!")); // 실패. 이미 존재하기 때문.
        else if(result === true) return res.redirect(303, '/auth/sign-in'); // 성공. 리다이렉션. 303 See Other
        else throw err;
    }catch(err){
        return next(err);
    }
};

//POST /sign-out
const signOut = async (req, res, next) =>{ // 로그 아웃하기
    try{
        req.session.destroy(err => {
            if(err) throw err;
            else return res.redirect(303, '/');
        }); // 세션을 파괴하면 됨
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