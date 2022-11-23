/* var io = require('socket.io')(3000);



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

console.log('RESTful API server started on: ' + port); */

//end rest api

// let port = process.env.PORT || 5300;

const arrUser = []

// var io = require('socket.io')(3000)

/* var app = require('express')();
var https = require('http')
const server = https.createServer(app)
const {Server} = require('socket.io')
var io = new Server(server)

server.listen(port, function(){
    console.log('listening on *' + port);
}); */

const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const router = require('./api/routes');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

// socket
io.on('connection', socket => {
    socket.on('signUp', user => {
        const isExist = arrUser.some(e => e.username == user.username)
        socket.peerId = user.peerId;
        console.log(user.username + socket.id)
        if (isExist) {
            return socket.emit('existence')
        }
        arrUser.push(user)
        socket.emit('list', arrUser)
        socket.broadcast.emit('new', user)
    })

    socket.on('disconnect', () => {
        let index = arrUser.findIndex(user => user.peerId === socket.peerId);
        console.log(index)
        let user = arrUser[index]
        arrUser.splice(index, 1)
        console.log(arrUser)
        io.emit('dropUser', user);
    })
})

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));