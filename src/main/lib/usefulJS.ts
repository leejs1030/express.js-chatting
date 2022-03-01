const getAlertScript = (msg: string): string => `<script>alert("${msg}");history.back();</script>`; // alert 메시지 띄우기
function errorAt(name: string, err: any): any { // 에러 처리를 위한 반복되는 코드를 축소
    console.error("Error at " + name);
    console.error(err);
    return err;
}
function isNumber(str: string): boolean { // 숫자인지 판별
    let x = parseInt(str);
    if (isNaN(x)) return false;
    else return true;
}

export {
    getAlertScript,
    errorAt,
    isNumber,
};