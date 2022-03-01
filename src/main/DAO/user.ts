import { user, user_setting } from 'custom-type';
import db from '../lib/dbconnection';
import { errorAt } from '../lib/usefulJS';

async function getById(id: string, task = db): Promise<user | null> {
    // 기본값은 db. 간혹 task 안에서 수행이 필요할 경우 getById(id, t); 형태로
    try {
        return await task.oneOrNone('SELECT id, password, nick FROM users WHERE id = $1', [id]) as (user | null);
        //id를 기준으로 유저의 정보 확인.
    } catch (err) {
        throw errorAt('getById', err);
    }
}

async function createUser(id: string, encryptedPassword: string, nick: string, task = db): Promise<boolean> { // 새 유저 생성
    const sql1 = 'INSERT INTO users values($1, $2, $3)'; // id, password, nick을 받아서 유저 테이블에 삽입.
    const sql2 = 'INSERT INTO user_settings values($1)'; // 유저 설정 값 테이블에도 등록
    return task.tx('create-user', async (t: any) => {
        if (await getById(id, t))
            return false; // id 중복 확인 과정. 중복이면 생성 실패(return false).
        await t.none(sql1, [id, encryptedPassword, nick]);
        await t.none(sql2, [id]);
        return true;
    })
        .catch((err: Error) => { throw errorAt('createUser', err); });
}

async function getSettingById(id: string, task = db): Promise<user_setting> { // 유저의 설정 값을 불러옴
    try {
        return await task.one('SELECT * FROM user_settings WHERE id = $1', [id]);
    } catch (err) {
        throw errorAt('getSettingById', err);
    }
}

async function setSettingById(info: user_setting, task = db): Promise<0> { // 유저의 설정 값을 업데이트함.
    try {
        await task.none('UPDATE user_settings SET send_enter = ${info.send_enter} WHERE id = ${info.id}', { info });
        // 설정 값이 여러 개가 필요하게 될 경우, []보다는 {}이 더 유용할 것. 따라서 미리 그렇게 함.
        return 0;
    } catch (err) {
        throw errorAt('setSettingById', err);
    }
}

export {
    getById,
    createUser,
    getSettingById,
    setSettingById,
};    