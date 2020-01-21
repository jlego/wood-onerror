/**
 * Wood Plugin Module.
 * 捕获异常
 * by jlego on 2018-11-24
 */
const cluster = require('cluster');
const woodError = require('wood-error');
const { Log, Util, error } = WOOD;

module.exports = (app = {}, config = {}) => {
  // 返回错误信息
  app.application.use(function (err, req, res, next) {
    if (err) {
      res.status(err.status || 500);
      let body = Util.getParams(req);
      if (process.env.NODE_ENV && process.env.NODE_ENV === 'develope') console.log(err.stack || JSON.stringify(err));
      if (!(err instanceof woodError.NoLogError)) {
        Log.error(`path: ${req.path}, data: ${JSON.stringify(body.data)}, error:${err.stack || JSON.stringify(err)}`);
      }
      if (err instanceof woodError.NotExposeError) err.message = '服务器繁忙';
      if(res.print) {
        res.print(app.error(err));
      }else{
        res.json(app.error(err));
      }
      return;
    }
  });

  // 拦截其他异常
  process.on('uncaughtException', (err) => {
    console.log('Caught exception: ', err);
    try {
      let killTimer = setTimeout(function () {
        process.exit(1);
      }, 30000);
      killTimer.unref();

      if (cluster.worker) {
        cluster.worker.disconnect();
      }
    } catch (e) {
      console.log('error when exit', e.stack);
    }
  });

  process.on('unhandledRejection', (reason, p) => {
    // 记录日志、抛出错误、或其他逻辑。
    Log.error(`未处理的 rejection: ${reason.stack}`);
  });
  
  return app;
}
