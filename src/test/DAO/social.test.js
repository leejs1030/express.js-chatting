const {SocialDAO} = require('../../main/DAO');
const expect = require('expect.js');
const {db} = require('../../main/lib/dbconnection');

const tempuser = [{id: 'temp0', pass: 'temppass', nick: '임시0'},
{id: 'temp1', pass: 'temppass', nick: '임시1'},
{id: 'temp2', pass: 'temppass', nick: '임시2'}]; // 편하게 유저(임시. 지웠다 만들었다 하기) 다루기
const admin = {id: 'admin', nick: '관리자'}, subadmin = {id: 'subadmin', nick: '부관리자'}; // 관리자, 부관리자 다루기
const create = require('../../main/DAO/user').createUser;

const createUser = async (user) => await create(user.id, user.pass, user.nick); // 편하게 유저 만들기
const deleteUser = async (uid) => await db.none('DELETE FROM users WHERE id = $1', [uid]); // 편하게 유저 삭제하기

describe('Test SocialDAO', async () =>{
    it('canSendRequest, newRequest, cancelRequest', async () =>{
        const cur = tempuser[0];
        try{
            await createUser(cur);
            expect(await SocialDAO.canSendRequest(cur.id, subadmin.id)).ok(); // 처음엔 당연히 요청 가능.
            expect(await SocialDAO.canSendRequest(cur.id, admin.id)).ok(); // 얘는 변화 없으니 쭉 블랙 가능이어야 함
            await SocialDAO.newRequest(cur.id, subadmin.id); // 요청 전송
            expect(await SocialDAO.canSendRequest(cur.id, subadmin.id)).not.ok(); // 요청 전송 했으니 재요청 불가
            expect(await SocialDAO.canSendRequest(cur.id, admin.id)).ok();
            await SocialDAO.cancelRequest(cur.id, subadmin.id); // 요청 삭제(거절/취소)
            expect(await SocialDAO.canSendRequest(cur.id, subadmin.id)).ok(); // 이젠 다시 요청 가능
            expect(await SocialDAO.canSendRequest(cur.id, admin.id)).ok();
        } catch(err){
            throw err;
        } finally{
            await deleteUser(cur.id); // 꼭 삭제
        }
    });

    it('canAddBlack, newBlack, unBlack', async () =>{
        const cur = tempuser[0];
        try{
            await createUser(cur);
            expect(await SocialDAO.canAddBlack(cur.id, subadmin.id)).ok(); // 처음엔 당연히 블랙 가능.
            expect(await SocialDAO.canAddBlack(cur.id, admin.id)).ok();
            await SocialDAO.newBlack(cur.id, subadmin.id); // 블랙
            expect(await SocialDAO.canAddBlack(cur.id, subadmin.id)).not.ok(); // 블랙 불가
            expect(await SocialDAO.canAddBlack(cur.id, admin.id)).ok();
            await SocialDAO.unBlack(cur.id, subadmin.id); // 언블랙
            expect(await SocialDAO.canAddBlack(cur.id, subadmin.id)).ok(); // 블랙 가능
            expect(await SocialDAO.canAddBlack(cur.id, admin.id)).ok();
        } catch(err){
            throw err;
        } finally{
            await deleteUser(cur.id); // 꼭 삭제
        }
    });

    it('isFriend, allowRequest, deleteFriend', async () =>{
        const [a, b] = tempuser;
        try{
            await createUser(a); await createUser(b);
            expect(await SocialDAO.isFriend(a.id, b.id)).not.ok();
            await SocialDAO.newRequest(a.id, b.id); await SocialDAO.allowRequest(a.id, b.id);
            expect(await SocialDAO.isFriend(a.id, b.id)).ok();
            await SocialDAO.deleteFriend(a.id, b.id);
            expect(await SocialDAO.isFriend(a.id, b.id)).not.ok();
        } catch(err){
            console.log(err);
            throw err;
        } finally{
            await deleteUser(a.id); await deleteUser(b.id); // 삭제
        }
    });

    it('getSocialsById', async () =>{
        const [a, b, c] = tempuser;
        try{
            await createUser(a); await createUser(b); await createUser(c);
            var {reqreceived, reqsent, friendlist, blacklist} = await SocialDAO.getSocialsById(a.id);
            expect(reqreceived).eql(reqsent).eql(friendlist).eql(blacklist).eql([]); // 초기엔 모두 빈 상태

            await SocialDAO.newRequest(a.id, b.id); await SocialDAO.newRequest(c.id, a.id);
            var {reqreceived, reqsent, friendlist, blacklist} = await SocialDAO.getSocialsById(a.id);
            expect(reqreceived[0].sender_id).equal(c.id); expect(reqsent[0].receiver_id).equal(b.id); // 요청 받기/하기 반영

            await SocialDAO.allowRequest(a.id, b.id); await SocialDAO.allowRequest(c.id, a.id); // 친구 수락했으니
            var {reqreceived, reqsent, friendlist, blacklist} = await SocialDAO.getSocialsById(a.id); 
            expect(reqreceived).eql(reqsent).eql([]); // 요청 목록은 다 비었고
            expect(friendlist[0].id).not.to.be(friendlist[1].id); // 서로 다른 애들이랑 친구에다가
            expect(friendlist.length).to.be(2); // 총 친구는 두 명

            await SocialDAO.newBlack(b.id, a.id); await SocialDAO.deleteFriend(a.id, c.id); // 블랙 당하고, 친구 삭제
            var {reqreceived, reqsent, friendlist, blacklist} = await SocialDAO.getSocialsById(a.id); 
            expect(reqreceived).eql(reqsent).eql(friendlist).eql(blacklist).eql([]); // 당한 거에 삭제니까 다 비어있기

            var {reqreceived, reqsent, friendlist, blacklist} = await SocialDAO.getSocialsById(b.id);
            expect(blacklist[0].id).to.be(a.id); expect(blacklist.length).to.be(1);// b가 블랙했었으니, b는 블랙리스트에 a만 있음
            expect(reqreceived).eql(reqsent).eql(friendlist).eql([]); // 그 외는 비어 있음.
        } catch(err){
            console.log(err);
            throw err;
        }finally{
            await deleteUser(a.id); await deleteUser(b.id); await deleteUser(c.id);
        }
    });
})