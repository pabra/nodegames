const Koa = require('koa');
const IO = require( 'socket.io' );
const Router = require('koa-router');
const routes = require('./lib/routes');
const middlewares = require('./lib/middlewares');

const app = new Koa();
const io = new IO();
const router = new Router();

app.use(middlewares.requestLogger);

router.get('/', routes.index);

app
    .use(router.routes())
    .use(router.allowedMethods());

io.attach(app);

const channels = [
    'TicTacToe',
    'another',
];

io.on( 'connection', sock => {
    sock.join('lobby');
    console.log('joined to lobby', sock.id);
    sock.to('lobby').emit('message', 'joined to lobby', 'test');
    setTimeout(() => {
        console.log('1sec timeout');
        const s = sock.to('lobby');
        s.emit('message', 'message 1sec timeout');
        // s.broadcast('message', 'message 1sec timeout');
    }, 1000);
    sock.to('lobby').on('send:message', txt => {
        console.log('recived message:', txt);
        sock.to('lobby').emit('message', txt);
    });
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
}, 5000);

// io.on( 'join', ( ctx, data ) => {
//     console.log('join event fired', data, ctx);
//     io.broadcast('message', 'return test');
// });

app.listen(3001);
