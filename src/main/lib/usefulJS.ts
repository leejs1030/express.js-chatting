const getAlertScript = (msg: string) => `<script>alert("${msg}");history.back();</script>`; // alert 메시지를 띄우기 위함
const errorAt = (name: string, err: Error) => { // 반복 작업 축소
    console.error("Error at " + name);
    console.error(err);
    return err;
};
const isNumber = (str: string) =>{ // 숫자인지 판별
	let x = parseInt(str);
	if(isNaN(x)) return false;
	return true;
};

export {
    getAlertScript,
    errorAt,
    isNumber,
};