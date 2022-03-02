import { convertDate } from '../lib/convertDate';
import db from '../lib/dbconnection';
import { errorAt } from '../lib/usefulJS';
import { canAddBlack, canSendRequest } from './social';
import { channelInfo, user, msg} from 'custom-type';
import pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';

//사용자가 참여 중인 채널들을 모두 불러온다. 업데이트 시간 내림차순. 최근 게 제일 처음에 오도록.
async function getChannelsByUserId(uid: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<channelInfo[]> {
    const sql = 'SELECT id, name, unread, update_time, creater FROM channel_users join channels ON id = channel_id ' +
        'WHERE user_id = $1 ORDER BY update_time DESC';
    try {
        const result: channelInfo[] = await task.any(sql, [uid]);
        result.forEach(e =>{
            e.update_time = convertDate(e.update_time);
        });
        return result;
    } catch (err) {
        throw errorAt('getChannelsByUserId', err);
    }
}

// 유저(uid가) 특정 채널(cid)에서 읽지 않은 메시지의 개수를 리턴.
async function getChannelUnreadById(cid: number, uid: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<number> {
    const sql = 'SELECT unread FROM channel_users WHERE channel_id = $1 and user_id = $2';
    try {
        return (await task.one(sql, [cid, uid]) as { unread: number; }).unread; // 스칼라
    } catch (err) {
        throw errorAt('getChannelUnreadById', err);
    }
}

//채널 정보 불러오기
async function getChannelInfoById(cid: number, uid?: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<channelInfo> {
    const sql = 'SELECT * FROM channels WHERE id = $1'; // cid로 채널 정보 불러오기
    return task.tx('get-channel-tx', async (t: any): Promise<channelInfo> => {
        const result: channelInfo = (await t.one(sql, [cid]));
        if (uid !== undefined) result.unread = (await getChannelUnreadById(cid, uid, t)); // uid가 들어왔다면, unread도 설정하기
        return result;
    })
        .then((data: channelInfo) => {
            data.update_time = convertDate(data.update_time);
            return data;
        })
        .catch((err: any) => { throw errorAt('getChannelInfoById', err); });
}

//사용자가 참여 중인 채널의 수를 센다.
async function countChannelsByUserId(uid: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<number> {
    const sql = 'SELECT count(*)::int as num FROM channel_users WHERE user_id = $1 GROUP BY user_id';
    try {
        const result: (null | { num: number; }) = (await task.oneOrNone(sql, [uid]));
        const ret = (result === null) ? 0 : result.num;
        return ret;
    } catch (err) {
        throw errorAt('countChannelsByUserId', err);
    }
}

// 채널 만들기
async function createChannel(channelName: string, creater: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<number> {
    const sqlchannel = 'INSERT INTO channels values(DEFAULT, $1, $2, now()) RETURNING id::int;';
    const sqlchanuser = 'INSERT INTO channel_users values($1, $2, 0)';
    return task.tx('create-channel-tx', async (t): Promise<number> => {
        const id = (await t.one(sqlchannel, [channelName, creater]) as { id: number; }).id;
        await t.none(sqlchanuser, [id, creater]);
        return id;
    })
        .catch((err: any) => { throw errorAt('createChannel', err); });
}

//채널 멤버인지 확인.
async function isChannelMember(cid: number, uid: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<boolean> {
    const sql = "SELECT * FROM channel_users WHERE channel_id = $1 and user_id = $2";
    try {
        const result: (null | {}) = await task.oneOrNone(sql, [cid, uid]);
        return (result !== null);
    } catch (err) {
        throw errorAt('isChannelMember', err);
    }
}

//채널 생성자인지 확인.
async function isChannelCreater(cid: number, uid: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<boolean> {
    const sql = "SELECT * FROM channels WHERE id = $1 and creater = $2";
    try {
        const result: (null | {}) = await task.oneOrNone(sql, [cid, uid]);
        return (result !== null);
    } catch (err) {
        throw errorAt('isChannelCreater', err);
    }
}

//해당 채널에 있는 모든 메시지를 시간 오름차순으로 정렬한 것을 가져옴.
async function getMsgFromChannel(cid: number, uid: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<{ msglist: msg[]; unread: number; }> {
    const sql = "SELECT id, nick, content as msg, msg_time, channel_id FROM msg JOIN users on id = sender WHERE channel_id = $1 "
        + "ORDER BY msg_time ASC";
    return task.tx('get-msg-tx', async (t): Promise<{ msglist: msg[]; unread: number; }> => {
        const result: msg[] = await t.any(sql, [cid]);
        result.forEach(e => e.msg_time = convertDate(e.msg_time as string));
        const unread = await getChannelUnreadById(cid, uid, t);
        await readMsgFromChannel(uid, cid, t);
        return { msglist: result, unread: unread };
    })
        .catch((err: any) => { throw errorAt('getMsgFromChannel', err); });
}

//UPDATE문을 사용해 사용자가 해당 채널에 읽지 않은 메시지 수를 0으로 설정.
async function readMsgFromChannel(uid: string, cid: number,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<0> {
    const sql2 = "UPDATE channel_users SET unread = 0 WHERE channel_id = $1 and user_id = $2";
    try {
        await task.none(sql2, [cid, uid]);
        return 0;
    } catch (err) {
        throw errorAt('readMsgFromChannel', err);
    }
}

// 메시지 보내기
async function sendMsg(uid: string, cid: number, content: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<string> {
    const sqlSendMsg = "INSERT INTO msg values($1, $2, now(), $3) RETURNING msg_time";
    //현재 체널에 메시지를 보내고, 보낸 시간을 기록.
    const chanSql = "UPDATE channels SET update_time = $1 WHERE id = $2";
    //채널에 메시지를 보냈으니 채널의 업데이트 시간(최근 사용 시간)도 update(쿼리)함.
    const unReadSql = "UPDATE channel_users SET unread = unread + 1 WHERE user_id <> $1 and channel_id = $2";
    //UPDATE문으로 메시지를 보낸 채널의 다른 유저들의 읽지 않은 메시지 수를 1씩 증가시킴.
    return task.tx('send-msg-tx', async (t): Promise<string> => {
        const date = (await t.one(sqlSendMsg, [uid, cid, content]) as { msg_time: string; }).msg_time;
        await t.none(chanSql, [date, cid]);
        await t.none(unReadSql, [uid, cid]);
        return date;
    })
        .then((data: string) => convertDate(data))
        .catch((err: Error) => { throw errorAt('sendMsg', err); });
}

//채널을 나가기.
async function quitChannel(cid: number, uid: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<0> {
    const sql = "DELETE FROM channel_users WHERE channel_id = $1 and user_id = $2";
    try {
        await task.none(sql, [cid, uid]);
        return 0;
    } catch (err) {
        throw errorAt('quitChannel', err);
    }
}

//채널을 삭제.
async function deleteChannel(cid: number,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<0> {
    const sql = "DELETE FROM channels WHERE id = $1";
    try {
        await task.none(sql, [cid]);
        return 0;
    } catch (err) {
        throw errorAt('deleteChannel', err);
    }
}

// 채널에 속한 유저들을 모두 가져 옴.
async function getMemberFromChannel(cid: number, uid: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<user[]> {
    const sql = 'SELECT user_id as id, nick FROM channel_users join users on id = user_id ' +
        'WHERE channel_id = $1 ORDER BY nick ASC';
    return task.tx('get-member-tx', async (t): Promise<user[]> => {
        const result: user[] = await t.any(sql, [cid]);
        for await (const member of result) {
            member.canRequest = await canSendRequest(uid, member.id, t);
            member.canBlack = await canAddBlack(uid, member.id, t);
        }
        return result;
    })
        .catch((err: Error) => { throw errorAt('getMemberFromChannel', err); });
}

//친구(uid)를 채널(cid)에 초대(포함시킴)
async function includeToChannel(cid: number, uid: string,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<0> {
    const msgCountSql = 'SELECT count(*)::int as num FROM msg GROUP BY channel_id HAVING channel_id = $1';
    // 초대하고자하는 채널의 메시지 개수를 불러옴.
    const includeChannelSql = 'INSERT INTO channel_users values($1, $2, $3)';
    //해당 채널에 해당 유저를 추가하며, 읽지 않은 메시지 수를 num으로 설정.
    return task.tx('include-channel-tx', async (t): Promise<0> => {
        const res: { num: number; } | null = (await t.oneOrNone(msgCountSql, [cid]));
        const ret = (res === null) ? 1 : res.num; // 새 채널에 초대받았을 경우, 새 메시지가 없더라도 1로 설정함.

        // 새로운 채널에 초대받았음을 알 수 있게 해주기 위한 정책.
        await t.none(includeChannelSql, [cid, uid, ret]);
        return 0;
    })
        .catch((err: Error) => { throw errorAt('includeToChannel', err); });
}

// 유저(uid)의 친구 중 채널(cid)에 속하지 않은 친구의 리스트를 구함.
async function getFriendsByIdNotInChannel(uid: string, cid: any,
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<user[]> {
    const sql = '(SELECT id1 as id, nick, friend_time FROM flist join users on users.id = flist.id1 WHERE id2 = $1 and ' +
        'users.id not in (SELECT user_id FROM channel_users WHERE channel_id = $2)'
        + ' UNION ' +
        'SELECT id2 as id, nick, friend_time FROM flist join users on users.id = flist.id2 WHERE id1 = $1 and ' +
        'users.id not in (SELECT user_id FROM channel_users WHERE channel_id = $2))'
        + ' ORDER BY nick ASC';
    //채널에 있지 않은 친구들의 목록을 불러 옴.
    //친구는 (id1, id2)의 형태로 저장. 초대를 보내고자하는 유저는 uid.
    //(uid, id2)와 (id1, uid) 형태가 모두 친구이므로, 각각의 경우에 채널에 속하지 않은 친구를 구함.
    //이후 둘을 UNION하면 채널에 속하지 않은 모든 친구를 구할 수 있음.
    try {
        const result: user[] = await task.any(sql, [uid, cid]);
        result.forEach((e) => e.friend_time = convertDate(e.friend_time as string)); // 시간 변환
        return result;
    } catch (err) {
        throw errorAt('getFriendsByIdNotInChannel', err);
    }
}

export {
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