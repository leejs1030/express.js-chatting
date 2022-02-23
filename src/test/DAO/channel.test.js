const {ChannelDAO} = require('../../main/DAO');
const expect = require('expect.js');

describe('Test ChannelDAO', async () => {
    it('Test getting Channel Info related to user', async () =>{
        let uid = 'subadmin'
        const channels = await ChannelDAO.getChannelsByUserId(uid);
        expect(Array.isArray(channels)).equal(true);
        for await (const e of channels) {
            expect(e.id).a(typeof(1));
            expect(e.id).greaterThan(0);
            expect(e.name).a(typeof('s'));
            expect(e.unread).a(typeof(1));
            expect(e.unread).greaterThan(-1);
            expect(e.updatetime).a(typeof('s'));
            expect(e.creater).a('string');
            let a = await ChannelDAO.getChannelUnreadById(e.id, uid);
            expect(a).equal(e.unread);
            let b = await ChannelDAO.getChannelInfoById(e.id, uid);
            expect(e).eql(b);
            let c = await ChannelDAO.getChannelInfoById(e.id);
            expect(c.unread).equal(undefined);
        }
    });

    it('Test count channel joined', async () =>{
        let num = await ChannelDAO.countChannelsByUserId('subadmin');
        expect(num).a(typeof(1));
        expect(num).within(0, Infinity);
    })
});