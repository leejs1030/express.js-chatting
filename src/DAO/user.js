const {runQuery, beginTransaction, commitTransaction} = require('../lib/database');
const {errorAt} = require('../lib/usefulJS');

const getById = async (id) => {
    try{
        const sql = 'SELECT id, password, nick FROM users WHERE id = $1';
        const result =  await runQuery(sql, [id]); //id를 기준으로 유저의 정보 확인.
        return result[0]; //없으면 undefined. 아니면 해당 유저에 대한 오브젝트가 제대로 나옴.
    } catch(err){
       return errorAt('getById', err);
    }
};

const create = async (id, password, nick) => {
    try{
        const sql = 'INSERT INTO users values($1, $2, $3)'; //id, password, nick을 받아서 유저 테이블에 삽입.
        //새로운 유저가 등록되는 회원 가입 과정.
        const sql2 = 'INSERT INTO user_settings values($1)';
        await beginTransaction();
        await runQuery(sql, [id, password, nick]);
        await runQuery(sql2, [id]);
        await commitTransaction();
        return true;
    } catch(err){
        return errorAt('create', err);
     }
};

const getSettingById = async(id) =>{
    try{
        const sql = "select * from user_settings WHERE id = $1";
        const result = await runQuery(sql, [id]);
        return result[0];
    } catch(err){
        return errorAt('getSettingById', err);
     }
}

const setSettingById = async(id, info) =>{
    try{
        const sql = "UPDATE user_settings SET send_enter = $2 WHERE id = $1";
        let {send_enter} = info;
        return await runQuery(sql, [id, send_enter]);
    } catch(err){
        return errorAt('setSettingById', err);
     }
}

module.exports = {
    getById,
    create,
    getSettingById,
    setSettingById,
};    