const { convertDate } = require('../lib/convertDate');
const {runQuery} = require('../lib/database');

const getChannelsByUserId = async (id) =>{
    const sql = 'SELECT id, name, unread, updatetime, creater FROM channel_users join channels ON id = channel_id WHERE user_id = $1 '
    +'ORDER BY updatetime desc';
    //사용자가 참여 중인 채널들을 모두 불러온다.
    const result = await runQuery(sql, [id]);
    result.forEach((value, index, array)=>{
        array[index].updatetime = convertDate(value.updatetime);
    });
    return result;
}

const countChannelsByUserId = async (id) =>{
    const sql = 'SELECT count(*) as num FROM channel_users WHERE user_id = $1 GROUP BY user_id'; //사용자가 참여 중인 채널의 수를 센다.
    //aggregate
    const result = await runQuery(sql, [id]);
    if(!result[0]) return {num: 0};
    return result[0];
}

const createChannel = async (channelName, creater) =>{
    const sqlchannel = 'INSERT INTO channels values(DEFAULT, $1, $2, now()) RETURNING id;'
    //채널을 생성하고, 해당 채널의 id를 반환.
    const {id} = (await runQuery(sqlchannel, [channelName, creater]))[0];
    const sqlchanuser = 'INSERT INTO channel_users values($1, $2, 0)';
    //해당 채널의 id를 이용해서, 생성한 사람을 멤버로 추가.
    await runQuery(sqlchanuser, [id, creater]);
    return id;
}

const isChannelMember = async(cid, uid) =>{
    const sql = "SELECT * FROM channel_users WHERE channel_id = $1 and user_id = $2";
    //채널 멤버인지 확인.
    const result = await runQuery(sql, [cid, uid]);
    return result[0];
};

const isChannelCreater = async(cid, uid) =>{
    const sql = "SELECT * FROM channels WHERE id = $1 and creater = $2";
    //채널 생성자인지 확인.
    const result = await runQuery(sql, [cid, uid]);
    return result[0];
};

const getMsgFromChannel = async (cid, uid) =>{
    const sql = "SELECT id, nick, content as msg, msg_date FROM msg JOIN users on id = sender WHERE channel_id = $1 "
    + "ORDER BY msg_date asc";
    //해당 채널에 있는 모든 메시지를 시간 오름차순으로 정렬한 것을 가져옴.
    const result = await runQuery(sql, [cid]);
    result.forEach((value, index, array)=>{
        array[index].msg_date = convertDate(value.msg_date);
    });
    
    const sql2 = "UPDATE channel_users SET unread = 0 WHERE channel_id = $1 and user_id = $2"
    //UPDATE문을 사용해 사용자가 해당 채널에 읽지 않은 메시지 수를 0으로 설정.
    await runQuery(sql2, [cid, uid]);
    return result;
};

const sendMsg = async (uid, cid, content) =>{
    const msgSql = "INSERT INTO msg values($1, $2, now(), $3)";
    //현재 체널에 메시지를 보내고, 보낸 시간을 기록.
    await runQuery(msgSql, [uid, cid, content]);
    const chanSql = "UPDATE channels SET updatetime = now() WHERE id = $1";
    //채널에 메시지를 보냈으니 채널의 업데이트 시간(최근 사용 시간)도 update(쿼리)함.
    await runQuery(chanSql, [cid]);
    const unReadSql = "UPDATE channel_users SET unread = unread + 1 WHERE user_id <> $1 and channel_id = $2";
    //UPDATE문으로 메시지를 보낸 채널의 다른 유저들의 읽지 않은 메시지 수를 1씩 증가시킴.
    await runQuery(unReadSql, [uid, cid]);
    return 0;
}

const quitChannel = async(cid, uid) =>{
    try{
        const sql = "DELETE FROM channel_users WHERE channel_id = $1 and user_id = $2";
        //채널을 나가기.
        await runQuery(sql, [cid, uid]);
    }catch(err){
        return console.log(err);
    }
}

const deleteChannel = async(cid, uid) =>{
    try{
        const sql = "DELETE FROM channels WHERE id = $1";
        //채널을 삭제.
        await runQuery(sql, [cid]);
    }catch(err){
        return console.log(err);
    }
}

const getMemberFromChannel = async(cid) =>{
    try{
        const sql = 'SELECT user_id as id, nick FROM channel_users join users on id = user_id ' +
        'WHERE channel_id = $1';
        const result = await runQuery(sql, [cid]);
        return result;
    } catch(err){
        return console.log(err);
    }
}

module.exports = {
    getChannelsByUserId,
    countChannelsByUserId,
    createChannel,
    isChannelMember,
    getMsgFromChannel,
    sendMsg,
    isChannelCreater,
    quitChannel,
    deleteChannel,
    getMemberFromChannel
};