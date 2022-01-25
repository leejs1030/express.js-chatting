const getAlertScript = (msg) => `<script>alert("${msg}");history.back();</script>`;
const errorAt = (name, err) => {
    console.log("Error at " + name);
    console.log(err);
    // throw err;
    return err;
};
const isNumber = (str) =>{
	let x = parseInt(str);
	if(isNaN(x)) return false;
	return true;
};

module.exports = {
    getAlertScript,
    errorAt,
    isNumber,
};