const {ChannelDAO, SocialDAO, UserDAO} = require('../../DAO');
const {getAlertScript} = require('../../lib/usefulJS');

// GET /
const indexPage = async (req, res, next) =>{ // 채널 목록을 보여주는 기본 페이지 렌더링
    try{
        const {user} = req.session;
        const channelList = await ChannelDAO.getChannelsByUserId(user.id); // 채널 목록
        const num = channelList.length; // 채널 개수
        return res.status(200).render('channels/index.pug', {user, num, channelList: JSON.stringify(channelList), 
            csrfToken: req.csrfToken()});
    } catch(err){
        return next(err);
    }
};

// POST /
const createChannel = async (req, res, next) =>{ // 채널을 만듦
    try{
        const {user} = req.session;
        const {channelName} = req.body;
        let cname = channelName.trim();
        if(!cname) return res.status(400).send(getAlertScript("채널 이름을 입력해주세요!")); // 채널 이름이 없으면 Bad Request
        await ChannelDAO.createChannel(cname, user.id); // 채널 생성 쿼리
        return res.redirect(303, 'back'); // 성공. 303 See Other
    } catch(err){
        return next(err);
    }
}

// GET /:channelId
const showChannel = async(req, res, next) =>{ // 특정 채널을 보여줌.
    // more than one DAO
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        let {msglist, unread} = await ChannelDAO.getMsgFromChannel(channelId, user.id); // 메시지 불러오기
        const {send_enter} = await UserDAO.getSettingById(user.id); // 설정값에서 엔터로 전송할지 여부 불러오기
        const channelName = (await ChannelDAO.getChannelInfoById(channelId)).name; // 채널 이름 불러오기
        unread = (unread < msglist.length) ? unread : msglist.length; // 채널에 처음 초대 받으면, 메시지가 없어도 1로 뜬다.
        // 채널을 로드하는 과정에서, 메시지를 1개로 인식하고, 로드할 수 없는 상황에서도 계속 메시지를 로드 시도한다.
        // 그 과정에서 무한 루프에 빠져, 페이지가 로드되지 않는다.
        // 따라서, unread보다 msglist.length가 더 작으면, unread를 갱신한다. 이러면 실제 메시지 개수와 잘 맞게 된다.
        return res.status(200).render("channels/chattings.pug", {user, channelId, send_enter, channelName, unread,
            initialMsgs: JSON.stringify(msglist), // 직렬화
            csrfToken: req.csrfToken(),
        });
    } catch(err){
        return next(err);
    }
};

// PUT /:channelId
const quitChannel = async(req, res, next) =>{ // 채널 나가기
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        await ChannelDAO.quitChannel(channelId, user.id);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
}

// DELETE /:channelId
const deleteChannel = async(req, res, next) =>{ // 채널 지우기
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        await ChannelDAO.deleteChannel(channelId);
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
}

// GET /:channelId/invitelist
const inviteFriend = async(req, res, next) =>{ // 친구를 초대하기 위한 페이지를 렌더링.
    // 초대 가능한 친구의 리스트가 보임.
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        const flist = await ChannelDAO.getFriendsByIdNotInChannel(user.id, channelId); // 친구들 중 채널에 속하지 않은 친구의 리스트
        // 이들을 초대 가능.
        return res.status(200).render('channels/invites.pug', {user, channelId, flist:JSON.stringify(flist), // 직렬화
            csrfToken: req.csrfToken(),
        });
    } catch(err) {
        return next(err);
    }
}

// GET /:channelId/members
const memberList = async (req, res, next) =>{ // 채널에 속한 멤버 목록 불러오기
    try{
        const {user} = req.session;
        const {channelId} = req.params;
        let memberList = await ChannelDAO.getMemberFromChannel(channelId, user.id);
        
        return res.status(200).render('channels/member.pug', {user, channelId, memberList: JSON.stringify(memberList), // 직렬화
            csrfToken: req.csrfToken(),
        });
    }catch(err){
        return next(err);
    }
}

const sendMsg = async(req, res, next) =>{ // 메시지 보내기. 미사용.
    try{
        return; // 현재 사용하지 않음. 소켓 파트로 대체.
        // /scripts/chattingsockets.js에서 new msg 소켓 보내면, /src/index.js에서 받아서 처리.
        const {content} = req.body;
        if(content.length > 10000 || !content){
            return res.status(409).send(getAlertScript('0 ~ 10000 글자로 작성해주세요!'));
        }
        const {user} = req.session;
        const {channelId} = req.params;
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
    } catch(err){
        return next(err);
    }
}

const includeToChannel = async(req, res, next) =>{ // 초대하기. 미사용.
    try{
        return; // 현재 사용하지 않음. 소켓 파트로 대체.
        // /scripts/invitesockets.js에서 전송하면 /src/index.js에서 받아서 처리.
        console.log('hello');
        const {user} = req.session;
        const {channelId, targetId} = req.params;
        await ChannelDAO.includeToChannel(channelId, targetId);
        const channelInfo = (await ChannelDAO.getChannelInfoById(channelId));
        const unread = (await ChannelDAO.getChannelInfoById(channelId, targetId)).unread;
        const io = req.app.get('socketio');
        io.to(targetId).emit(`invite`, {
            cid: channelId,
            cname: channelInfo.name,
            cunread: unread,
            ctime: channelInfo.updatetime,
        });
        return res.redirect(303, 'back');
    } catch(err){
        return next(err);
    }
}



module.exports = {
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