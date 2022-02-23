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
    
    it('Test create/deleting channel', async() =>{
        const firstid = await ChannelDAO.createChannel('temp', 'subadmin');
        const secondid = await ChannelDAO.createChannel('temp', 'subadmin');
        await ChannelDAO.deleteChannel(firstid);
        await ChannelDAO.deleteChannel(secondid);
        expect(firstid).a(typeof(1));
        expect(firstid + 1).equal(secondid);
    });

    it('Test count channel joined', async () =>{
        let num = await ChannelDAO.countChannelsByUserId('subadmin');
        expect(num).a(typeof(1));
        expect(num).within(0, Infinity);
        let cid = await ChannelDAO.createChannel('fdsa', 'subadmin');
        expect(num + 1).equal(await ChannelDAO.countChannelsByUserId('subadmin'));
        await ChannelDAO.deleteChannel(cid);
        expect(num).equal(await ChannelDAO.countChannelsByUserId('subadmin'));
    });

    it('Test checking and including user in channel', async () =>{
        const uid = 'subadmin', unick = '부관리자';
        const cid = await ChannelDAO.createChannel('temp', uid);
        expect(await ChannelDAO.isChannelCreater(cid, uid)).equal(true); // 자신은 생성자
        expect(await ChannelDAO.isChannelMember(cid, uid)).equal(true); // 자신은 멤버
        expect(await ChannelDAO.isChannelMember(cid, 'admin')).equal(false); // admin은 멤버 아님
        await ChannelDAO.includeToChannel(cid, 'admin'); // admin 초대하면
        const members = (await ChannelDAO.getMemberFromChannel(cid, uid)); // 멤버 리스트 불러옴
        expect(await ChannelDAO.isChannelCreater(cid, 'admin')).equal(false); // admin은 생성자가 아님
        expect(await ChannelDAO.isChannelMember(cid, 'admin')).equal(true); // admin은 멤버임
        const me = (members[0].id == uid) ? members[0] : members[1];
        expect(me.canRequest).not.ok(); expect(me.canBlack).not.ok(); // 자신에게는 요청/블랙 불가
        expect(me.id).equal(uid); expect(me.nick).equal(unick); // 내가 맞게 나왔나?
        const you = (members[0].id != uid) ? members[0] : members[1];
        expect(you.canRequest).a(typeof(true)); expect(you.canBlack).a(typeof(true)); // 상대방 요청/블랙은 상황마다 다름
        expect(you.id).equal('admin'); expect(you.nick).equal('관리자'); // 상대방 맞나?
        await ChannelDAO.deleteChannel(cid);
    });

    it('Test quit channel', async() =>{
        const uid = 'subadmin', unick = '부관리자';
        const cid = await ChannelDAO.createChannel('temp', uid);
        await ChannelDAO.includeToChannel(cid, 'admin');
        await ChannelDAO.quitChannel(cid, 'admin');
        expect(await ChannelDAO.isChannelMember(cid, 'admin')).not.ok();
        await ChannelDAO.deleteChannel(cid);
    })

    it('Test messages', async() =>{
        const subadmin = {id: 'subadmin', nick: '부관리자'};
        const admin = {id: 'admin', nick: '관리자'};
        const msg = ['hello I am testing.', 'Are you testing too?'];
        let cid;
        try{
            cid = await ChannelDAO.createChannel('tempchannel', subadmin.id);
            await ChannelDAO.includeToChannel(cid, admin.id);
            await ChannelDAO.sendMsg(subadmin.id, cid, msg[0]); await ChannelDAO.sendMsg(subadmin.id, cid, msg[1]);
            const {msglist, unread} = await ChannelDAO.getMsgFromChannel(cid, admin.id);
            let arr = msglist.map(e => e.msg);
            expect(arr).eql(msg);
            expect(unread).equal(3);
            await ChannelDAO.readMsgFromChannel(admin.id, cid);
            expect((await ChannelDAO.getMsgFromChannel(cid, admin.id)).unread).equal(0);
        } finally {
            await ChannelDAO.deleteChannel(cid);
        }
    })

    it('Test getFriendsByIdNotInChannel', async () =>{
        const subadmin = {id: 'subadmin', name: '부관리자'};
        let cid;
        try{
            cid = await ChannelDAO.createChannel('temp', subadmin.id);
            let friendlist = await ChannelDAO.getFriendsByIdNotInChannel(subadmin.id, cid);
            expect(friendlist.length).within(0, Infinity);
            friendlist.forEach(async e => {
                expect(e.id).a('string');
                expect(e.nick).a('string');
                expect(e.friend_date).a('string');
                await ChannelDAO.includeToChannel(cid, e.id);
            })
            friendlist = await ChannelDAO.getFriendsByIdNotInChannel(subadmin.id, cid);
            expect(friendlist.length).equal(0);
        } finally{
            await ChannelDAO.deleteChannel(cid)
        }
    })
});