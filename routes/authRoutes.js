const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/authController');

// LOGIN ROUTE
router.post('/login', loginAdmin);

// TEST ROUTE (debug ke liye)
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working' });
});

module.exports = router;