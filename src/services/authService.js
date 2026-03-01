const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');

const SALT_ROUNDS = 10;

async function registerUser(payload) {
  const existingUser = await userRepository.findByUsername(payload.username);
  if (existingUser) {
    return { success: false, message: 'User Already Exists' };
  }

  const hashedPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);
  const user = await userRepository.createUser({ ...payload, password: hashedPassword });

  return { success: true, user, message: 'User Created!' };
}

async function loginUser(username, password) {
  const user = await userRepository.findByUsername(username);

  if (!user) {
    return { success: false, message: 'User does not exist or Invalid Username' };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return { success: false, message: 'Invalid Password' };
  }

  const pdfs = await userRepository.getUserPdfs(user._id);
  const courses = await userRepository.getUserCourses(user._id);

  return {
    success: true,
    message: 'Logged In!',
    user,
    pdfs: pdfs || [],
    courses: courses || []
  };
}

module.exports = {
  registerUser,
  loginUser
};
