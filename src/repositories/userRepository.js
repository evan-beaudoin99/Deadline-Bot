const User = require('../../models/User');

async function findById(id) {
  return User.findById(id);
}

async function findByUsername(username) {
  return User.findOne({ username });
}

async function createUser(userData) {
  const user = new User(userData);
  await user.save();
  return user;
}

async function addPdfToUser(userId, pdfId) {
  return User.findByIdAndUpdate(userId, { $addToSet: { pdfs: pdfId } });
}

async function removePdfFromUser(userId, pdfId) {
  return User.updateOne({ _id: userId }, { $pull: { pdfs: pdfId } });
}

async function addCourseToUser(userId, courseId) {
  return User.findByIdAndUpdate(userId, { $addToSet: { courses: courseId } });
}

async function removeCourseFromUser(userId, courseId) {
  return User.updateOne({ _id: userId }, { $pull: { courses: courseId } });
}

async function setSubscribed(userId, subscribed) {
  return User.findByIdAndUpdate(userId, { subscribed }, { new: true });
}

async function getUserPdfs(userId) {
  const user = await User.findById(userId).populate('pdfs', 'filename');
  return user ? user.pdfs : null;
}

async function getUserCourses(userId) {
  const user = await User.findById(userId).populate('courses');
  return user ? user.courses : null;
}

module.exports = {
  findById,
  findByUsername,
  createUser,
  addPdfToUser,
  removePdfFromUser,
  addCourseToUser,
  removeCourseFromUser,
  setSubscribed,
  getUserPdfs,
  getUserCourses
};
