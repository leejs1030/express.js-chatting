const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env; // 환경 변수
import pgp from 'pg-promise';

const cn = {
    host: DB_HOST as string,
    port: parseInt(DB_PORT as string),
    database: DB_NAME as string,
    user: DB_USER as string,
    password: DB_PASS as string,
    max: 30 as number,
}; // DB connection object

const db = pgp()(cn); // object 가지고 db 연결

export = db; // export함. 쿼리 하거나 할 때 쓸 것.