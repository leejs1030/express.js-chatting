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
        channel_id?: number,
        msg: string,
        msg_time?: string,
    }

    export type user = {
        id: string,
        nick: string,
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

    import pgPromise from 'pg-promise';
    import pg from 'pg-promise/typescript/pg-subset';
    export type atomictask = (pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}>);
}