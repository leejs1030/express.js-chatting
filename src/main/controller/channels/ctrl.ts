import { ChannelDAO, SocialDAO, UserDAO, compressIntoTask } from '../../DAO';
import { getAlertScript } from '../../lib/usefulJS';
import { NextFunction, Request, Response } from 'express';
import { msg } from 'custom-type';

// GET /
async function indexPage(req: Request, res: Response, next: NextFunction): Promise<void> { // 채널 목록을 보여주는 기본 페이지 렌더링
    try {
        const { user } = req.session;
        const channelList = await ChannelDAO.getChannelsByUserId(user.id); // 채널 목록
        const num = channelList.length; // 채널 개수
        return res.status(200).render('channels/index.pug', {
            user, num, channelList: JSON.stringify(channelList),
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        return next(err);
    }
}

// POST /
// 채널을 만듦
async function createChannel(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>> {
    try {
        const { user } = req.session;
        const { channelName } = req.body as { channelName: string; };
        let cname = channelName.trim();
        if (!cname) return res.status(400).send(getAlertScript("채널 이름을 입력해주세요!")); // 채널 이름이 없으면 Bad Request
        await ChannelDAO.createChannel(cname, user.id); // 채널 생성 쿼리
        return res.redirect(303, 'back'); // 성공. 303 See Other
    } catch (err) {
        return next(err);
    }
}

// GET /:channelId
async function showChannel(req: Request, res: Response, next: NextFunction): Promise<void> { // 특정 채널을 보여줌.
    try {
        const { user } = req.session;
        const channelId = parseInt(req.params.channelId);
        let msglist: msg[], unread: number, send_enter: boolean, channelName: string;
        const loadChannelInfo = async (t: any) => {
            let msginfo = await ChannelDAO.getMsgFromChannel(channelId, user.id, t); // 메시지 불러오기
            msglist = msginfo.msglist; unread = msginfo.unread;
            let configinfo = await UserDAO.getSettingById(user.id, t); // 설정값에서 엔터로 전송할지 여부 불러오기
            send_enter = configinfo.send_enter;
            channelName = (await ChannelDAO.getChannelInfoById(channelId, undefined, t)).name; // 채널 이름 불러오기    
        };
        await compressIntoTask(loadChannelInfo);
        unread = (unread > msglist.length) ? msglist.length : unread;
        /*
        * 채널에 처음 초대 받으면, 메시지가 없어도 1로 뜬다.
        * 이 경우에는, 채널을 로드하는 과정에서, 메시지가 없음에도 읽을 메시지가 있다고 인식하여
        * 로드할 수 없는 상황에서도 계속 메시지를 로드 시도한다.
        * 그로 인해 무한 루프에 빠져, 페이지가 로드되지 않는다.
        * 따라서, unread보다 msglist.length가 더 작으면, unread를 갱신한다. 이러면 실제 메시지 개수와 잘 맞게 된다.
        */
        return res.status(200).render("channels/chattings.pug", {
            user, channelId, send_enter, channelName, unread,
            initialMsgs: JSON.stringify(msglist),
            csrfToken: req.csrfToken(),
        });
    } catch (err) {
        return next(err);
    }
}

// PUT /:channelId
async function quitChannel(req: Request, res: Response, next: NextFunction): Promise<void> { // 채널 나가기
    try {
        const { user } = req.session;
        const channelId = parseInt(req.params.channelId);
        await ChannelDAO.quitChannel(channelId, user.id);
        return res.redirect(303, 'back');
    } catch (err) {
        return next(err);
    }
}

// DELETE /:channelId
async function deleteChannel(req: Request, res: Response, next: NextFunction): Promise<void> { // 채널 지우기
    try {
        const channelId = parseInt(req.params.channelId);
        await ChannelDAO.deleteChannel(channelId);
        return res.redirect(303, 'back');
    } catch (err) {
        return next(err);
    }
}

// GET /:channelId/invitelist
async function inviteFriend(req: Request, res: Response, next: NextFunction): Promise<void> { // 친구를 초대하기 위한 페이지를 렌더링.
    // 초대 가능한 친구의 리스트가 보임.
    try {
        const { user } = req.session;
        const { channelId } = req.params;
        const flist = await ChannelDAO.getFriendsByIdNotInChannel(user.id, channelId); // 친구들 중 채널에 속하지 않은 친구의 리스트
        // flist에 속한 이들을 초대 가능.

        return res.status(200).render('channels/invites.pug', {
            user, channelId, flist: JSON.stringify(flist), // 직렬화
            csrfToken: req.csrfToken(),
        });
    } catch (err) {
        return next(err);
    }
}

// GET /:channelId/members
async function memberList(req: Request, res: Response, next: NextFunction): Promise<void> { // 채널에 속한 멤버 목록 불러오기
    try {
        const { user } = req.session;
        const channelId = parseInt(req.params.channelId);
        let memberList = await ChannelDAO.getMemberFromChannel(channelId, user.id);

        return res.status(200).render('channels/member.pug', {
            user, channelId, memberList: JSON.stringify(memberList), // 직렬화
            csrfToken: req.csrfToken(),
        });
    } catch (err) {
        return next(err);
    }
}

/**
 * @deprecated
 * do not use any more. moved to socket part.
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
async function sendMsg(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>> { // 메시지 보내기. 미사용.
    try {
        return; // 현재 사용하지 않음. 소켓 파트로 대체.

        // /scripts/chattingsockets.js에서 new msg 소켓 보내면, /src/index.js에서 받아서 처리.
        const { content } = req.body;
        if (content.length > 10000 || !content) {
            return res.status(409).send(getAlertScript('0 ~ 10000 글자로 작성해주세요!'));
        }
        const { user } = req.session;
        const channelId = parseInt(req.params.channelId);
        const receiveTime = await ChannelDAO.sendMsg(user.id, channelId, content);
        const io = req.app.get('socketio');
        let sendData = {
            id: user.id,
            nick: user.nick,
            channel: channelId,
            msg: content,
            stime: receiveTime,
        };

        io.to(sendData.channel).emit(`update`, sendData);
        return res.redirect(303, 'back');
    } catch (err) {
        return next(err);
    }
}

/**
 * @deprecated
 * do not use any more. moved to socket part.
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
async function includeToChannel(req: Request, res: Response, next: NextFunction): Promise<void> { // 초대하기. 미사용.
    try {
        return; // 현재 사용하지 않음. 소켓 파트로 대체.

        // /scripts/invitesockets.js에서 전송하면 /src/index.js에서 받아서 처리.
        console.log('hello');
        const { user } = req.session;
        const channelId = parseInt(req.params.channelId);
        const { targetId } = req.params;
        await ChannelDAO.includeToChannel(channelId, targetId);
        const channelInfo = (await ChannelDAO.getChannelInfoById(channelId));
        const unread = (await ChannelDAO.getChannelInfoById(channelId, targetId)).unread;
        const io = req.app.get('socketio');
        io.to(targetId).emit(`invite`, {
            cid: channelId,
            cname: channelInfo.name,
            cunread: unread,
            ctime: channelInfo.update_time,
        });
        return res.redirect(303, 'back');
    } catch (err) {
        return next(err);
    }
}



export {
    indexPage,
    createChannel,
    showChannel,
    quitChannel,
    deleteChannel,
    inviteFriend,
    memberList,
    sendMsg,
    includeToChannel,
}