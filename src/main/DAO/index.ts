import UserDAO = require('./user');
import SocialDAO = require('./social');
import ChannelDAO = require('./channel');
import db from '../lib/dbconnection';

/**
 * 
 * @param {Function} f 
 * function need to be excuted with one(same) connection
 * will be sequential DAO function inside of f
 * DAO function inside of f must use their last parameter as t to work with one(same) connection.
 * 
 * @param {any=} task
 * will be Database from pg-promise
 * optional.
 * 
 * @returns return value of f
 */
async function compressIntoTask(f: Function, task: any | undefined = db): Promise<any> {
    return task.task(async (t: any) => await f(t));
}
/**
 * 
 * @param {Function} f 
 * function need to be excuted with one(same) connection
 * will be sequential DAO function inside of f
 * DAO function inside of f must use their last parameter as t to work with one(same) connection.
 * 
 * @param {any=} task
 * optional.
 * @returns return value of f
 */

async function compressIntoTx(f: Function, task: any | undefined = db) {
    return task.tx(async (t: any) => await f(t));
}

export { UserDAO, SocialDAO, ChannelDAO, compressIntoTask, compressIntoTx };

/*
다른 코드에 접근하려면 require('~~/DAO');만 하면 됨.
디렉터리로 끝내면 해당 폴더의 index.js를 불러 옴.
*/