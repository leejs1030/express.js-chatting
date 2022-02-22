const {UserDAO} = require('../../main/DAO');
const {verifyPassword} = require('../../main/lib/passwords');
const expect = require('expect.js');
const { db } = require('../../main/lib/dbconnection');

describe('Test UserDAO', async ()=>{
    it('Find/Create user by using id', async ()=>{
        const user = await UserDAO.getById('admin');
        expect(user.nick).to.be('관리자');
        expect(user.id).to.be('admin');
        expect(await verifyPassword('admin', user.password)).to.be(true);
        await db.none('DELETE FROM users WHERE id = $1', ['adsfjoi']);
        let success = await UserDAO.createUser('adsfjoi', 'sadfi', 'fsoidj');
        expect(success).to.be(true);
        success = await UserDAO.createUser('adsfjoi', 'sadfi', 'fsoidj');
        expect(success).to.be(false);
        await db.none('DELETE FROM users WHERE id = $1', ['adsfjoi']);
    });

    it('Set/Get uesr_settings by user id', async () =>{
        const setting = await UserDAO.getSettingById('admin');
        expect(setting.send_enter).to.be.a(typeof(true));
    })
});