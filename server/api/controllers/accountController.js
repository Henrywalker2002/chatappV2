var listAcc = new Map()

module.exports = {
    check: (req, res) => {
        var username = req.body.username
        if (listAcc.get(username) == undefined) {
            res.json({"result":"fail", "message":"username is not exist"})
        }
        else if (listAcc.get(username) != req.body.password) {
            res.json({"result":"fail", "message":"password is incorrect"})
        }
        else {
            res.json({"result":"ok"})
        }
    },
    post: (req, res) => {
        var username = req.body.username
        if (listAcc.get(username) != undefined){
            res.json({"result":"fail", "message":"username have already been exist"})
        }
        else {
            listAcc.set(username, req.body.password)
            res.json({"result":"ok"})
        }
    }
}