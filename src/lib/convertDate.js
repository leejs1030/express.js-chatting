const moment = require('moment');

const convertDate = (timestamp) =>{
    const result = moment(timestamp);
    return result.format('YYYY/MM/DD HH:mm:ss');
}

module.exports = {convertDate};