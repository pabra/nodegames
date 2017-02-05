const Koa = require('koa');
const Router = require('koa-router');
const routes = require('./lib/routes');
const middlewares = require('./lib/middlewares');

const app = new Koa();
const router = new Router();

app.use(middlewares.requestLogger);

router.get('/', routes.index);

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);
