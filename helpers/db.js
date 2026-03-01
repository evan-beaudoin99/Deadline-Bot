const { connectDatabase } = require('../src/config/database');
const authService = require('../src/services/authService');
const pdfService = require('../src/services/pdfService');
const courseService = require('../src/services/courseService');
const subscriptionService = require('../src/services/subscriptionService');
const schoolRepository = require('../src/repositories/schoolRepository');
const userRepository = require('../src/repositories/userRepository');

async function startServer() {
  return connectDatabase();
}

async function createUser(newUser) {
  const result = await authService.registerUser(newUser);
  return {
    user: result.user,
    message: result.message,
    success: result.success
  };
}

async function authenticateUser(user) {
  const result = await authService.loginUser(user.username, user.password);
  return {
    user: result.user,
    message: result.message,
    success: result.success
  };
}

async function uploadPDF(userId, file) {
  const result = await pdfService.uploadPdf(userId, file);
  return {
    newPdf: result.pdf,
    message: result.message,
    success: result.success
  };
}

async function removePdf(userId, pdfId) {
  return pdfService.removePdf(userId, pdfId);
}

async function createCourse(userId, courseInfo) {
  return courseService.createCourse(userId, courseInfo);
}

async function getCourseData(userId) {
  return courseService.getCourseData(userId);
}

async function getPDFs(id) {
  return userRepository.getUserPdfs(id);
}

async function getCourses(id) {
  return userRepository.getUserCourses(id);
}

async function subscribe(userId) {
  return subscriptionService.subscribe(userId);
}

async function insertSchool(schoolData) {
  return schoolRepository.insertSchool(schoolData);
}

module.exports = {
  startServer,
  createUser,
  authenticateUser,
  uploadPDF,
  getCourseData,
  getPDFs,
  removePdf,
  subscribe,
  insertSchool,
  getCourses,
  createCourse
};