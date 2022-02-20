// const pg = require("pg"); // postgresql 연동용. 더 이상 쓰지 않음.

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env; // 환경 변수
// require("dotenv").config();
const pgp = require("pg-promise")(); // postgresql 연동용.

// console.log(process.env.DB_HOST);
// console.log(process.env.DB_PORT);
// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);
// console.log(process.env.DB_NAME);

// console.log(DB_HOST);
// console.log(DB_PORT);
// console.log(DB_USER);
// console.log(DB_PASS);
// console.log(DB_NAME);


// const cn = new pg.Pool({
//     host: DB_HOST,
//     port: DB_PORT,
//     database: DB_NAME,
//     user: DB_USER,
//     password: DB_PASS
//     max: 30 // use up to 30 connections
// });


const connectionString = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`; // db 연결용 string
const db = pgp(connectionString); // db 연결

module.exports = {pgp, db}; // export함. 쿼리 하거나 할 때 쓸 것.