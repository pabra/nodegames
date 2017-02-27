import Logger from 'js-logger';

let socket = null;

const consoleHandler = Logger.createDefaultHandler({
    formatter: (messages, context) => messages.unshift(new Date().toUTCString()),
});

const sendHandler = (messages, context) => {
    if (context.level.name !== 'ERROR') {
        return;
    }

    const err = new Error();
    const stack = err && err.stack;
    const userAgent = navigator && navigator.userAgent;

    const data = {
        text: messages[0],
        context: context,
        stack: stack,
        userAgent: userAgent,
    };

    window.console.log('data', data);
    if (socket) {
        socket.emit('ioLogger', data);
    }
};

Logger.setLevel(Logger.DEBUG);

Logger.setHandler((messages, context) => {
    consoleHandler(messages, context);
    sendHandler(messages, context);
});

export {Logger};

export function setSocket(sock) {
    if (socket !== null) {
        throw new Error('socket already set');
    }
    socket = sock;
}
