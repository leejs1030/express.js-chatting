const getAlertScript = msg => `<script>alert("${msg}");history.back();</script>`;

module.exports = {
    getAlertScript,
};