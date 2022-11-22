var io = require('socket.io')(3000);

const arrUser = []

// begin api

let express = require('express');
let app = express();
let port = process.env.PORT || 5300;
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
let routes = require('./api/routes')
routes(app)

app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
})

app.listen(port);

console.log('RESTful API server started on: ' + port);

//end rest api

// socket
io.on('connection', socket => {
    socket.on('signUp', user => {
        const isExist = arrUser.some(e => e.username == user.username)
        socket.peerId = user.peerId
        if (isExist) {
            return socket.emit('existence')
        }
        arrUser.push(user)
        socket.emit('list', arrUser)
        socket.broadcast.emit('new', user)
    })

    socket.on('disconnect', () => {
        const index = arrUser.findIndex(user => user.peerId === socket.peerId)
        arrUser.slice(index, 1)
        io.emit('dropUser', socket.peerId);
    })
})