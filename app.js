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
        data.step = true;
        ++counter;
    } else if (counter == 2) {
        data.name = 'User' + counter;
        data.simbol = 'O';
        data.color = '#FF1E00';
        data.step = false;
        counter = 1;
    }
    inGame.push({ id: id, name: data.name })
    // add unique id
    data.id = id;
    return data;
}

io.on('connection', function(socket) {

    socket.send(generateUser(socket.id));
    console.log('(connected):', socket.id);
    console.log(inGame);
    /*socket.broadcast.emit('click', User); */
    // for all users
    socket.on('click', (User) => {
    	// io.emit('click', User);
    	socket.broadcast.emit('click', User);
    });


    socket.on('disconnect', () => {
        inGame = inGame.filter(el => {
            if (el.id != socket.id) return el;
        });
        console.log('User disconnected');
        console.log(inGame);
    });
});

http.listen(port, function() {
    console.log('listening on *:' + port);
});