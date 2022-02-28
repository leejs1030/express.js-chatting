declare module 'custom-type'{    
    export interface channelInfo {
        id: number,
        name: string,
        updatetime: string,
        creater: string,
        uid?: string,
        unread?: number,
    }

    export interface msg {
        id: string,
        nick?: string,
        msg: string,
        msg_date: string,
    }

    export interface user {
        id: string,
        nick?: string,
        canRequest?: boolean,
        canBlack?: boolean,
        friend_date?: string,
        req_date?: string,
        black_date?: string,
    }
}