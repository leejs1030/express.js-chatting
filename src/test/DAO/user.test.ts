import { UserDAO } from '../../main/DAO';
import { verifyPassword } from '../../main/lib/passwords';
import db = require('../../main/lib/dbconnection');
import { expect } from 'chai';
import { user } from 'custom-type';

describe('Test UserDAO', async ()=>{
    it('Find/Create user by using id', async ()=>{
        
        const admin = {id: 'admin', nick: '관리자', pass: 'admin'};
        const user = await UserDAO.getById(admin.id) as user;
        expect(user.nick).equal(admin.nick);
        expect(user.id).equal(admin.id);
        expect(await verifyPassword(admin.pass, user.password as string)).to.be.true;
        
        let success;
        const tempuser = {id: 'adsfjoi', nick: 'sadfi', pass: 'fsoidj'};
        try{
            success = await UserDAO.createUser(tempuser.id, tempuser.pass, tempuser.nick);
            expect(success).to.be.true;
            success = await UserDAO.createUser(tempuser.id, tempuser.pass, tempuser.nick);
            expect(success).to.be.false;
        } finally{
            await db.none('DELETE FROM users WHERE id = $1', tempuser.id);
            expect(await UserDAO.getById(tempuser.id)).equal(null);
        }

        success = await UserDAO.createUser(admin.id, admin.pass, admin.nick);
        expect(success).equal(false);
        
    });

    it('Set/Get uesr_settings by user id', async () =>{
        const setting = await UserDAO.getSettingById('admin');
        expect(setting.send_enter).to.be.a(typeof(true));
    });
});