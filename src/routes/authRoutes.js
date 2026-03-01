const express = require('express');
const authController = require('../controllers/authController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/login', asyncHandler(authController.showLogin));
router.get('/register', asyncHandler(authController.showRegister));
router.post('/login', asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register));
router.get('/logout', asyncHandler(authController.logout));

module.exports = router;
