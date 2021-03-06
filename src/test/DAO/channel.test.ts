import { ChannelDAO } from '../../main/DAO';
import { expect } from 'chai';

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
            expect(e.update_time).a(typeof('s'));
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
        let firstid: number = 0, secondid: number = 0;
        try{firstid = await ChannelDAO.createChannel('temp', 'subadmin');}
        finally{await ChannelDAO.deleteChannel(firstid);}
        try{secondid = await ChannelDAO.createChannel('temp', 'subadmin');}
        finally{await ChannelDAO.deleteChannel(secondid);}
        expect(firstid).a(typeof(1));
        expect(firstid + 1).equal(secondid);
    });

    it('Test count channel joined', async () =>{
        let num = await ChannelDAO.countChannelsByUserId('subadmin');
        expect(await ChannelDAO.countChannelsByUserId('asdfkuajfds')).equal(0);
        expect(num).a(typeof(1));
        expect(num).within(0, Infinity);
        let cid = await ChannelDAO.createChannel('fdsa', 'subadmin');
        try{
            expect(num + 1).equal(await ChannelDAO.countChannelsByUserId('subadmin'));
        } finally{
            await ChannelDAO.deleteChannel(cid);
        }
        expect(num).equal(await ChannelDAO.countChannelsByUserId('subadmin'));
    });

    it('Test checking and including user in channel', async () =>{
        const uid = 'subadmin', unick = '????????????';
        const cid = await ChannelDAO.createChannel('temp', uid);
        expect(await ChannelDAO.isChannelCreater(cid, uid)).equal(true); // ????????? ?????????
        expect(await ChannelDAO.isChannelMember(cid, uid)).equal(true); // ????????? ??????
        expect(await ChannelDAO.isChannelMember(cid, 'admin')).equal(false); // admin??? ?????? ??????
        await ChannelDAO.includeToChannel(cid, 'admin'); // admin ????????????
        const members = (await ChannelDAO.getMemberFromChannel(cid, uid)); // ?????? ????????? ?????????
        expect(await ChannelDAO.isChannelCreater(cid, 'admin')).equal(false); // admin??? ???????????? ??????
        expect(await ChannelDAO.isChannelMember(cid, 'admin')).equal(true); // admin??? ?????????
        const me = (members[0].id == uid) ? members[0] : members[1];
        expect(me.canRequest).to.be.false; expect(me.canBlack).to.be.false; // ??????????????? ??????/?????? ??????
        expect(me.id).equal(uid); expect(me.nick).equal(unick); // ?????? ?????? ??????????
        const you = (members[0].id != uid) ? members[0] : members[1];
        expect(you.canRequest).a(typeof(true)); expect(you.canBlack).a(typeof(true)); // ????????? ??????/????????? ???????????? ??????
        expect(you.id).equal('admin'); expect(you.nick).equal('?????????'); // ????????? ???????
        await ChannelDAO.deleteChannel(cid);
    });

    it('Test quit channel', async() =>{
        const uid = 'subadmin', unick = '????????????';
        const cid = await ChannelDAO.createChannel('temp', uid);
        await ChannelDAO.includeToChannel(cid, 'admin');
        await ChannelDAO.quitChannel(cid, 'admin');
        expect(await ChannelDAO.isChannelMember(cid, 'admin')).to.be.false;
        await ChannelDAO.deleteChannel(cid);
    })

    it('Test messages', async() =>{
        const subadmin = {id: 'subadmin', nick: '????????????'};
        const admin = {id: 'admin', nick: '?????????'};
        const msg = ['hello I am testing.', 'Are you testing too?'];
        let cid: number = 0;
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
        const subadmin = {id: 'subadmin', name: '????????????'};
        let cid: number = 0;
        try{
            cid = await ChannelDAO.createChannel('temp', subadmin.id);
            let friendlist = await ChannelDAO.getFriendsByIdNotInChannel(subadmin.id, cid);
            expect(friendlist.length).within(0, Infinity);
            for (var e of friendlist){
                console.log(e);
                expect(e.id).a('string');
                expect(e.nick).a('string');
                expect(e.friend_time).a('string');
                await ChannelDAO.includeToChannel(cid, e.id);
            };
            friendlist = await ChannelDAO.getFriendsByIdNotInChannel(subadmin.id, cid);
            expect(friendlist.length).equal(0);
        } finally{
            await ChannelDAO.deleteChannel(cid);
        }
    })
});