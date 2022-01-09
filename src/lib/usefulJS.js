const getAlertScript = (msg) => `<script>alert("${msg}");history.back();</script>`;
const errorAt = (name, err) => {
    console.log("Error at " + name);
    console.log(err);
    return err;
};

module.exports = {
    getAlertScript,
    errorAt,
};