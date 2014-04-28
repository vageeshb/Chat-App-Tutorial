// public/app.js

$(document).ready( function () {
  // STORE CURRENT USERNAME AS GLOBAL VARIABLE
  var username;

  // INITIATE CONNECTION
  var socket = io.connect('http://localhost');

  // BROADCAST TO CONNECTED USERS ABOUT NEW USER
  $('#setUsername').click(function () {
    if($('#username').val()!='') {
      username = $('#username').val();
      // SOCKET.IO EVENT
      socket.emit('newConnection', { username: username});
      $('#username').attr('disabled', 'disabled');
      $('nav ul li').append("<a href='#'>Logged in as: " + username + "</a");
      $('#setUserArea').hide();
      $('#chatControls').toggleClass('hide');
    }
  });

  // BROADCAST NEW MESSAGE
  $('#sendMessage').click( function () {
    if($('#chatMessage').val()!='') {
      var message = $('#chatMessage').val();
      socket.emit('newMessage', {message: message, owner: username});
    }
  });

  // HANDLING LIST OF CONNECTED USERS
  socket.on('connectedUsers', function (data) {
    var users = data.users;
    // READING THE LIST AND ATTACHING EACH USER
    for (var i = 0; i < users.length; i++) {
      var user = '<div class="user" id="' + users[i] + '">' + users[i] + '</div>';
      $('#connectedUsers').append(user);
    };
  });

  // HANDLING NOTIFICATION OF NEW USER
  socket.on('newUserJoined', function (data) {
    var newUser = '<div class="user" id="' + data.username + '">' + data.username + '</div>';
    $('#connectedUsers').append(newUser);
  });

  // HANDLING RECEPTION OF NEW MESSAGE 
  socket.on('pushMessage', function (data) {
    var timeString = new Date(data.time).toTimeString();
    if(data.sender == username) {
      var newMessage = '<div class="owner"><div><strong>You</strong> at <strong>' + timeString  + '</strong> says:</div><div>' + data.message + '</div>';
    } else {
      var newMessage = '<div class="sender"><div><strong>' + data.sender + '</strong> at <strong>' + timeString + '</strong> says:</div><div>' + data.message + '</div>';
    }
    $('#chatArea').prepend(newMessage);
  });

  // HANLDING NOTIFICATION OF USER DISCONNECTION
  socket.on('userLeft', function (data) {
    var username = data.username;
    $('#' + username).remove();
  });

});