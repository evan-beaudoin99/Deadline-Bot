const express = require('express');
const authRoutes = require('./authRoutes');
const appRoutes = require('./appRoutes');
const schoolRoutes = require('./schoolRoutes');

const router = express.Router();

router.use('/', schoolRoutes);
router.use('/', authRoutes);
router.use('/', appRoutes);

module.exports = router;
