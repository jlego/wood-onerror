/**
 * Wood Plugin Module.
 * 捕获异常
 * by jlego on 2018-11-24
 */
const cluster = require('cluster');
const { catchErr, error } = WOOD;

module.exports = (app = {}, config = {}) => {
  // 返回错误信息
  app.application.use(function (err, req, res, next) {
    if (err) {
      res.status(err.status || 500);
      if(res.print) {
        res.print(error(err));
      }else{
        res.json(error(err));
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
  return app;
}
