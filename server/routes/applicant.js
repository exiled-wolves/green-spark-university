const express                              = require('express');
const router                               = express.Router();
const { submitApplication,
        getDepartments }                   = require('../controllers/applicantController');
const upload                               = require('../middleware/upload');

// Public — no JWT needed (Rule 1)
router.get('/departments',  getDepartments);

// multipart/form-data because of passport photo upload (Rule 1)
router.post('/', upload.single('passport_photo'), submitApplication);

module.exports = router;