const moment = require('moment');

const convertDate = (timestamp) =>{
    const gotData = moment(timestamp);
    const result = gotData.format('YYYY/MM/DD HH:mm:ss');
    return result;
}

module.exports = {convertDate};