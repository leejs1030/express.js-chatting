import { getAlertScript } from "./usefulJS";

const errorHandler = (err, req, res, next) => { // 적절한 에러 코드와 함께 보내기
    const {user} = req.session;
    switch (err.message) {
        case 'BAD_REQUEST':
            return res.status(400).send(getAlertScript('Invalid parameters!'));
        case 'UNAUTHORIZED':
            return res.status(401).send(getAlertScript('Login failure!'));
        case 'NOT_FOUND':
            return res.status(404).render('error.pug', {
                errorCode: 404,
                errorMsg: 'Not Found',
                user,
            });
        default:
            if (process.env.MODE !== 'prod') console.error('\x1b[31m%s\x1b[0m', err);
            return res.status(500).render('error.pug', {
                errorCode: 500,
                errorMsg: 'Internal Server Error',
                user,
            });
    }
};

export { errorHandler };
