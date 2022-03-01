import db from '../lib/dbconnection';
import { convertDate } from '../lib/convertDate';
import { getById } from './user';
import { errorAt } from '../lib/usefulJS';
import { user } from 'custom-type';



async function getReceivedById(id: string, task = db): Promise<user[]> {
    try {
        const sql = 'SELECT users.nick as sender_nick, users.id as sender_id, reqlist.req_time ' +
            'FROM reqlist INNER JOIN users ON users.id = reqlist.sender ' +
            'WHERE reqlist.receiver = $1 AND ' +
            'users.id not in (SELECT added FROM blist WHERE adder = $1)';
        //받은 요청 확인. 단, 내가 차단한 상대로부터 들어온 요청은 보이지 않음.
        const result: user[] = await task.any(sql, [id]);
        result.map(e => e.req_time = convertDate(e.req_time));
        return result;
    } catch (err) {
        throw errorAt('getReceivedById', err);
    }
}

async function getSentById(id: string, task = db): Promise<user[]> {
    try {
        const sql = 'SELECT users.nick as receiver_nick, users.id as receiver_id, req_time FROM reqlist join users ' +
            'on users.id = receiver WHERE sender = $1';
        //보낸 요청 확인.
        const result: user[] = await task.any(sql, [id]);
        result.map(e => e.req_time = convertDate(e.req_time));
        return result;
    } catch (err) {
        throw errorAt('getSentById', err);
    }
}

async function getFriendsById(id: string, task = db): Promise<user[]> {
    try {
        const sql = 'SELECT id1 as id, nick, friend_time FROM flist join users on users.id = flist.id1 WHERE id2 = $1 UNION ' +
            'SELECT id2 as id, nick, friend_time FROM flist join users on users.id = flist.id2 WHERE id1 = $1';
        //친구 확인.
        const result: user[] = await task.any(sql, [id]);
        result.map(e => e.friend_time = convertDate(e.friend_time));
        return result;
    } catch (err) {
        throw errorAt('getFriendsById', err);
    }
}

async function getBlacksById(id: string, task = db): Promise<user[]> {
    try {
        const sql = 'SELECT blist.added as id, nick, black_time FROM blist, users WHERE users.id = blist.added and blist.adder = $1';
        //블랙 확인
        const result: user[] = await task.any(sql, [id]);
        result.map(e => e.black_time = convertDate(e.black_time));
        return result;
    } catch (err) {
        throw errorAt('getBlackById', err);
    }
}

async function allowRequest(sender: string, receiver: string, task = db): Promise<0> {
    const sql1 = 'DELETE FROM reqlist WHERE sender = $1 and receiver = $2 RETURNING *';
    //친구 요청 수락하기 위해, 요청리스트 테이블에서 요청을 지우고
    const sql2 = 'INSERT INTO flist values($1, $2, now())';
    //그 요청을 받아들여 친구리스트 테이블에 추가
    return await task.tx('allow-request-tx', async (t: any): Promise<0> => {
        await t.one(sql1, [sender, receiver]); // one: 요청을 지운 것이 하나여야만 한다. 0개 or 여러 개면 에러!
        await t.none(sql2, [sender, receiver]);
        return 0;
    })
        .catch((err: Error) => { throw errorAt('allowRequest', err); });
}

async function canSendRequest(sender: string, receiver: string, task = db): Promise<boolean> {
    if (sender === receiver) return false;
    try {
        const sqlfriend = 'SELECT * FROM flist WHERE (id1 = $1 and id2 = $2) or (id1 = $2 and id2 = $1)'; // 친구이거나
        const sqlblack = 'SELECT * FROM blist WHERE (adder = $1 and added = $2)'; // 블랙 충이거나
        const sqlreq = 'SELECT * FROM reqlist WHERE (sender = $1 and receiver = $2) or (sender = $2 and receiver = $1)'; // 요청 중인지
        const sqlcan = sqlfriend + ' UNION ' + sqlblack + ' UNION ' + sqlreq; //확인한다
        const ret: user[] | null = (await task.any(sqlcan, [sender, receiver])); // 리턴 값은 Array
        return (ret.length === 0); // 길이가 0 = 해당사항 없음 = 요청 가능 => true
    } catch (err) {
        throw errorAt('canSendRequest', err);
    }
}

