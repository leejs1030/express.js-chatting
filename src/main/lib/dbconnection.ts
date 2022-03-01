const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env; // 환경 변수
const pgp = require('pg-promise')(); // postgresql 연동용.

const cn = {
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS,
    max: 30,
}; // DB connection object

const db = pgp(cn); // object 가지고 db 연결

export = db; // export함. 쿼리 하거나 할 때 쓸 것.