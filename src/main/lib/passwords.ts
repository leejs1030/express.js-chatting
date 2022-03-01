import util = require('util'); // promise로 다룰 필요 없이 비동기 함수 사용
import crypto = require('crypto'); // 암호화에 필요

const pbkdf2 = util.promisify(crypto.pbkdf2); // 해시함수 + 솔트 적용
const randomBytes = util.promisify(crypto.randomBytes); // 안전한 랜덤

async function generatePassword(password: string): Promise<string> {
    const ALGO = 'sha512'; // 해시 알고리즘
    const KEY_LEN = 64; // 해시값에 사용할 바이트 수. 64byte = 512bit
    const salt = await randomBytes(32); // 솔트
    const iter = crypto.randomInt(200000, 220000); // 반복 횟수 랜덤
    const digest = await pbkdf2(password, salt, iter, KEY_LEN, ALGO); // 암호화
    return `${ALGO}:${salt.toString('base64')}:${iter}:${KEY_LEN}:${digest.toString('base64')}`; // 리턴. base64로 인코딩
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [algo, encodedSalt, iterStr, keyLenStr, encodedDigest] = hashedPassword.split(':');
    // : 기준으로 구분되었으므로, : 기준으로 split하기.
    const salt = Buffer.from(encodedSalt, 'base64'); // base64로 인코딩이므로
    const iter = parseInt(iterStr, 10); // 10진 정수로 해석해서 int로 변경
    const keyLen = parseInt(keyLenStr, 10); // 10진 정수로 해석해서 int로 변경
    const storedDigest = Buffer.from(encodedDigest, 'base64'); // base64로 인코딩이므로
    const digest = await pbkdf2(password, salt, iter, keyLen, algo); // 입력받은 패스워드에 다시 같은 조건으로 해시를 돌림
    return Buffer.compare(digest, storedDigest) === 0; // 해시 값이 같다면, 맞은 것
}

export { generatePassword, verifyPassword };