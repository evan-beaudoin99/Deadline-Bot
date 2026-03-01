const courseService = require('../services/courseService');
const pdfService = require('../services/pdfService');
const subscriptionService = require('../services/subscriptionService');
const pythonService = require('../services/pythonService');
const userRepository = require('../repositories/userRepository');
const { clearAlert, SESSION_LOST_MESSAGE } = require('../services/sessionService');

async function home(req, res) {
  let courses = [];

  if (req.session.user) {
    req.session.user.pdfs = await userRepository.getUserPdfs(req.session.user.id);
    courses = await userRepository.getUserCourses(req.session.user.id);
    req.session.user.courses = courses;
  }

  return res.render('home', { courses });
}

async function showAddCourse(req, res) {
  const message = clearAlert(req);
  return res.render('addCourse', { alertMessage: message });
}

async function getData(req, res) {
  if (!req.session.user) {
    return res.render('login', { alertMessage: SESSION_LOST_MESSAGE });
  }

  const result = await courseService.getCourseData(req.session.user.id);

  if (!result.success) {
    return res.render('home', { alertMessage: result.message });
  }

  let courses = result.courses;
  if (req.query.courseId) {
    courses = result.courses.filter((course) => `${course._id}` === `${req.query.courseId}`);
  }

  return res.render('summary', { courses });
}

async function summarize(req, res) {
  const summaryInfo = {
    user_id: req.session.user.id,
    pdf_id: req.body.pdf_id
  };

  try {
    await pythonService.summarize(summaryInfo);
    return res.render('home', { alertMessage: 'Finished Processing Course Data', success: true });
  } catch {
    return res.render('home', { alertMessage: 'Summary extraction failed.', success: false });
  }
}

async function removePdf(req, res) {
  const { pdfId } = req.body;
  await pdfService.removePdf(req.session.user.id, pdfId);

  req.session.user.pdfs = await userRepository.getUserPdfs(req.session.user.id);
  return res.send('Success');
}

async function addCourse(req, res) {
  if (!req.session.user) {
    req.session.alert = SESSION_LOST_MESSAGE;
    return res.redirect('/login');
  }

  if (!req.file) {
    req.session.alert = 'Please upload one course document before adding the course.';
    return res.redirect('/addCourse');
  }

  const pdfResult = await pdfService.uploadPdf(req.session.user.id, req.file);
  if (!pdfResult.success) {
    req.session.alert = pdfResult.message;
    return res.redirect('/addCourse');
  }

  const result = await courseService.createCourse(req.session.user.id, {
    ...req.body,
    pdfId: pdfResult.pdf._id
  });

  if (!result.success) {
    await pdfService.removePdf(req.session.user.id, pdfResult.pdf._id);
    req.session.alert = result.message;
    return res.redirect('/addCourse');
  }

  const summaryInfo = {
    user_id: req.session.user.id,
    pdf_id: pdfResult.pdf._id,
    course_id: result.course._id,
    course_metadata: {
      course_code: result.course.course_code,
      course_name: result.course.course_name,
      section: result.course.section
    }
  };

  pythonService.startCourseSummary(summaryInfo).catch((error) => {
    console.error('Background summary processing failed', error);
  });

  return res.redirect('/');
}

async function subscribe(req, res) {
  const subscribed = await subscriptionService.subscribe(req.session.user.id);
  if (!subscribed.success) {
    return res.render('home', { alertMessage: subscribed.message });
  }

  return res.send('Subscribed');
}

async function getCourseStatuses(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const statuses = await courseService.getCourseStatuses(req.session.user.id);
  return res.json(statuses);
}

async function removeCourse(req, res) {
  if (!req.session.user) {
    req.session.alert = SESSION_LOST_MESSAGE;
    return res.redirect('/login');
  }

  const { courseId, redirectTo } = req.body;
  if (!courseId) {
    req.session.alert = 'Course id is required.';
    return res.redirect('/');
  }

  const result = await courseService.removeCourse(req.session.user.id, courseId);
  req.session.alert = result.message;

  const safeRedirect = redirectTo === '/data' ? '/data' : '/';
  return res.redirect(safeRedirect);
}

async function retryCourseSummary(req, res) {
  if (!req.session.user) {
    req.session.alert = SESSION_LOST_MESSAGE;
    return res.redirect('/login');
  }

  const { courseId } = req.body;
  if (!courseId) {
    req.session.alert = 'Course id is required.';
    return res.redirect('/');
  }

  const retryResult = await courseService.prepareSummaryRetry(req.session.user.id, courseId);
  if (!retryResult.success) {
    req.session.alert = retryResult.message;
    return res.redirect('/');
  }

  pythonService.startCourseSummary(retryResult.summaryInfo).catch((error) => {
    console.error('Retry summary processing failed', error);
  });

  req.session.alert = 'Summary retry started. Processing in background...';
  return res.redirect('/');
}

module.exports = {
  home,
  showAddCourse,
  getData,
  summarize,
  removePdf,
  addCourse,
  getCourseStatuses,
  removeCourse,
  retryCourseSummary,
  subscribe
};
