const Course = require('../../models/Course');

async function findByCodeAndSection(courseCode, section, uploadedBy) {
  return Course.findOne({ course_code: courseCode, section, uploadedBy });
}

async function createCourse(courseData) {
  return Course.create(courseData);
}

async function findByIdForUser(courseId, uploadedBy) {
  return Course.findOne({ _id: courseId, uploadedBy });
}

async function deleteById(courseId, uploadedBy) {
  return Course.deleteOne({ _id: courseId, uploadedBy });
}

async function getCourseStatusesForUser(uploadedBy) {
  return Course.find({ uploadedBy })
    .select('_id course_code course_name summaryStatus summaryError')
    .sort({ createdAt: -1 })
    .lean();
}

async function markSummaryCompleted(courseId, summaryData) {
  return Course.findByIdAndUpdate(
    courseId,
    {
      $set: {
        course_name: summaryData.course_name,
        professor: summaryData.professor,
        professor_email: summaryData.professor_email,
        dates: summaryData.dates,
        summaryStatus: 'completed',
        summaryCompletedAt: new Date(),
        summaryError: null
      }
    },
    { new: true }
  );
}

async function markSummaryFailed(courseId, message) {
  return Course.findByIdAndUpdate(
    courseId,
    {
      $set: {
        summaryStatus: 'failed',
        summaryError: `${message || 'Summary processing failed'}`
      }
    },
    { new: true }
  );
}

async function markSummaryProcessing(courseId) {
  return Course.findByIdAndUpdate(
    courseId,
    {
      $set: {
        summaryStatus: 'processing',
        summaryRequestedAt: new Date(),
        summaryCompletedAt: null,
        summaryError: null
      }
    },
    { new: true }
  );
}

async function deleteByPdf(pdfId) {
  return Course.deleteOne({ pdfs: pdfId });
}

module.exports = {
  findByCodeAndSection,
  createCourse,
  findByIdForUser,
  deleteById,
  getCourseStatusesForUser,
  markSummaryCompleted,
  markSummaryFailed,
  markSummaryProcessing,
  deleteByPdf
};
