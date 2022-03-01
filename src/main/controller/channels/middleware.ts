import { ChannelDAO } from '../../DAO';
import { getAlertScript } from '../../lib/usefulJS';
import { NextFunction, Request, Response } from 'express';
import { user } from 'custom-type';

// 채널이 존재하는지 확인해주는 미들웨어.
async function doesChannelExist(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>> {
    try {
        const channelId = parseInt(req.params.channelId);
        const result = await ChannelDAO.getChannelInfoById(channelId);
        if (result instanceof Error) return res.status(404).send(getAlertScript('존재하지 않는 채널입니다!')); // 상태코드는 404 NOT FOUND
        else return next();
    } catch (err) {
        return console.log(err);
    }
}

// 요청을 보낸 사용자가 채널의 멤버인지 확인하는 미들웨어.
async function membershipRequired(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>> {
    try {
        const channelId = parseInt(req.params.channelId);
        const { user } = req.session as {user: user};
        const result = await ChannelDAO.isChannelMember(channelId, user.id);
        if (result) return next(); // 정상. 다음 미들웨어로
        else return res.status(403).send(getAlertScript('속하지 않은 채널입니다!')); // 상태 코드는 403 Forbidden
    } catch (err) {
        return console.log(err);
    }
}

// 요청을 보낸 사용자가 채널을 만든 사람인지 확인하는 미들웨어.
async function ownRequired(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>> {
    try {
        const channelId = parseInt(req.params.channelId);
        const { user } = req.session as {user: user};
        const result = await ChannelDAO.isChannelCreater(channelId, user.id);
        if (result) return next(); // 정상. 다음 미들웨어로
        else return res.status(403).send(getAlertScript('관리자만이 접근할 수 있습니다!')); // 상태 코드는 403 Forbidden
    } catch (err) {
        return console.log(err);
    }
}

const digits = new RegExp('^[1-9][0-9]*$'); // 정규표현식. (시작) 자연수 (끝)

// 정규표현식 만족 확인
async function isChannelId(req: Request, res: Response, next: NextFunction, id: string): Promise<void | Response<any, Record<string, any>>> {
    if (digits.exec(id)) return next(); // 정상. 다음 미들웨어로
    else return res.status(400).send(getAlertScript('적절하지 않은 채널 id입니다! 자연수로 입력해주세요.')); // 상태 코드는 400 Bad Request
}

export {
    doesChannelExist,
    membershipRequired,
    ownRequired,
    isChannelId,
};