const env = require('./config/env');
const { connectDatabase } = require('./config/database');
const { createApp } = require('./app');

async function startServer() {
  await connectDatabase();
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Listening on port ${env.PORT}`);
  });
}

module.exports = { startServer };
