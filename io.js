const io = require('socket.io')();
const logger = require('./lib/logger');
const locker = require('./lib/locker');

// const games = [
//     'TicTacToe',
//     'another',
// ];

const noop = (() => {});

// const rooms = ['lobby'].concat(games);

const allUsers = [];
const games = {
    lobby: {
        name: 'Lobby',
        isNoGame: true,
        description: 'place to meet and search for games',
        rooms: [],
    },
    tictactoe: {
        name: 'Tic Tac Toe',
        description: 'simple Tic Tac Toe game',
        rooms: [],
    },
    another: {
        name: 'game to write',
        description: 'game that needs to be written',
        rooms: [],
    },
};

const gamesKeys = Object.keys(games);
const staticGames = {};

for (let gk of gamesKeys) {
    games.lobby.rooms.push(gk);
    staticGames[gk] = {};
    for (let k in games[gk]) {
        if (!(games[gk].hasOwnProperty(k))) continue;
        if (k === 'rooms') continue;

        staticGames[gk][k] = games[gk][k];
    }
}

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
        if (isUserNameAvailable(testName)) {
            return testName;
        }
    }
    throw new Error('could not get guest name');
}

function getUsersInRoom(room) {
    return allUsers.filter(user => user.inRoom === room);
}

function clientJoinRoom(client, user, room, game, callback=noop) {
    if (!gamesKeys.includes(game)) {
        callback({ok: false, text: 'unknown game'});
        return;
    }

    if (!games[game].rooms.includes(room)) {
        callback({ok: false, text: 'unknown room'});
        return;
    }

    if (room === user.inRoom) {
        callback({ok: false, text: 'already in room'});
        return;
    }

    if (user.inRoom) {
        client.leave(user.inRoom);
        client.to(user.inRoom).emit('message', {userName: 'system', text: `${user.name} left`});
        client.to(user.inRoom).emit('user:leave', user);
    }

    client.join(room);
    client.to(room).emit('message', {userName: 'system', text: `${user.name} joined`});
    // io.to(room).emit('message', {userName: 'system', text: `${user.name} joined`});
    client.to(room).emit('user:join', user);
    user.inGame = game;
    user.inRoom = room;
    callback({ok: true, user: user, users: getUsersInRoom(room)});
}

function ioLogger(data) {
    console.log('data', data);
    logger.debug('data.stack', data.stack);
}

io.on('connection', async client => {
    logger.debug('client connected', client.id);
    const user = {
        id: client.id,
        name: null,
        inGame: null,
        inRoom: null,
    };
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

    client.on('send:message', (msg, callback=noop) => {
        logger.debug('received message', client.id, msg);
        client.to(user.inRoom).emit('message', {userName: user.name, text: msg});
        // client.emit('message', 'accepted');
        callback({ok: true});
    });

    client.on('join', (room, game, callback) => clientJoinRoom(client, user, room, game, callback));

    client.on('ioLogger', data => ioLogger(Object.assign({}, data, {user})));

    clientJoinRoom(client, user, 'lobby', 'lobby');

    client.on('disconnect', () => {
        client.to(user.inRoom).emit('message', {userName: 'system', text: `${user.name} disconnected`});
        client.to(user.inRoom).emit('user:leave', user);
        // remove client user from allUsers
        allUsers.find((item, idx, arr) => {
            if (item.id === user.id) {
                return arr.splice(idx, 1);
            }
            return false;
        });
    });

    client.emit('set', {
        user: user,
        // rooms: games[user.inGame].rooms,
        games: staticGames,
        users: getUsersInRoom(user.room),
    });
});

io.listen(3001);
