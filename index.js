
// Dependency Modules
var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
//var fs = require('fs');

// Globals
var user_with_recent_change = null;
var usernames = {};
var user_counter = 1;

// Assigning Port
var port = process.env.PORT || 5000;
server.listen(port, function() {
    console.log("Server listening to port %d", port);
});

// Routing
app.use(express.static(__dirname + "/"));

// Handle data transmission
io.on("connection", function(socket) {

    user_counter += 1;
    username = "user" + user_counter;
    usernames[socket.id] = username;

    socket.emit("set_username", username);

    socket.on("change_username", function(data) {
        usernames[socket.id] = data;
    });

    socket.on("send data", function(data) {
        user_with_recent_change = socket.id;
        socket.broadcast.emit("data update", data);
    });

    socket.on("recent_state", function(res) {
        var req_user = res.req_user;
        var data = res.data;
        io.sockets.connected[req_user].emit("recent_state", data);
    });

    socket.on("get_recent_state", function(res){
        if(user_with_recent_change != null) {
            io.sockets.connected[user_with_recent_change].emit("send_recent_state", socket.id);
        }
    });

    socket.on("send_recent_state", function(data) {
        socket.broadcast.emit("recent_state", data);
    });

    socket.on("disconnect", function(res) {
        delete usernames[socket.id];
    });

});
