const db = require('../lib/dbconnection');
const {errorAt} = require('../lib/usefulJS');
const {queryResultErrorCode} = require('pg-promise').errors;

const getById = async (id, task = db) => { // task를 위한 호출을 생각하자.
    // 기본값은 db. 간혹 task 안에서 수행이 필요할 경우 getById(id, t); 형태로
    try{
        return await task.one('SELECT id, password, nick FROM users WHERE id = $1', [id]); //id를 기준으로 유저의 정보 확인.
        // db.one은 결과가 하나가 아니라면 오류를 뿜음
    } catch(err){
        if(err.name === 'QueryResultError' && err.code === queryResultErrorCode.noData) // 쿼리 결과 오류(리턴값 없음의 경우)
            return null; // 없으니까 null. 아니면 해당 유저에 대한 오브젝트가 제대로 나옴.
        else return errorAt('getById', err);
    }
};

const createUser = async (id, encryptedPassword, nick, task = db) =>{ // 새 유저 생성
    const result = task.tx('create-user', async t =>{
        const isExist = await getById(id, t); //id 중복 확인 과정.
        if(isExist || isExist instanceof Error) return false; // 중복. 생성 실패.
        const sql1 = 'INSERT INTO users values($1, $2, $3)'; // id, password, nick을 받아서 유저 테이블에 삽입.
        const sql2 = 'INSERT INTO user_settings values($1)'; // 유저 설정 값 테이블에도 등록
        t.none(sql1, [id, encryptedPassword, nick]);
        t.none(sql2, [id]);
        return true;
    }).then(data => data)
    .catch(err => {console.error(err); return false;})
    return result;
}

const getSettingById = async (id, task = db) =>{ // 유저의 설정 값을 불러옴
    try{
        return await task.one('SELECT * FROM user_settings WHERE id = $1', [id]);
    } catch(err){
        return errorAt('getSettingById', err);
    }
}

const setSettingById = async(id, info, task = db) =>{ // 유저의 설정 값을 업데이트함.
    try{
        task.none('UPDATE user_settings SET send_enter = ${info.send_enter} WHERE id = ${id}', {id, info});
        // 설정 값이 여러 개가 필요하게 될 경우, []보다는 {}이 더 유용할 것. 따라서 미리 그렇게 함.
        return 0;
    } catch(err){
        return errorAt('setSettingById', err);
    }
}

module.exports = {
    getById,
    createUser,
    getSettingById,
    setSettingById,
};    