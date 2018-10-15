module.exports = function (app) {

    // api ---------------------------------------------------------------------
    app.get('/api/test', function (req, res) {
        res.send('Hello World!');
    });

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
