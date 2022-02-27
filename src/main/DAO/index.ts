import UserDAO = require('./user');
import SocialDAO = require('./social');
import ChannelDAO = require('./channel');
import {db} from '../lib/dbconnection';

/**
 * 
 * @param {function} f 
 * function need to be excuted with one(same) connection
 * will be sequential DAO function inside of f
 * DAO function inside of f must use their last parameter as t to work with one(same) connection.
 * 
 * @param {object} task 
 * optional.
 * @returns return value of f
 */
const compressIntoTask = async (f, task = db) => {
    return task.task(async t => await f(t)).then(data => data);
}
/**
 * 
 * @param {function} f 
 * function need to be excuted with one(same) connection
 * will be sequential DAO function inside of f
 * DAO function inside of f must use their last parameter as t to work with one(same) connection.
 * 
 * @param {object} task 
 * optional.
 * @returns return value of f
 */

const compressIntoTx = async (f, task = db) => {
    return task.tx(async t => await f(t)).then(data => data);
}

export { UserDAO, SocialDAO, ChannelDAO, compressIntoTask, compressIntoTx };

/*
다른 코드에 접근하려면 require('~~/DAO');만 하면 됨.
디렉터리로 끝내면 해당 폴더의 index.js를 불러 옴.
*/