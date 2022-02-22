const UserDAO = require('./user');
const SocialDAO = require('./social');
const ChannelDAO = require('./channel');

module.exports = { UserDAO, SocialDAO, ChannelDAO };

/*
다른 코드에 접근하려면 require('~~/DAO');만 하면 됨.
디렉터리로 끝내면 해당 폴더의 index.js를 불러 옴.
*/