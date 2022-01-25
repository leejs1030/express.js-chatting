const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;
const {pgp, db} = require('./dbconnection');


const runQuery = async (sql, values) =>{
	try{
		const result = await db.any(sql, values);
		return result;
	} catch(err) {
		console.log(err);
		throw err;
	}
};

const beginTransaction = async () =>{
	try{
		return runQuery('begin transaction;', {});
	} catch(err){
		console.log(err);
		throw err;
	}
};

const commitTransaction = async () =>{
	try{
		return runQuery('commit;', {});
	} catch(err){
		console.log(err);
		throw err;
	}
};

const rollBackTransaction = async () => {
	try {
		return runQuery('rollback;', {});
	} catch(err){
		console.log(err);
		throw err;
	}
}

module.exports = { runQuery, beginTransaction, commitTransaction, rollBackTransaction };



// const { Client } = require('pg');

// const client = new Client({
//     user: DB_USER,
// 	password: DB_PASS,
//     host: DB_HOST,
// 	port: DB_PORT,
//     database: DB_NAME
// });

// const runQuery = async (sql, values) =>{
// 	client.connect();
// 	try{
// 		var result = await client.query({
// 			rowMode: 'array',
// 			text: sql,
// 			values
// 		});
// 		return result.rows;
// 	} finally{
// 		client.end();
// 	}
// };
