const db = require('./dbconnection');


const runQuery = async (sql, values) =>{ // 쿼리와 값을 받아서 결과를 리턴함
	try{
		const result = await db.any(sql, values); // sql 인젝션 방지
		return result;
	} catch(err) {
		console.log(err);
		throw err;
	}
};

const beginTransaction = async () =>{ // 트랜잭션용
	try{
		return runQuery('begin transaction;', {});
	} catch(err){
		console.log(err);
		throw err;
	}
};

const commitTransaction = async () =>{ // 트랜잭션용
	try{
		return runQuery('commit;', {});
	} catch(err){
		console.log(err);
		throw err;
	}
};

const rollBackTransaction = async () => { // 트랜잭션용
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
