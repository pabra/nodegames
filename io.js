var io = require('socket.io')();

const games = [
    'TicTacToe',
    'another',
];

const noop = (() => {});

const rooms = ['lobby'].concat(games);

const allUsers = [];

function getUsersInRoom(room) {
    return allUsers.filter(user => user.room === room);
}

function clientJoinRoom(client, user, room, callback=noop) {
    if (!rooms.includes(room)) {
        callback({ok: false, message: 'unknown room'});
        return;
    }

    if (room === user.room) {
        callback({ok: false, message: 'already in room'});
        return;
    }

    if (user.room) {
        client.leave(user.room);
        client.to(user.room).emit('message', `${user.name} left`);
        client.to(user.room).emit('user:leave', user);
    }
    client.join(room);
    client.to(room).emit('message', `${user.name} joined`);
    client.to(room).emit('user:join', user);
    user.room = room;
    callback({ok: true, user: user, users: getUsersInRoom(room)});
    console.log(client.id, allUsers);
}

io.on('connection', client => {
    const user = {
        id: client.id,
        name: client.id,
    };

    allUsers.push(user);

    console.log(client.id, allUsers);

    client.on('send:message', (data, callback=noop) => {
        console.log('received message inside', data);
        if (!data.room) {
            callback({ok: false, message: 'missing room'});
            return;
        }
        if (!rooms.includes(data.room)) {
            callback({ok: false, message: 'unknown room'});
            return;
        }
        if (!data.message) {
            callback({ok: false, message: 'missing message'});
            return;
        }
        client.to(data.room).emit('message', data.message);
        // client.emit('message', 'accepted');
        callback({ok: true});
    });

    client.on('join', (room, callback) => clientJoinRoom(client, user, room, callback));

    clientJoinRoom(client, user, rooms[0]);

    client.on('disconnect', () => {
        client.to(user.room).emit('message', `${user.name} disconnected`);
        client.to(user.room).emit('user:leave', user);
        allUsers.findIndex((item, idx, arr) => arr.splice(idx, 1));
    });
    client.emit('init', {
        user: user,
        rooms: rooms,
        users: getUsersInRoom(user.room),
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

// setInterval(() => {
//     io.to('lobby').emit('message', new Date());
// }, 25000);


io.listen(3001);
