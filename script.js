const socket = io('http://localhost:3000', {transports : ['websocket'], upgrade: false});

var listCon = new Map()
var otherUsername = ""
var otherId = ""
var listUserName = new Map()
var listId = new Map()
var myUsername

var peer = new Peer('' ,{
  secure : true,
  host: "https://peerjsserver10.herokuapp.com/",
  port: 443
});

// handle peer

$('#chat').hide()

peer.on('open', id => {
    $('#btnlog').click(async function() {
        let json_ = await login()
        if (json_['result'] == "ok") {
            myUsername = json_['username']
            let username = myUsername
            socket.emit('signUp', {username: username, peerId : id})
            myUsername = username
            $('#chat').show()
            $('#form-log').hide()
        }
    })
})

function connect(id) {
    var conn = peer.connect(id, {label: myUsername, reliable : true});
    listCon.set(id, conn);
    // on open will be launch when you successfully connect to PeerServer
    conn.on('open', function(){
      // here you have conn.id
    });
}


var downloadBlob, downloadURL;

downloadBlob = function(data, fileName, mimeType) {
  var blob, url;
  blob = new Blob([data], {
    type: mimeType
  });
  url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

downloadURL = function(data, fileName) {
  var a;
  a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = 'display: none';
  a.click();
  a.remove();
};


peer.on('connection', function(conn) {
    console.log(conn.peer)
    var username = conn.label
    listUserName.set(username, conn.peer)
    if (listCon.get(conn.peer) == undefined) {
        addChatUser(username)
        listCon.set(conn.peer, conn)
        connect(conn.peer)
    }
    conn.on('data', function(data){
        if (data.type.includes('file')) {
        const bytes = new Uint8Array(data.file)
        const blob = new Blob([data.file], {
            type: data.filetype
        })
        downloadBlob(blob, data.filename, data.filetype)
        console.log(url)
        console.log(file)
        console.log(typeof(file))
        }
        // Will print 'hi!'
        console.log(data)
        addMessage(username, username + ': ' + data)
    });
});

function sendMessage(id, message) {
    conn = listCon.get(id)
    conn.send(message)
}

//end peer

//socket

socket.on('list', arrUser => {
    $('#chat').show()
    $('#sign-up').hide()
    arrUser.forEach(user =>{
        const {username , peerId }= user
        $('#listUser').append(`<li id = "${peerId}">${username}</li>`)
    })

    socket.on('new', user=> {
        const {username , peerId }= user
        $('#listUser').append(`<li id = "${peerId}">${username}</li>`)
    })

    socket.on('existence', () => {
        alert('existence')
    })
})

socket.on('dropUser', peerId => {
    $(`#${peerId}`).remove()
})

//end socket

// begin btn

$('#listUser').on('click', 'li', function() {
   let id = $(this).attr('id')
   let username = this.textContent
   if (listCon.get(id) == undefined) {
    connect(id)
    addChatUser(username)
    otherUsername = username
    listUserName.set(username, id)
   }
})

$('#btnCall').click(function handleCall(){
    let username = $('#callUsername').val()
    id = listUserName.get(username)
    connect(id)
    addChatUser(username)
    otherUsername = username
    otherId = id
})

$('#btn-send').click(function handleSend(){
    let message = $('#input-mess').val()
    addMessage(otherUsername, myUsername + ': ' +  message)
    sendMessage(otherId, message)
})

// end btn 

function addChatUser(username) {
    // create button on left box
    var btn = document.createElement('button')
    btn.textContent = username
    btn.id = username
    btn.type = "summit"
    // handle click on username
    btn.onclick = function() {
        let usernameClick = btn.textContent
        if (otherUsername != "") {
            let temp = document.getElementById('box-' + otherUsername)
            temp.style.display= 'None'
            }
        otherUsername = usernameClick
        otherId = listUserName.get(otherUsername)
        let temp = document.getElementById('box-' + otherUsername)
        temp.style.display = "block"
    }
    // handle left box on fisrt call 
    var item = document.getElementById('left-box')
    var div = document.createElement('div')
    div.append(btn)
    item.appendChild(div)
    div.style.marginTop = "10px"
    // handle right box
    var boxMess = document.createElement('div')
    boxMess.classList.add('mess-box')
    boxMess.id = "box-" + username
    var text = document.createTextNode("Messenger")
    boxMess.appendChild(text)
    var box = document.getElementById('mess-his')
    box.append(boxMess)
}

function addMessage(username, message) {
    var p = document.createTextNode(message)
    console.log('box-' + username)
    var boxMess = document.getElementById('box-' + username)
    let div = document.createElement('div')
    div.appendChild(p)
    boxMess.appendChild(div)
}

// handle login
async function login(){
    var username = $('#username').val();
    var password = $('#password').val();
  
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    var raw = JSON.stringify({
      "username": username,
      "password": password
    });
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    const response = await fetch("https://serverofchatapp.herokuapp.com/acc", requestOptions)
    var json_ = await response.json()
    if (json_['result'] != "ok") {
      console.log(json_['message'])
      alert(json_['message'])
      return json_
    }
    username = json_['username']
    return json_
  }

function connectFile(id, selectFile) {
    var conn = listCon.get(id)
    const file = selectFile[0]
    const blob = new Blob(selectFile, { type: file.type })
    
    conn.send({
      file: blob,
      filename: file.name,
      filetype: file.type,
      type : "file"
    })
}

$('#send-file').click(function handleSendFile() {
    const selectFile = document.getElementById('file').files
    let username = $('#fileUsername').val()
    let id = listUserName.get(username)
    connectFile(id, selectFile)
})

const encode = input => {
    const keyStr =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    let output = ''
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4
    let i = 0
  
    while (i < input.length) {
      chr1 = input[i++]
      chr2 = i < input.length ? input[i++] : Number.NaN // Not sure if the index
      chr3 = i < input.length ? input[i++] : Number.NaN // checks are needed here
  
      enc1 = chr1 >> 2
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
      enc4 = chr3 & 63
  
      if (isNaN(chr2)) {
        enc3 = enc4 = 64
      } else if (isNaN(chr3)) {
        enc4 = 64
      }
      output +=
        keyStr.charAt(enc1) +
        keyStr.charAt(enc2) +
        keyStr.charAt(enc3) +
        keyStr.charAt(enc4)
    }
    return output
  }