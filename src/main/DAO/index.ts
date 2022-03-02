import * as UserDAO from'./user';
import * as SocialDAO from'./social';
import * as ChannelDAO from'./channel';
import db from '../lib/dbconnection';
import pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';

/**
 * 
 * @param {Function} f 
 * function need to be excuted with one(same) connection
 * will be sequential DAO function inside of f
 * DAO function inside of f must use their last parameter as t to work with one(same) connection.
 * 
 * @param {pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}>=} task
 * will be Database from pg-promise
 * optional.
 * 
 * @returns return value of f
 */
async function compressIntoTask<T = any>(f: (t: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}>) => T, 
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<T> {
    return task.task(async (t): Promise<T> => await f(t));
}
/**
 * 
 * @param {Function} f 
 * function need to be excuted with one(same) connection
 * will be sequential DAO function inside of f
 * DAO function inside of f must use their last parameter as t to work with one(same) connection.
 * 
 * @param {pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}>=} task
 * optional.
 * @returns return value of f
 */

async function compressIntoTx<T = any>(f: (t: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}>) => T, 
    task: pgPromise.IDatabase<{}, pg.IClient> | pgPromise.ITask<{}> = db): Promise<T> {
    return task.tx(async (t): Promise<T> => await f(t));
}

export { UserDAO, SocialDAO, ChannelDAO, compressIntoTask, compressIntoTx };

/*
다른 코드에 접근하려면 require('~~/DAO');만 하면 됨.
디렉터리로 끝내면 해당 폴더의 index.js를 불러 옴.
*/