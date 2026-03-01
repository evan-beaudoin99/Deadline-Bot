const express = require('express');
const env = require('./config/env');
const { createSessionMiddleware } = require('./config/session');
const { sessionContext } = require('./middleware/sessionContext');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.set('view engine', 'pug');
  app.set('views', env.VIEWS_PATH);

  app.use(express.static(env.CLIENT_PATH));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(createSessionMiddleware());
  app.use(sessionContext);

  app.use(routes);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
