var server = require('http').createServer(),
    io = require('socket.io')(server);

io.of('/wall').on('connection', function (socket){
    socket.on('chat', function (message) {
        io.of('wall').emit('chat', message);
    });

    socket.on('disconnect', function () {});
});

server.listen(3000);
