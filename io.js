const io = require('socket.io')();
const logger = require('./lib/logger');
const locker = require('./lib/locker');

const noop = (() => {});
const allUsers = [];
const channels = {
    lobby: {
        name: 'Lobby',
        isLobby: true,
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

const channelKeys = Object.keys(channels);
const staticChannels = {};

// make a static copy of channels suitable for clients (no rooms)
for (let gk of channelKeys) {
    channels.lobby.rooms.push(gk);
    staticChannels[gk] = {};
    for (let k in channels[gk]) {
        if (!(channels[gk].hasOwnProperty(k))) continue;
        if (k === 'rooms') continue;

        staticChannels[gk][k] = channels[gk][k];
    }
}


/**
 * __isUserNameAvailable - check if given name is currently not used
 *
 * do not call directly - global allUsers should be locked
 *
 * @param  {string} name    name to check
 * @return {bool}           given name is availabel
 */
function __isUserNameAvailable(name) {
    return !allUsers.some(user => {
        return user.name === name;
    });
}


/**
 * __getGuestName - generate a name for a new user
 *
 * do not call directly - global allUsers should be locked
 *
 * @return {string} available user name
 */
function __getGuestName() {
    const prefix = 'Guest';
    const maxTry = 100;
    let testName = prefix;
    for (let i = 1; i <= maxTry; i++) {
        testName = `${prefix}${i}`;
        if (__isUserNameAvailable(testName)) {
            return testName;
        }
    }
    throw new Error('could not get guest name');
}

function getUsersInRoom(room) {
    return allUsers.filter(user => user.inRoom === room);
}

function clientLeaveRoom(client, user) {
    const room = user.inRoom;
    if (!room) return;

    client.leave(room);
    user.inRoom = null;
    const usersInRoom = getUsersInRoom(room);
    if (!channels[user.inChannel].isLobby && usersInRoom.length === 0) {
        // remove room from room list of channel
        channels[user.inChannel].rooms.filter((item, idx, arr) => {
            if (item === room) {
                return arr.splice(idx, 1);
            }
            return false;
        });
        client.to(user.inChannel).emit('set', {rooms: channels[user.inChannel].rooms});
    } else {
        client.to(room).emit('set', {users: usersInRoom});
        client.to(room).emit('message', {userName: 'system', text: `${user.name} left`});
    }
}

function clientJoinRoom(client, user, room, channel, callback=noop) {
    if (!channelKeys.includes(channel)) {
        callback({ok: false, text: `unknown channel: "${channel}"`});
        return;
    }

    if (room === null) {
        if (channels[channel].isLobby) {
            callback({ok: false, text: `cannot create new room in lobby channel: "${channel}"`});
            return;
        }
    } else if (!channels[channel].rooms.includes(room)) {
        callback({ok: false, text: `unknown room: "${room}"`});
        return;
    }

    if (channels[channel].isLobby && !channelKeys.includes(room)) {
        callback({ok: false, text: `room "${room}" in channel "${channel}" has no own channel`});
        return;
    }

    if (room === user.inRoom) {
        callback({ok: false, text: 'already in room'});
        return;
    }

    if (room === null) {
        const now = new Date().getTime();
        room = `${channel}:${user.id}:${now}`;
        channels[channel].rooms.push(room);
        logger.debug('creating new room', room, 'in channel', channel);
        client.to(channel).emit('set', {rooms: channels[channel].rooms});
    }

    clientLeaveRoom(client, user);

    client.join(room);
    user.inChannel = channel;
    user.inRoom = room;
    const usersInRoom = getUsersInRoom(room);
    client.to(room).emit('message', {userName: 'system', text: `${user.name} joined`});
    client.to(room).emit('set', {users: usersInRoom});

    let showChannel;
    let showRooms;

    if (channels[channel].isLobby) {
        showChannel = room;
        showRooms = channels[room].rooms;
    } else {
        showChannel = channel;
        showRooms = channels[channel].rooms;
    }

    callback({
        ok: true,
        user: user,
        channel: showChannel,
        rooms: showRooms,
        users: usersInRoom,
    });
}


/**
 * ioLogger - log errors from clients
 *
 * TODO: all
 *
 * @param  {object} data
 */
function ioLogger(data) {
    console.log('data', data);
    logger.debug('data.stack', data.stack);
}

io.on('connection', async client => {
    logger.debug('client connected', client.id);
    const user = {
        id: client.id,
        name: null,
        inChannel: null,
        inRoom: null,
    };
    try {
        const lock = await locker(allUsers);
        user.name = __getGuestName();

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

    client.on('join', (room, channel, callback) => clientJoinRoom(client, user, room, channel, callback));

    client.on('ioLogger', data => ioLogger(Object.assign({}, data, {user})));

    clientJoinRoom(client, user, 'lobby', 'lobby', data => {
        if (!data.ok) return;
        data.channels = staticChannels;
        client.emit('set', data);
    });

    client.on('disconnect', () => {
        clientLeaveRoom(client, user);

        // remove client user from allUsers
        allUsers.find((item, idx, arr) => {
            if (item.id === user.id) {
                return arr.splice(idx, 1);
            }
            return false;
        });
    });
});

io.listen(3001);
