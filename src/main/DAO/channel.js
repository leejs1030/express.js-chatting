const { convertDate } = require('../lib/convertDate');
const {runQuery, beginTransaction, commitTransaction, rollBackTransaction} = require('../lib/database');
const {errorAt} = require('../lib/usefulJS');
const { canAddBlack, canSendRequest } = require('./social');

const getChannelsByUserId = async (id) =>{
    try{
        const sql = 'SELECT id, name, unread, updatetime, creater FROM channel_users join channels ON id = channel_id WHERE user_id = $1 '
        +'ORDER BY updatetime desc';
        //사용자가 참여 중인 채널들을 모두 불러온다. 업데이트 시간 내림차순. 최근 게 제일 처음에 오도록.
        const result = await runQuery(sql, [id]);
        result.forEach((value, index, array)=>{
            array[index].updatetime = convertDate(value.updatetime); // 날짜를 string으로 변경
        });
        return result;
    } catch(err){
        throw errorAt('getChannelsByUserId', err);
    }
};

const getChannelUnreadById = async (cid, uid) =>{
    try{
        const sql = 'SELECT unread FROM channel_users WHERE channel_id = $1 and user_id = $2';
        // 유저(uid가) 특정 채널(cid)에서 읽지 않은 메시지의 개수를 리턴.
        return (await runQuery(sql, [cid, uid]))[0].unread; // 스칼라
    } catch(err){
        throw errorAt('getChannelUnreadById', err);
    }
};

const getChannelInfoById = async (cid, uid) =>{ //채널 정보 불러오기
    try{
        await beginTransaction(); // 트랜잭션 시작 (2개 이상의 쿼리. 다만 정보 변경은 없음.)
        const sql1 = 'SELECT * FROM channels WHERE id = $1';
        const result = (await runQuery(sql1, [cid]))[0]; //채널(cid) 먼저 찾고
        if(uid !== undefined) result.unread = (await getChannelUnreadById(cid, uid));
        // uid도 인자로 들어왔다면 해당 유저가 읽지 않은 수까지 찾기
        await commitTransaction(); // 트랜잭션 성공적으로 종료
        result.updatetime = convertDate(result.updatetime); // 시간 string으로
        return result;
    } catch(err){
        await rollBackTransaction(); //오류 났으면 롤백. 
        return errorAt('getChannelNameById', err);
    }
};


const countChannelsByUserId = async (id) =>{
    try{
        const sql = 'SELECT count(*)::int as num FROM channel_users WHERE user_id = $1 GROUP BY user_id'; //사용자가 참여 중인 채널의 수를 센다.
        const result = await runQuery(sql, [id]);
        if(result[0] === undefined) return 0; //참여 중인 게 없으면 0
        return result[0].num; // 있으면 리턴
    } catch(err){
        throw errorAt('countChannelsByUserId', err);
    }
}

const createChannel = async (channelName, creater) =>{
    try{
        await beginTransaction(); //트랜잭션 시작. 연속 쿼리가 있으며, 데이터 변경이 있음. 꼭 필요.
        const sqlchannel = 'INSERT INTO channels values(DEFAULT, $1, $2, now()) RETURNING id;'
        //채널을 생성하고, 채널 만든 사람으로 등록하고, 해당 채널의 id를 반환.
        const {id} = (await runQuery(sqlchannel, [channelName, creater]))[0];
        const sqlchanuser = 'INSERT INTO channel_users values($1, $2, 0)';
        //해당 채널의 id를 이용해서, 생성한 사람을 멤버로 추가.
        await runQuery(sqlchanuser, [id, creater]);
        await commitTransaction(); // 정상 수행
        return id;
    } catch(err){
        await rollBackTransaction(); // 에러 나면 롤백
        throw errorAt('createChannel', err);
    }
}

const isChannelMember = async(cid, uid) =>{
    try{
        const sql = "SELECT * FROM channel_users WHERE channel_id = $1 and user_id = $2";
        //채널 멤버인지 확인.
        const result = await runQuery(sql, [cid, uid]);
        return !(result[0] === undefined);
    } catch(err){
        throw errorAt('isChannelMember', err);
    }
};

const isChannelCreater = async(cid, uid) =>{
    try{
        const sql = "SELECT * FROM channels WHERE id = $1 and creater = $2";
        //채널 생성자인지 확인.
        const result = await runQuery(sql, [cid, uid]);
        return !(result[0] === undefined);
    } catch(err){
        throw errorAt('isChannelCreater', err);
    }
};

const getMsgFromChannel = async (cid, uid) =>{
    try{
        await beginTransaction(); // 트랜잭션 시작. 여러 개의 쿼리. 데이터 변경 있음(읽은 것으로 설정.) 필요.

        const sql = "SELECT id, nick, content as msg, msg_date FROM msg JOIN users on id = sender WHERE channel_id = $1 "
        + "ORDER BY msg_date asc";
        //해당 채널에 있는 모든 메시지를 시간 오름차순으로 정렬한 것을 가져옴.
        const result = await runQuery(sql, [cid]);
        result.forEach((value, index, array)=>{
            array[index].msg_date = convertDate(value.msg_date); // 시간 string화
        });
        const unread = await getChannelUnreadById(cid, uid); // 읽지 않은 수 가져오기
        await readMsgFromChannel(uid, cid); // 읽음으로 설정

        await commitTransaction(); // 정상 수행
        return {msglist: result, unread: unread};
    } catch(err){
        await rollBackTransaction(); // 롤백
        throw errorAt('getMsgFromChannel', err);
    }
};

