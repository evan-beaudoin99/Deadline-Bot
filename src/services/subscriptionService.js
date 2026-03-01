const userRepository = require('../repositories/userRepository');

async function subscribe(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    return { success: false, message: 'Could not find user with id' };
  }

  if (user.subscribed) {
    return { success: false, message: 'User already Subscribed' };
  }

  await userRepository.setSubscribed(userId, true);
  return { success: true, message: 'You just Subscribed!' };
}

module.exports = { subscribe };
