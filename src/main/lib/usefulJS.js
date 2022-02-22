const getAlertScript = (msg) => `<script>alert("${msg}");history.back();</script>`; // alert 메시지를 띄우기 위함
const errorAt = (name, err) => { // 반복 작업 축소
    console.log("Error at " + name);
    // console.log(err);
    // throw err;
    return err;
};
const isNumber = (str) =>{ // 숫자인지 판별
	let x = parseInt(str);
	if(isNaN(x)) return false;
	return true;
};

module.exports = {
    getAlertScript,
    errorAt,
    isNumber,
};