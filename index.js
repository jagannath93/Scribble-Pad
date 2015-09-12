var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
//var fs = require('fs');

// Assigning Port
var port = process.env.PORT || 5000;
server.listen(port, function() {
    console.log("Server listening to port %d", port);
});

// Routing
app.use(express.static(__dirname + "/"));

// Handle data transmission
io.on("connection", function(socket) {
    socket.on("send data", function(data) {
        socket.broadcast.emit("data update", data);
    });
    socket.on("send image", function(data) {
        console.log("image data received!");
        socket.broadcast.emit("image update", data);
        console.log("image broadcasted!");
    });
});
