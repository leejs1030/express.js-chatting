const { convertDate } = require('../lib/convertDate');
const {runQuery, beginTransaction, commitTransaction, rollBackTransaction} = require('../lib/database');
const UserDAO = require('./user.js');
const {errorAt} = require('../lib/usefulJS');



const getReceivedById = async (id)=>{
    try{
        const sql = 'SELECT users.nick as sender_nick, users.id as sender_id, reqlist.req_time ' + 
        'FROM reqlist INNER JOIN users ON users.id = reqlist.sender ' + 
        'WHERE reqlist.receiver = $1 AND ' + 
        'users.id not in (SELECT added FROM blist WHERE adder = $1)';
        //받은 요청 확인. 단, 내가 차단한 상대로부터 들어온 요청은 보이지 않음.
        //조건: JOIN, nested subquery
        const result = await runQuery(sql, [id]);
        result.forEach((value, index, array)=>{
            array[index].req_time = convertDate(value.req_time); //시간 변환
        });
        return result;
    } catch(err){
        return errorAt('getReceivedById', err);
    }
};
const getSentById = async (id)=>{
    try{
        const sql = 'SELECT users.nick as receiver_nick, users.id as receiver_id, req_time FROM reqlist join users '+
        'on users.id = receiver WHERE sender = $1'
        //보낸 요청 확인.
        const result = await runQuery(sql, [id]);
        result.forEach((value, index, array)=>{
            array[index].req_time = convertDate(value.req_time);
        });
        return result;
    } catch(err) {
        return errorAt('getSentById', err);
    }
};
const getFriendsById = async (id)=>{
    try{
        const sql = 'SELECT id1 as id, nick, friend_date FROM flist join users on users.id = flist.id1 WHERE id2 = $1 UNION '+
        'SELECT id2 as id, nick, friend_date FROM flist join users on users.id = flist.id2 WHERE id1 = $1';
        //친구 확인.
        const result = await runQuery(sql, [id]);
        result.forEach((value, index, array)=>{
            array[index].friend_date = convertDate(value.friend_date);
        });
        return result;
    } catch(err) {
        return errorAt('getFriendsById', err);
    }
};
const getBlacksById = async (id)=>{
    try{
        const sql = 'SELECT blist.added as id, nick, black_date FROM blist, users WHERE users.id = blist.added and blist.adder = $1';
        //블랙 확인
        //조건: cartesian product
        const result = await runQuery(sql, [id]);
        result.forEach((value, index, array)=>{
            array[index].black_date = convertDate(value.black_date);
        });
        return result;
    } catch(err){
        return errorAt('getBlackById', err);
    }
};
const allowRequest = async (id1, id2) =>{
    try{
        await beginTransaction();
        const sql1 = 'DELETE FROM reqlist WHERE sender = $1 and receiver = $2';
        //친구 요청 수락하기 위해, 요청리스트 테이블에서 요청을 지우고
        //조건: delete
        await runQuery(sql1, [id1, id2]);
        const sql2 = 'INSERT INTO flist values($1, $2, now())';
        //그 요청을 받아들여 친구리스트 테이블에 추가
        await runQuery(sql2, [id1, id2]);
        await commitTransaction();
    } catch(err){
        await rollBackTransaction();
        return errorAt('allowRequest', err);
    }
}

const canSendRequest = async (sender, receiver) =>{
    const sqlfriend = 'SELECT * FROM flist WHERE (id1 = $1 and id2 = $2) or (id1 = $2 and id2 = $1)';
    const sqlblack = 'SELECT * FROM blist WHERE (adder = $1 and added = $2)';
    const sqlreq = 'SELECT * FROM reqlist WHERE (sender = $1 and receiver = $2) or (sender = $2 and receiver = $1)';
    const sqlcan = sqlfriend + ' UNION ' + sqlblack + ' UNION ' + sqlreq;
    const result =  await runQuery(sqlcan, [sender, receiver]);
    return !(result[0]);
}

