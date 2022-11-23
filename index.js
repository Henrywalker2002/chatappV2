const express = require('express');
const app = express();

app.get('/', function(request, response){
    response.sendFile('absolutePathToYour/htmlPage.html');
});