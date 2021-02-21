const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const subscribers = {};

function subscribe(on, handler) {
  if (subscribers[on]) {
    subscribers[on] = [...subscribers[on], handler];
    return;
  }
  subscribers[on] = [handler];
}

function emit(event, msg) {
  if (subscribers[event]) {
    subscribers[event].forEach((h) => h(msg));
    delete subscribers[event];
  }
}

router.get(
    '/subscribe',
    async (ctx, next) => {
      ctx.body = await new Promise((res) => subscribe('message', res));
      next();
    });

router.post('/publish', async (ctx, next) => {
  const {message} = ctx.request.body;
  if (message) {
    emit('message', message);
  }
  ctx.body = message;
  next();
});

app.use(router.routes());

module.exports = app;
