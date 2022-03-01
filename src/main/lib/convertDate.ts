import moment from 'moment';

function convertDate(timestamp: string | undefined): string | undefined { // postgresql의 타임스탬프 object를 바로 출력 가능하도록 string으로 변환
    const gotData = moment(timestamp);
    const result = gotData.format('YYYY/MM/DD HH:mm:ss');
    return result;
}

export {convertDate};