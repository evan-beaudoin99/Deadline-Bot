const executePython = require('../../helpers/executePython');
const courseService = require('./courseService');

function countExtractedDates(summaryData) {
  const dates = summaryData?.dates || {};
  const assignments = Array.isArray(dates.assignments) ? dates.assignments.length : 0;
  const tests = Array.isArray(dates.tests) ? dates.tests.length : 0;
  const tutorials = Array.isArray(dates.tutorials) ? dates.tutorials.length : 0;
  return assignments + tests + tutorials;
}

function normalizeSummaryData(summaryInfo, extractedSummary) {
  const courseMetadata = summaryInfo?.course_metadata || {};
  const extractedDates = extractedSummary?.dates || {};

  return {
    course_name:
      extractedSummary?.course_name ||
      courseMetadata.course_name ||
      courseMetadata.course_code ||
      'Course',
    professor: extractedSummary?.professor || '',
    professor_email: extractedSummary?.professor_email || '',
    dates: {
      assignments: Array.isArray(extractedDates.assignments) ? extractedDates.assignments : [],
      tests: Array.isArray(extractedDates.tests) ? extractedDates.tests : [],
      tutorials: Array.isArray(extractedDates.tutorials) ? extractedDates.tutorials : []
    }
  };
}

async function summarize(summaryInfo) {
  return executePython.summarize(summaryInfo);
}

async function processCourseSummary(summaryInfo) {
  const extractedSummary = await summarize(summaryInfo);
  const normalizedSummary = normalizeSummaryData(summaryInfo, extractedSummary);
  const extractedDateCount = countExtractedDates(normalizedSummary);

  if (extractedDateCount === 0) {
    throw new Error('No date entries were extracted from the uploaded course document.');
  }

  await courseService.markSummaryCompleted(summaryInfo.course_id, normalizedSummary);
  return normalizedSummary;
}

async function startCourseSummary(summaryInfo) {
  try {
    return await processCourseSummary(summaryInfo);
  } catch (error) {
    if (summaryInfo?.course_id) {
      await courseService.markSummaryFailed(summaryInfo.course_id, error.message);
    }

    throw error;
  }
}

module.exports = {
  summarize,
  processCourseSummary,
  startCourseSummary
};
