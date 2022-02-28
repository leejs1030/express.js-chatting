declare module 'custom-type'{    
    export type channelInfo = {
        id: number,
        name: string,
        updatetime: string,
        creater: string,
        uid?: string,
        unread?: number,
    }

    export type msg = {
        id: string,
        nick?: string,
        msg: string,
        msg_date: string,
    }

    export type user = {
        id: string,
        nick?: string,
        canRequest?: boolean,
        canBlack?: boolean,
        friend_date?: string,
        req_date?: string,
        black_date?: string,
    }
}