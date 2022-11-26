$('#btnSignUp').click(async function signUp() {
    let username = $('#username').val()
    let password = $('#password').val()
    let name = $('#name').val()
    let email = $('#email').val()

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    var raw = JSON.stringify({
      "username": username,
      "password": password,
      "email":email,
      "name":name
    });
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    const response = await fetch("https://serverofchatapp.herokuapp.com/signUp", requestOptions)
    var json_ = await response.json()
    if (json_['result'] != "ok") {
      alert(json_['message'])
    }
    else {
      alert('ok')
      window.location.href = 'index.html'
    }
})