const newRequest = async (sender, receiver)=>{
    try{
        //새로 요청하기 위해
        await beginTransaction();
        if(!(await UserDAO.getById(receiver))){ //상대방이 존재하는지 확인
            await commitTransaction();
            return 2; //안 한다면 2리턴. 컨트롤러에서 전송 불가함을 알림.
        }
        // const canRequest = await canSendRequest(sender, receiver); //이미 요청 중/친구/블랙인지 확인
        if(await canSendRequest(sender, receiver)){ //만약 요청중/친구/블랙이 아니라면
            const sql = 'INSERT INTO reqlist values($1, $2, now())'; //친구 요청 전송
            //친구 요청 전송 = 요청 리스트에 추가.
            await runQuery(sql, [sender, receiver]);
            await commitTransaction();
            return 0; //0리턴. 컨트롤러에서 정상 처리.
        }
        else{
            await commitTransaction();
            return 1; //1리턴. 컨트롤러에서 이미 요청 중/친구/블랙으로 인해 전송 불가함을 알림.
        }
    } catch(err){
        await rollBackTransaction();
        return errorAt('newRequest', err);
    }
}

const canAddBlack = async (adder, added) =>{
    const sql = 'SELECT * FROM blist WHERE adder = $1 and added = $2';
    const result = await runQuery(sql, [adder, added]);
    return !(result[0]);
}

const newBlack = async (adder, added)=>{
    try{
        await beginTransaction();
        //새로 요청하기 위해
        if(!(await UserDAO.getById(added))){ //상대방이 존재하는지 확인
            await commitTransaction();
            return 2; //안 한다면 2리턴. 컨트롤러에서 전송 불가함을 알림.
        }
        else if(await canAddBlack(adder, added)){ //만약 요청중/친구/블랙이 아니라면

            const delFlist = 'DELETE FROM flist WHERE (id1 = $1 and id2 = $2) or (id2 = $1 and id1 = $2)';
            await runQuery(delFlist, [adder, added]); //해당 유저를 친구 목록에서 삭제
            const delReqlist = 'DELETE FROM reqlist where (sender = $1 and receiver = $2)';
            await runQuery(delReqlist, [adder, added]); //해당 유저에게 보낸 요청 취소
            const sql = 'INSERT INTO blist values($1, $2, now())'; 
            await runQuery(sql, [adder, added]); //블랙 리스트 테이블에 추가.

            await commitTransaction();
            return 0;
        }
        else{
            await commitTransaction();
            return 3; //3리턴. 컨트롤러에서 이미 요청 중/친구/블랙으로 인해 전송 불가함을 알림.
        }
    } catch(err){
        await rollBackTransaction();
        return errorAt('newBlack', err);
    }
}

const isFriend = async (id1, id2) =>{
    try{
        const sql = 'SELECT * FROM flist WHERE (id1 = $1 and id2 = $2) or (id1 = $2 and id2 = $1)'; //친구인지 확인
        //(id1, id2) 형태로 저장되었으므로, (a,b)와 (b,a)를 모두 고려해야함. 두 가지 경우 모두 a와 b가 친구.
        const result = await runQuery(sql, [id1, id2]);
        return (result[0] === undefined ? false : true);
    } catch(err){
        return errorAt('isFriend', err);
    }
}

const cancelRequest = async (sender, receiver) =>{
    try{
        const sql = 'DELETE FROM reqlist WHERE sender = $1 and receiver = $2'; //친구 요청 취소
        await runQuery(sql, [sender, receiver]);
    } catch(err) {
        return errorAt('cancelRequest', err);
    }
}

const deleteFriend = async(id1, id2) =>{
    try{
        const sql = 'DELETE FROM flist WHERE (id1 = $1 and id2 = $2) or (id1 = $2 and id2 = $1)'; //친구로부터 삭제
        //DELETE
        await runQuery(sql, [id1, id2]);
        return 0;
    } catch(err){
        return errorAt('deleteFriend', err);
    }
}

