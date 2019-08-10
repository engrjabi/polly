import websockify from "koa-websocket";
import Koa from "koa";
import route from "koa-route";
import send from "koa-send";
import opn from "opn";

export const localServerNotifier = (port = "3069") => {
  const app = websockify(new Koa());
  app.ws.use((ctx, next) => next(ctx));
  app.use(
    route.all("/", async ctx => {
      await send(ctx, "./public/index.html");
    })
  );
  app.ws.use(
    route.all("/ws", function(ctx) {
      ctx.websocket.send("Hello World");
      ctx.websocket.on("message", function(message) {
        console.log(message);
      });
    })
  );

  opn("http://localhost:3069");
  app.listen(port);
};
