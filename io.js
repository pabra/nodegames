const io = require('socket.io')();
const logger = require('./lib/logger');
const locker = require('./lib/locker');

const games = [
    'TicTacToe',
    'another',
];

const noop = (() => {});

const rooms = ['lobby'].concat(games);

const allUsers = [];

function isUserNameAvailable(name) {
    return !allUsers.some(user => {
        return user.name === name;
    });
}

function getGuestName() {
    const prefix = 'Guest';
    const maxTry = 100;
    let testName = prefix;
    for (let i = 1; i <= maxTry; i++) {
        testName = `${prefix}${i}`;
        if (isUserNameAvailable(testName)) return testName;
    }
    throw new Error('could not get guest name');
}

function getUsersInRoom(room) {
    return allUsers.filter(user => user.room === room);
}

function clientJoinRoom(client, user, room, callback=noop) {
    if (!rooms.includes(room)) {
        callback({ok: false, text: 'unknown room'});
        return;
    }

    if (room === user.room) {
        callback({ok: false, text: 'already in room'});
        return;
    }

    if (user.room) {
        client.leave(user.room);
        client.to(user.room).emit('message', {userName: 'system', text: `${user.name} left`});
        client.to(user.room).emit('user:leave', user);
    }
    client.join(room);
    client.to(room).emit('message', {userName: 'system', text: `${user.name} joined`});
    // io.to(room).emit('message', {userName: 'system', text: `${user.name} joined`});
    client.to(room).emit('user:join', user);
    user.room = room;
    callback({ok: true, user: user, users: getUsersInRoom(room)});
}

function ioLogger(data) {
    console.log('data', data);
    console.log('arguments', arguments);
}

io.on('connection', async client => {
    logger.debug('client connected', client.id);
    const user = {id: client.id};
    try {
        const lock = await locker(allUsers);
        user.name = getGuestName();

        allUsers.push(user);
        lock.unlock();
    } catch (e) {
        logger.error('cought lock error', e);
        // throw e;
        return;
    }

    client.on('send:message', (data, callback=noop) => {
        logger.debug('received message', client.id, data);
        if (!data.room) {
            callback({ok: false, text: 'missing room'});
            return;
        }
        if (!rooms.includes(data.room)) {
            callback({ok: false, text: 'unknown room'});
            return;
        }
        if (!data.text) {
            callback({ok: false, text: 'missing message'});
            return;
        }
        client.to(data.room).emit('message', {userName: user.name, text: data.text});
        // client.emit('message', 'accepted');
        callback({ok: true});
    });

    client.on('join', (room, callback) => clientJoinRoom(client, user, room, callback));

    client.on('ioLogger', data => ioLogger(Object.assign({}, data, {user})));

    clientJoinRoom(client, user, rooms[0]);

    client.on('disconnect', () => {
        client.to(user.room).emit('message', {userName: 'system', text: `${user.name} disconnected`});
        client.to(user.room).emit('user:leave', user);
        allUsers.findIndex((item, idx, arr) => arr.splice(idx, 1));
    });
    client.emit('init', {
        user: user,
        rooms: rooms,
        users: getUsersInRoom(user.room),
    });
});

io.listen(3001);
