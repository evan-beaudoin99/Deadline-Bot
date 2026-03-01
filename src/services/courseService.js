const mongoose = require('mongoose');
const courseRepository = require('../repositories/courseRepository');
const userRepository = require('../repositories/userRepository');
const pdfRepository = require('../repositories/pdfRepository');

async function getCourseData(userId) {
  const courses = await userRepository.getUserCourses(userId);

  if (!courses) {
    return { success: false, message: 'Could not find user with id' };
  }

  if (courses.length === 0) {
    return { success: false, message: 'User has no Course Data' };
  }

  return { success: true, courses, message: 'All Course Data Here' };
}

async function createCourse(userId, courseInfo) {
  const existingCourse = await courseRepository.findByCodeAndSection(
    courseInfo.course_code,
    courseInfo.section || 'A',
    userId
  );

  if (existingCourse) {
    return { success: false, message: 'Course Already Exists' };
  }

  if (!courseInfo.pdfId) {
    return {
      success: false,
      message: 'Please upload one course document before adding the course.'
    };
  }

  const pdfIds = [new mongoose.Types.ObjectId(courseInfo.pdfId)];

  const course = await courseRepository.createCourse({
    course_code: courseInfo.course_code,
    course_name: courseInfo.course_name,
    section: courseInfo.section || 'A',
    summaryStatus: 'processing',
    summaryRequestedAt: new Date(),
    uploadedBy: userId,
    pdfs: pdfIds
  });

  await userRepository.addCourseToUser(userId, course._id);

  return { success: true, message: 'Successfully added course', course };
}

async function getCourseStatuses(userId) {
  const courses = await courseRepository.getCourseStatusesForUser(userId);
  return {
    success: true,
    courses
  };
}

async function markSummaryCompleted(courseId, summaryData) {
  return courseRepository.markSummaryCompleted(courseId, summaryData);
}

async function markSummaryFailed(courseId, message) {
  return courseRepository.markSummaryFailed(courseId, message);
}

async function prepareSummaryRetry(userId, courseId) {
  const course = await courseRepository.findByIdForUser(courseId, userId);

  if (!course) {
    return { success: false, message: 'Course not found.' };
  }

  const pdfId = Array.isArray(course.pdfs) && course.pdfs.length > 0 ? course.pdfs[0] : null;
  if (!pdfId) {
    return { success: false, message: 'No course document found to retry summary.' };
  }

  await courseRepository.markSummaryProcessing(course._id);

  return {
    success: true,
    summaryInfo: {
      user_id: userId,
      pdf_id: pdfId,
      course_id: course._id,
      course_metadata: {
        course_code: course.course_code,
        course_name: course.course_name,
        section: course.section || 'A'
      }
    }
  };
}

async function removeCourse(userId, courseId) {
  const course = await courseRepository.findByIdForUser(courseId, userId);
  if (!course) {
    return { success: false, message: 'Course not found.' };
  }

  const pdfIds = Array.isArray(course.pdfs) ? course.pdfs : [];

  for (const pdfId of pdfIds) {
    await pdfRepository.deletePdfById(pdfId);
    await userRepository.removePdfFromUser(userId, pdfId);
  }

  await courseRepository.deleteById(courseId, userId);
  await userRepository.removeCourseFromUser(userId, courseId);

  return { success: true, message: 'Course removed successfully.' };
}

module.exports = {
  getCourseData,
  createCourse,
  getCourseStatuses,
  markSummaryCompleted,
  markSummaryFailed,
  prepareSummaryRetry,
  removeCourse
};
