var io = require('socket.io')();

const games = [
    'TicTacToe',
    'another',
];

const noop = (() => {});

const rooms = ['lobby'].concat(games);

let allUsers = [];

function getUsersInRoom(room) {
    return allUsers.filter(user => user.room === room);
}

io.on('connection', client => {
    const user = {
        id: client.id,
        name: client.id,
    };

    allUsers.push(user);

    console.log(client.id);

    client.on('send:message', (data, callback) => {
        console.log('received message inside', data);
        const cb = callback || noop;
        if (!data.room) {
            cb({ok: false, message: 'missing room'});
            return;
        }
        if (!rooms.includes(data.room)) {
            cb({ok: false, message: 'unknown room'});
            return;
        }
        if (!data.message) {
            cb({ok: false, message: 'missing message'});
            return;
        }
        client.to(data.room).emit('message', data.message);
        // client.emit('message', 'accepted');
        cb({ok: true});
    });

    client.on('get:usersInRoom', (room, callback) => {
        callback(getUsersInRoom());
    });

    client.join(rooms[0]);
    user.room = rooms[0];

    client.on('disconnect', () => {
        allUsers = allUsers.map(_u => _u !== user);
    });
    client.emit('init', {
        user: user,
        rooms: rooms,
    });
    // console.log('joined to lobby', client.id);
    // client.to('lobby').emit('message', 'joined to lobby', 'test');
    // // setTimeout(() => {
    // //     console.log('1sec timeout');
    // //     const s = sock.to('lobby');
    // //     s.emit('message', 'message 1sec timeout');
    // //     // s.broadcast('message', 'message 1sec timeout');
    // // }, 1000);
    // client.to('lobby').on('send:message', txt => {
    //     console.log('recived message:', txt);
    //     client.to('lobby').emit('message', txt);
    // });
    // console.log('connection on socket', sock);
    // sock.emit('message', 'emit message');
    // sock.on('join2', (ctx, data) => {
    //     console.log('inner join fired');
    //     console.log('ctx', ctx);
    //     console.log('data', data);
    //     data('woohoo');
    // });
});

setInterval(() => {
    io.to('lobby').emit('message', new Date());
}, 25000);


io.listen(3001);