async function newRequest(sender: string, receiver: string, task = db): Promise<number> {
    const sqlSendReq = 'INSERT INTO reqlist values($1, $2, now())'; //친구 요청 전송하는 쿼리문
    return await task.tx('send-request-tx', async (t: any) => {
        if (!(await getById(receiver, t))) return 2; //상대방이 존재하는지 확인
        if (await canSendRequest(sender, receiver, t)) {
            await t.none(sqlSendReq, [sender, receiver]);
            return 0;
        }
        return 1;
    })
        .catch((err: Error) => { throw errorAt('newRequest', err); });
}

async function canAddBlack(adder: string, added: string, task = db): Promise<boolean> {
    if (adder === added) return false;
    try {
        const sql = 'SELECT * FROM blist WHERE adder = $1 and added = $2'; //이미 블랙했는지 확인
        const result: (user[] | null) = await task.oneOrNone(sql, [adder, added]);
        return (result === null); // null이면, 블랙한 적 없는 것이므로, 추가 가능.
    } catch (err) {
        throw errorAt('canAddBlack', err);
    }
}

async function newBlack(adder: string, added: string, task = db): Promise<number> {
    const sqlDelFlist = 'DELETE FROM flist WHERE (id1 = $1 and id2 = $2) or (id2 = $1 and id1 = $2)';
    const sqlDelReqlist = 'DELETE FROM reqlist where (sender = $1 and receiver = $2)';
    const sqlAddBlack = 'INSERT INTO blist values($1, $2, now())';
    return await task.tx('new-black-tx', async (t: any) => {
        if (!(await getById(added, t))) return 2;
        if (await canAddBlack(adder, added, t)) {
            await t.none(sqlDelFlist, [adder, added]);
            await t.none(sqlDelReqlist, [adder, added]);
            await t.none(sqlAddBlack, [adder, added]);
            return 0;
        }
        return 3;
    })
        .catch((err: Error) => { throw errorAt('newBlack', err); });
}

async function isFriend(id1: string, id2: string, task = db): Promise<boolean> {
    const sql = 'SELECT * FROM flist WHERE (id1 = $1 and id2 = $2) or (id1 = $2 and id2 = $1)'; //친구인지 확인
    //(id1, id2) 형태로 저장되었으므로, (a,b)와 (b,a)를 모두 고려해야함. 두 가지 경우 모두 a와 b가 친구.
    try {
        const result: (user | null) = await task.oneOrNone(sql, [id1, id2]);
        return (result !== null); //친구라면 존재하므로 정상적인 값이 나올 것. 아니라면 undefined가 나올 것.
    } catch (err) {
        throw errorAt('isFriend', err);
    }
}

async function cancelRequest(sender: string, receiver: string, task = db): Promise<0> {
    const sql = 'DELETE FROM reqlist WHERE sender = $1 and receiver = $2'; //친구 요청 취소
    try {
        await task.none(sql, [sender, receiver]);
        return 0;
    } catch (err) {
        throw errorAt('cancelRequest', err);
    }
}

async function deleteFriend(id1: string, id2: string, task = db): Promise<0> {
    const sql = 'DELETE FROM flist WHERE (id1 = $1 and id2 = $2) or (id1 = $2 and id2 = $1)'; //친구로부터 삭제
    try {
        await task.none(sql, [id1, id2]);
        return 0;
    } catch (err) {
        throw errorAt('deleteFriend', err);
    }
}

async function unBlack(adder: string, added: string, task = db): Promise<0> {
    const sql = 'DELETE FROM blist WHERE (adder = $1 and added = $2)'; //블랙리스트로부터 삭제
    try {
        await task.none(sql, [adder, added]);
        return 0;
    } catch (err) {
        throw errorAt('unBlack', err);
    }
}

declare interface socials{
    reqreceived: user[],
    reqsent: user[],
    friendlist: user[],
    blacklist: user[],
    counts: {
        received: number,
        sent: number,
        friends: number,
        blacks: number,
    }
}

// social탭에서 사용할 다양한 것들에 대한 정보를 불러옴.
async function getSocialsById(id: string, task = db): Promise<socials> {
    return await task.tx('get-socials-tx', async (t: any) => {
        const reqreceived = await getReceivedById(id, t);
        const reqsent = await getSentById(id, t);
        const friendlist = await getFriendsById(id, t);
        const blacklist = await getBlacksById(id, t);
        return {
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
    })
        .catch((err: Error) => { throw errorAt('getSocialsById', err); });
}

export {
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
};