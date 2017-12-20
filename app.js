const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
// game parameters
let counter = 1;
let inGame = [];

app.use(require('express').static('public'))

app.get('/', function(req, res) {
    res.sendFile('/index.html');
});

function generateUser(id) {
    let data = {};
    if (counter == 1) {
        data.name = 'User' + counter;
        data.simbol = 'X';
        data.color = '#52FF37';
        data.isMove = true;
        ++counter;
    } else if (counter == 2) {
        data.name = 'User' + counter;
        data.simbol = 'O';
        data.color = '#FF1E00';
        data.isMove = false;
        counter = 1;
    }
    inGame.push({ id: id, name: data.name })
    // add unique id
    data.id = id;
    return data;
}

io.on('connection', function(socket) {

    // once send Data for User who connect to the server
    socket.send(generateUser(socket.id), inGame.length);
    socket.emit('connection', inGame.length)

    console.log('Connected :', socket.id);

    console.log(inGame);

    // for all users
    socket.on('click', (Data) => {
        // io.emit('click', User);
        socket.broadcast.emit('click', Data);
    });

    socket.on('win', (simbol) => {
        // io.emit('click', User);
        socket.broadcast.emit('win', simbol);
    });
    
    socket.broadcast.emit('disconnect', inGame.length-1);
    socket.on('disconnect', () => {
        // here will be the function which will --count of users in game
        inGame = inGame.filter(el => {
            if (el.id != socket.id) return el;
        });
        // say all users to --counter of onlineCounter;
        console.log('Disconnected :', socket.id);
        console.log(inGame);
    });
});

http.listen(port, function() {
    console.log('listening on *:' + port);
});