const unBlack = async(adder, added) =>{
    try{
        const sql = 'DELETE FROM blist WHERE (adder = $1 and added = $2)'; //블랙리스트로부터 삭제
        await runQuery(sql, [adder, added]);
        return 0;
    } catch(err){
        return errorAt('unBlack', err);
    }
}

const getFriendsByIdNotInChannel = async(uid, cid) =>{
    try{
        const sql = 'SELECT id1 as id, nick, friend_date FROM flist join users on users.id = flist.id1 WHERE id2 = $1 and ' +
        'users.id not in (SELECT user_id FROM channel_users WHERE channel_id = $2)'
        +' UNION '+
        'SELECT id2 as id, nick, friend_date FROM flist join users on users.id = flist.id2 WHERE id1 = $1 and ' +
        'users.id not in (SELECT user_id FROM channel_users WHERE channel_id = $2)';
        //채널에 있지 않은 친구들의 목록을 불러 옴.
        //친구는 (id1, id2)의 형태로 저장. 초대를 보내고자하는 유저는 uid.
        //(uid, id2)와 (id1, uid) 형태가 모두 친구이므로, 각각의 경우에 채널에 속하지 않은 친구를 구함.
        //이후 둘을 UNION하면 채널에 속하지 않은 모든 친구를 구할 수 있음.
        const result = await runQuery(sql, [uid, cid]);
        result.forEach((value, index, array)=>{
            // console.log(value.friend_date);
            array[index].friend_date = convertDate(value.friend_date); //시간 변환
            // console.log(convertDate(value.friend_date));
        });
        return result;
    } catch(err){
        return errorAt('getFriendsByIdNotInChannel', err);
    }
}

const includeToChannel = async(cid, uid) =>{
    try{
        await beginTransaction();
        let num = (await runQuery('SELECT count(*) as num FROM msg GROUP BY channel_id HAVING channel_id = $1',[cid]))[0];
        // 초대하고자하는 채널의 메시지 개수를 불러옴.
        if(!num) num = 1; //만약 메시지가 0개라면, num이 undefined가 나옴. 이 때는 읽지않은 메시지를 1로 설정.
        //새로운 채널임을 확인하게 만들고자 0이 아니라 1로 설정함.
        else num = num.num; //0개가 아니라면, num은 object로 나옴. 오브젝트에 포함된 메시지의 개수를 그대로 num으로 사용.
        const sql = 'INSERT INTO channel_users values($1, $2, $3)';
        await runQuery(sql, [cid, uid, num]);//해당 채널에 해당 유저를 추가하며, 읽지 않은 메시지 수를 num으로 설정.
        await commitTransaction();
    } catch(err){
        await rollBackTransaction();
        return errorAt('includeToChannel', err);
    }
}

const getSocialsById = async (id) =>{
    try{
        await beginTransaction();
        const reqreceived = await getReceivedById(id);
        const reqsent = await getSentById(id);
        const friendlist = await getFriendsById(id);
        const blacklist = await getBlacksById(id);
        await commitTransaction();
        const result = {
            reqreceived: reqreceived,
            reqsent: reqsent,
            friendlist: friendlist,
            blacklist: blacklist,
            counts: {
                received: reqreceived.length,
                sent: reqsent.length,
                friends: friendlist.length,
                blacks: blacklist.length,
            },
        };
        return result;
    } catch(err){
        await rollBackTransaction();
        return errorAt('getSocialsById', err);
    }
}

module.exports = {
    getReceivedById,
    getSentById,
    getFriendsById,
    getBlacksById,
    getSocialsById,
    allowRequest,
    canSendRequest,
    newRequest,
    canAddBlack,
    newBlack,
    isFriend,
    cancelRequest,
    deleteFriend,
    unBlack,
    getFriendsByIdNotInChannel,
    includeToChannel,
};