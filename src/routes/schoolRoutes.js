const express = require('express');
const schoolController = require('../controllers/schoolController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/schools/onboard', asyncHandler(schoolController.showOnboardingForm));
router.post('/schools/onboard', asyncHandler(schoolController.submitOnboardingForm));

module.exports = router;
