const express = require('express');
const { getStats } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/stats', getStats);

module.exports = router;
