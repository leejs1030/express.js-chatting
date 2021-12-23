const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;
// require("dotenv").config();
const pgp = require("pg-promise")();

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

const connectionString = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
const db = pgp(connectionString);

module.exports = {pgp, db};