const db = require('../main/lib/dbconnection');
const expect = require('expect.js');
const {queryResultErrorCode, QueryResultError} = require('pg-promise').errors;

describe('Studying pg-promise API with reference documents', async () =>{
    it('Test for db.none', async () =>{
        const isUserExists = (id) => async (t) => { // 유저가 존재하는지 확인함
            const sql = 'SELECT * FROM users WHERE id = $1';
            try {await t.none(sql, [id])}
            catch(err) { return true; }
            return false;
        }
        let [res1, res2] = await db.task('check user is existence', async(t) =>{
            return t.batch([await isUserExists('asdifjjfdslj')(t), await isUserExists('admin')(t)]);
        });
        expect(res1).to.be(false);
        expect(res2).to.be(true);
    });

    it('Test for db.tx (transaction)', async () =>{ // transaction 공부를 위함.
        let a = await db.one('SELECT money, debt FROM test WHERE id = $1', ['lee']); // 초기 값
        await db.tx('fail transaction', async (t) =>{
            await t.query('UPDATE test SET money = money - 1000 WHERE id = $1', ['lee']);
            await t.query('fdijadlfsadflksaofi'); await t.query('fdijadlfsadflksaofi'); await t.query('fdijadlfsadflksaofi'); await t.query('fdijadlfsadflksaofi'); await t.query('fdijadlfsadflksaofi'); await t.query('fdijadlfsadflksaofi'); await t.query('fdijadlfsadflksaofi'); await t.query('fdijadlfsadflksaofi');// 문제 발생. 롤백
            await t.query('UPDATE test SET debt = debt - 1000 WHERE id = $1', ['lee']);
        })
        .then(data => {expect(1).to.be(2);})
        .catch(err => { console.log("rollback!"); })
        let b = await db.one('SELECT money, debt FROM test WHERE id = $1', ['lee']); // 롤백이므로 무변화
        await db.tx('success transaction', async (t) =>{ // 정상 수행
            await t.query('UPDATE test SET money = money- 1000 WHERE id = $1', ['lee']);
            await t.query('UPDATE test SET debt = debt - 1000 WHERE id = $1', ['lee']);
        })
        let c = await db.one('SELECT money, debt FROM test WHERE id = $1', ['lee']); // 정상이므로 바뀌었음
        // const result = await db.any('UPDATE test SET money = 10000, debt = 30000 WHERE id = $1', ['lee']);
        expect(a.money - 1000).to.be(c.money); expect(a.debt - 1000).to.be(c.debt);
        expect(a.money).to.be(b.money); expect(a.debt).to.be(b.debt);
    });

    it('Test for db.one vs db.any', async () =>{
        let one = await db.one('SELECT money, debt FROM test WHERE id = $1', ['lee']); // 하나의 객체
        let any = await db.any('SELECT money, debt FROM test WHERE id = $1', ['lee']); // (객체의) 배열
        expect(one).to.a(typeof({})); // 하나의 객체
        expect(any).to.a(typeof([])); // 배열
        expect(any[0]).to.a(typeof({})); // 객채의 배열
        try{
            await db.one('SELECT money, debt FROM test WHERE id = $1', ['adsf']);
        } catch(err){
            expect(err).to.be.an(QueryResultError);
        }
    });

    it('Test for return Value', async () => {
        try{
            await db.none('DELETE FROM test WHERE id = $1', ['jfdsaijfa']);
            await db.none('INSERT INTO test VALUES($1, $2, $3)', ['jfdsaijfa', 0, 1000]);
            await db.none('DELETE FROM test WHERE id = $1', ['jfdsaijfa']);
            expect(true).to.be(true);
        } catch(err){
            expect(false).to.be(true);
        }
        try{
            await db.one('SELECT * FROM users WHERE id = $1', ['admin']);
            await db.any('SELECT * FROM users');
            expect(true).to.be(true);
        } catch(err){
            expect(false).to.be(true);
        }
        
        await db.one('SELECT * FROM users WHERE id = $1', ['asdf']).then(data => {console.log("why can?"); expect(true).to.be(false);})
        .catch(err => {console.log("no return for one!");expect(false).to.be(false);});
        
    });

});