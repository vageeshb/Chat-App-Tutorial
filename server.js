// server.js -- Express v4.0.0

// LOADING REQ MODULES
var express = require('express')
  , path = require('path')
  , favicon = require('static-favicon')
  , logger = require('morgan');
  
var app = express();

var PORT =  process.env.PORT || 3000;

// MIDDLEWARE
app.use(favicon());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
// Index route
app.get('/', function(req, res) {
  res.sendfile(path.join(__dirname, 'views/index.html'));
});

app.get('*', function(req, res) {
  res.redirect('/');
});

// LAUNCHING OUR SERVER
var server = app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});

// SOCKETS CONFIG
var io = require('socket.io').listen(server);

// ARRAY TO STORE CONNECTED SOCKETS
var connectedSockets = [];

io.sockets.on('connection', function (socket) {

  // NEW CONNECTION EVENT
  socket.on('newConnection', function (data) {
    // SAVE THE SOCKET
    var username = data.username;
    connectedSockets.push({ 
      username: username,
      socket: socket});
    
    // GENERATE LIST OF CONNECTED USERS
    var connectedUsers = [];
    connectedSockets.forEach( function(data) {
      connectedUsers.push(data.username);
    });
    //console.log(connectedUsers);
    // SEND LIST OF CONNECTED USERS
    socket.emit('connectedUsers', { users: connectedUsers});  

    // SEND NOTIFICATION TO OTHER CONNECTED USERS
    socket.broadcast.emit('newUserJoined', { username: data.username });
  });

  // NEW MESSAGE EVENT
  socket.on('newMessage', function (data) {
    io.sockets.emit('pushMessage', {
      message: data.message, 
      sender: data.owner,
      time: new Date()
    });
  });

  // DISCONNECTION EVENT
  socket.on('disconnect', function () {
    // REMOVE SOCKET FROM SAVED CONNECTED USERS LIST
    connectedSockets.forEach( function(data) {
      if(data.socket == socket) {
        // SEND NOTIFICATION TO OTHER CONNECTED USERS
        io.sockets.emit('userLeft', {username: data.username});
        var i = connectedSockets.indexOf(data);
        connectedSockets.splice(i,1);
      }
    });
  });

});