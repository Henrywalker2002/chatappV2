module.exports = function (app) {
    let accountCtrl = require('./controllers/accountController');

    // todo routes
    app.route('/account')
        .post(accountCtrl.post)
    app.route('/checkAcc')
        .post(accountCtrl.check)
}