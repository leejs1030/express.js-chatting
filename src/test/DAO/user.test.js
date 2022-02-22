const {UserDAO} = require('../../main/DAO');
const expect = require('expect.js');

describe('Test UserDAO', async ()=>{
    it('finding user by using id', async ()=>{
        const user = await UserDAO.getById("admin");
        expect(user.nick).to.equal("관리자");
    });
});