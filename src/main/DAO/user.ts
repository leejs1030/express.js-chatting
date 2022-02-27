import db = require('../lib/dbconnection');
import { errorAt } from '../lib/usefulJS';

const getById = async (id, task = db) => { // task를 위한 호출을 생각하자.
    // 기본값은 db. 간혹 task 안에서 수행이 필요할 경우 getById(id, t); 형태로
    try{
        return await task.oneOrNone('SELECT id, password, nick FROM users WHERE id = $1', [id]); //id를 기준으로 유저의 정보 확인.
        // db.oneOrNone - 결과가 하나면 그대로 리턴. 0개면 null 리턴. 그 외는 오류.
    } catch(err){
        throw errorAt('getById', err);
    }
};

const createUser = async (id, encryptedPassword, nick, task = db) =>{ // 새 유저 생성
    const sql1 = 'INSERT INTO users values($1, $2, $3)'; // id, password, nick을 받아서 유저 테이블에 삽입.
    const sql2 = 'INSERT INTO user_settings values($1)'; // 유저 설정 값 테이블에도 등록
    return task.tx('create-user', async t =>{
        const isExist = await getById(id, t); //id 중복 확인 과정.
        if(isExist) return false; // 중복. 생성 실패.
        await t.none(sql1, [id, encryptedPassword, nick]);
        await t.none(sql2, [id]);
        return true;
    }).then(data => data)
    .catch(err => {throw errorAt('createUser', err);})
}

const getSettingById = async (id, task = db) =>{ // 유저의 설정 값을 불러옴
    try{
        return await task.one('SELECT * FROM user_settings WHERE id = $1', [id]);
    } catch(err){
        throw errorAt('getSettingById', err);
    }
}

const setSettingById = async(id, info, task = db) =>{ // 유저의 설정 값을 업데이트함.
    try{
        await task.none('UPDATE user_settings SET send_enter = ${info.send_enter} WHERE id = ${id}', {id, info});
        // 설정 값이 여러 개가 필요하게 될 경우, []보다는 {}이 더 유용할 것. 따라서 미리 그렇게 함.
        return 0;
    } catch(err){
        throw errorAt('setSettingById', err);
    }
}

export {
    getById,
    createUser,
    getSettingById,
    setSettingById,
};    