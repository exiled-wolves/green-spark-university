const express              = require('express');
const router               = express.Router();
const { login,
        changePassword,
        getMe }            = require('../controllers/authController');
const { verifyToken }      = require('../middleware/auth');

// Public
router.post('/login',           login);

// Protected — student & lecturer only (Rule 2, 4, 5)
router.post('/change-password', verifyToken, changePassword);

// Protected — any authenticated user
router.get('/me',               verifyToken, getMe);

module.exports = router;