const {runQuery} = require('../lib/database');


const getById = async (id) => {
    const sql = 'SELECT id, password, nick FROM users WHERE id = $1';
    const result =  await runQuery(sql, [id]); //id를 기준으로 유저의 정보 확인.
    return result[0]; //없으면 undefined. 아니면 해당 유저에 대한 오브젝트가 제대로 나옴.
};

const create = async (id, password, nick) => {
    const sql = 'INSERT INTO users values($1, $2, $3)'; //id, password, nick을 받아서 유저 테이블에 삽입.
    //새로운 유저가 등록되는 회원 가입 과정.
    await runQuery(sql, [id, password, nick]);
};


module.exports = {
    getById,
    create,
};    