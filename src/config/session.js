const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const env = require('./env');

function createSessionMiddleware() {
  return session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: env.MONGO_URL,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'interval',
      autoRemoveInterval: 10
    })
  });
}

module.exports = { createSessionMiddleware };
