const {db} = require('../main/lib/dbconnection');
const expect = require('expect.js');

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

    it('Test for db.tx (transaction)', async () =>{
        let a = await db.one('SELECT money, debt FROM test WHERE id = $1', ['lee']); // 초기 값
        await db.tx('fail transaction', async (t) =>{
            t.query('UPDATE test SET money = money - 1000 WHERE id = $1', ['lee']);
            t.query('fdijadlfsadflksaofi'); // 문제 발생. 롤백
            t.query('UPDATE test SET debt = debt - 1000 WHERE id = $1', ['lee']);
        });
        let b = await db.one('SELECT money, debt FROM test WHERE id = $1', ['lee']); // 롤백이므로 무변화
        await db.tx('success transaction', async (t) =>{
            t.query('UPDATE test SET money = money- 1000 WHERE id = $1', ['lee']);
            t.query('UPDATE test SET debt = debt - 1000 WHERE id = $1', ['lee']);
        });// 정상 수행
        let c = await db.one('SELECT money, debt FROM test WHERE id = $1', ['lee']); // 정상이므로 바뀌었음
        expect(a.money).to.be(b.money); expect(a.debt).to.be(b.debt);
        expect(a.money - 1000).to.be(c.money); expect(a.debt - 1000).to.be(c.debt);
    });

    it('Test for db.one vs db.any', async() =>{
        let one = await db.one('SELECT money, debt FROM test WHERE id = $1', ['lee']);
        let any = await db.any('SELECT money, debt FROM test WHERE id = $1', ['lee']);
        expect(one).to.a(typeof({}));
        expect(any).to.a(typeof([]));
        expect(any[0]).to.a(typeof({}));
    })
});