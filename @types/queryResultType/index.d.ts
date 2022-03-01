declare module 'custom-type'{    
    export type channelInfo = {
        id: number,
        name: string,
        update_time: string,
        creater: string,
        uid?: string,
        unread?: number,
    }

    export type msg = {
        id: string,
        nick?: string,
        msg: string,
        msg_time: string,
    }

    export type user = {
        id: string,
        nick?: string,
        password?: string,
        setting?: setting,
        canRequest?: boolean,
        canBlack?: boolean,
        friend_time?: string,
        req_time?: string,
        black_time?: string,
    }

    export type user_setting = {
        id: string,
        send_enter: boolean,
    }
}