const {runQuery, beginTransaction, commitTransaction, rollBackTransaction} = require('../lib/database');
const {errorAt} = require('../lib/usefulJS');

const getById = async (id) => {
    try{
        const sql = 'SELECT id, password, nick FROM users WHERE id = $1';
        const result =  await runQuery(sql, [id]); //id를 기준으로 유저의 정보 확인.
        return result[0]; //없으면 undefined. 아니면 해당 유저에 대한 오브젝트가 제대로 나옴.
    } catch(err){
       throw errorAt('getById', err);
    }
};

const createUser = async (id, encryptedPassword, nick) =>{ // 새 유저 생성
    try{
        await beginTransaction(); // 연속 쿼리. 데이터 수정 있음.
        const isExist = await getById(id); //id 중복 확인 과정
        if(isExist){
            await rollBackTransaction();
            return false; // 중복이라면 생성 실패.
        }
        const sql = 'INSERT INTO users values($1, $2, $3)'; // id, password, nick을 받아서 유저 테이블에 삽입.
        const sql2 = 'INSERT INTO user_settings values($1)'; // 유저 설정 값 테이블에도 등록
        await runQuery(sql, [id, encryptedPassword, nick]);
        await runQuery(sql2, [id]);
        await commitTransaction();
        return true;
    } catch(err){
        console.log(err);
        await rollBackTransaction();
        throw errorAt('createUser', err);
    }
}

const getSettingById = async(id) =>{ // 유저의 설정 값을 불러옴
    try{
        const sql = "select * from user_settings WHERE id = $1";
        const result = await runQuery(sql, [id]);
        return result[0];
    } catch(err){
        throw errorAt('getSettingById', err);
    }
}

const setSettingById = async(id, info) =>{ // 유저의 설정 값을 업데이트함.
    try{
        const sql = "UPDATE user_settings SET send_enter = $2 WHERE id = $1";
        let {send_enter} = info;
        await runQuery(sql, [id, send_enter]);
        return 0;
    } catch(err){
        throw errorAt('setSettingById', err);
    }
}

module.exports = {
    getById,
    createUser,
    getSettingById,
    setSettingById,
};    