const express = require('express');
const appController = require('../controllers/appController');
const { asyncHandler } = require('../utils/asyncHandler');
const upload = require('../../helpers/getData');

const router = express.Router();

router.get('/', asyncHandler(appController.home));
router.get('/addcourse', asyncHandler(appController.showAddCourse));
router.get('/data', asyncHandler(appController.getData));
router.get('/courses/status', asyncHandler(appController.getCourseStatuses));
router.post('/courses/remove', asyncHandler(appController.removeCourse));
router.post('/courses/retry-summary', asyncHandler(appController.retryCourseSummary));
router.post('/summarize', asyncHandler(appController.summarize));
router.post('/remove-pdf', asyncHandler(appController.removePdf));
router.post('/addcourse', upload.single('pdf'), asyncHandler(appController.addCourse));
router.post('/subscribe', asyncHandler(appController.subscribe));

module.exports = router;