const readMsgFromChannel = async(uid, cid) =>{
    try{
        const sql2 = "UPDATE channel_users SET unread = 0 WHERE channel_id = $1 and user_id = $2"
        //UPDATE문을 사용해 사용자가 해당 채널에 읽지 않은 메시지 수를 0으로 설정.
        await runQuery(sql2, [cid, uid]);
        return 0;
    } catch(err){
        throw errorAt('readMsgFromChannel', err);
    }
}

const sendMsg = async (uid, cid, content) =>{
    try{
        await beginTransaction(); // 여러 개의 쿼리. 데이터 변경. 필요.
        const msgSql = "INSERT INTO msg values($1, $2, now(), $3) RETURNING msg_date";
        //현재 체널에 메시지를 보내고, 보낸 시간을 기록.
        const result = await runQuery(msgSql, [uid, cid, content]);
        const chanSql = "UPDATE channels SET updatetime = now() WHERE id = $1 returning updatetime";
        //채널에 메시지를 보냈으니 채널의 업데이트 시간(최근 사용 시간)도 update(쿼리)함.
        const result2 = await runQuery(chanSql, [cid]);
        // console.log(convertDate(result2[0]));
        const unReadSql = "UPDATE channel_users SET unread = unread + 1 WHERE user_id <> $1 and channel_id = $2";
        //UPDATE문으로 메시지를 보낸 채널의 다른 유저들의 읽지 않은 메시지 수를 1씩 증가시킴.
        await runQuery(unReadSql, [uid, cid]);
        await commitTransaction(); // 정상
        return convertDate(result[0].msg_date);
    } catch(err){
        await rollBackTransaction(); // 롤백
        throw errorAt('sendMsg', err);
    }
}

const quitChannel = async(cid, uid) =>{
    try{
        const sql = "DELETE FROM channel_users WHERE channel_id = $1 and user_id = $2";
        //채널을 나가기.
        await runQuery(sql, [cid, uid]);
        return 0;
    }catch(err){
        throw errorAt('quitChannel', err);
    }
}

const deleteChannel = async(cid) =>{
    try{
        const sql = "DELETE FROM channels WHERE id = $1";
        //채널을 삭제.
        await runQuery(sql, [cid]);
        return 0;
    }catch(err){
        throw errorAt('deleteChannel', err);
    }
}

const getMemberFromChannel = async(cid, uid) =>{
    try{
        await beginTransaction();
        const sql = 'SELECT user_id as id, nick FROM channel_users join users on id = user_id ' +
        'WHERE channel_id = $1';
        const result = await runQuery(sql, [cid]); // 채널에 속한 유저들을 모두 가져 옴.
        for(const member of result){
            if(uid == member.id){
                member.canRequest = member.canBlack = false; // 자기 자신이면 request도 불가. black도 불가.
            } else {
                member.canBlack = await canAddBlack(uid, member.id); // 블랙 가능한지
                member.canRequest = await canSendRequest(uid, member.id); // 친구 요청 가능한지
            }
        }
        await commitTransaction(); // 정상
        return result;
    } catch(err){
        await rollBackTransaction(); // 롤백
        throw errorAt('getMemberFromChannel', err);
    }
}

const includeToChannel = async(cid, uid) =>{ //친구(uid)를 채널(cid)에 초대(포함시킴)
    try{
        await beginTransaction(); // 연속적인 쿼리
        let num = (await runQuery('SELECT count(*) as num FROM msg GROUP BY channel_id HAVING channel_id = $1',[cid]))[0];
        // 초대하고자하는 채널의 메시지 개수를 불러옴.
        if(!num) num = 1; //만약 메시지가 0개라면, num이 undefined가 나옴. 이 때는 읽지않은 메시지를 1로 설정.
        // 실제 읽지 않은 메시지 수는 0개이나, 새로운 채널임을 확인하게 만들고자 0이 아니라 1로 설정함.
        else num = num.num; //0개가 아니라면, num은 object로 나옴. 오브젝트에 포함된 메시지의 개수를 그대로 num으로 사용.
        const sql = 'INSERT INTO channel_users values($1, $2, $3)';
        await runQuery(sql, [cid, uid, num]);//해당 채널에 해당 유저를 추가하며, 읽지 않은 메시지 수를 num으로 설정.
        await commitTransaction();
        return 0;
    } catch(err){
        await rollBackTransaction();
        throw errorAt('includeToChannel', err);
    }
}

const getFriendsByIdNotInChannel = async(uid, cid) =>{ // 유저(uid)의 친구 중 채널(cid)에 속하지 않은 친구의 리스트를 구함.
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
            array[index].friend_date = convertDate(value.friend_date); //시간 변환
        });
        return result;
    } catch(err){
        throw errorAt('getFriendsByIdNotInChannel', err);
    }
}

module.exports = {
    getChannelsByUserId,
    getChannelInfoById,
    getChannelUnreadById,
    countChannelsByUserId,
    createChannel,
    isChannelMember,
    getMsgFromChannel,
    sendMsg,
    isChannelCreater,
    quitChannel,
    deleteChannel,
    getMemberFromChannel,
    readMsgFromChannel,
    includeToChannel,
    getFriendsByIdNotInChannel,
};