const express = require('express');
const multer = require('multer');
const path = require('path');
const { analyzeResume, getHistory, deleteHistoryItem, getScanDetail, optimizeResume } = require('../controllers/resumeController');
const { conductMockInterview } = require('../controllers/mockInterviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer Config - Using memoryStorage for production stability (works on Vercel/Render)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: process.env.MAX_FILE_SIZE || 5242880 },
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Only PDF and Word documents are supported!');
        }
    }
});

router.post('/analyze', protect, upload.single('resume'), analyzeResume);
router.post('/optimize', protect, optimizeResume);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getScanDetail);
router.post('/mock-interview/:id', protect, conductMockInterview);
router.delete('/:id', protect, deleteHistoryItem);

module.exports = router;
