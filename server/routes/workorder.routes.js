const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth.middleware');
const { sendToMonday } = require('../services/monday.service');
const { extractDataFromPDF } = require('../services/pdf.service');
const { getDatabase } = require('../db/database');

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `workorder_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// GET /api/workorders - Get all work orders
router.get('/', authenticateToken, (req, res) => {
    const db = getDatabase();

    db.all(
        'SELECT * FROM workorders WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ workorders: rows });
        }
    );
});

// POST /api/workorders - Create new work order
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { project, wo, po, state, status, date, pm, notes } = req.body;

        if (!project || !wo) {
            return res.status(400).json({ error: 'Project and WO# are required' });
        }

        const workOrderData = { project, wo, po, state, status, date, pm, notes };

        // IMPORTANT: Send to Monday.com FIRST
        // If this fails, we don't save to database
        try {
            await sendToMonday(workOrderData);
        } catch (mondayError) {
            console.error('Monday.com API error:', mondayError);
            return res.status(500).json({
                error: 'Failed to send to Monday.com: ' + (mondayError.message || 'Unknown error'),
                details: mondayError.response?.data || mondayError.message
            });
        }

        // Only save to database if Monday.com succeeded
        const db = getDatabase();
        db.run(
            'INSERT INTO workorders (project, wo, po, state, status, date, pm, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [project, wo, po, state, status, date, pm, notes, req.user.id],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({
                    message: 'Work order created successfully',
                    id: this.lastID,
                    workorder: workOrderData
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/workorders/upload - Upload PDF and extract data
router.post('/upload', authenticateToken, upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'PDF file is required' });
        }

        const pdfPath = req.file.path;

        // Extract data from PDF
        const rawData = await extractDataFromPDF(pdfPath);

        // Send to Monday.com
        await sendToMonday(rawData);

        // Save to database
        const db = getDatabase();
        db.run(
            'INSERT INTO workorders (project, wo, po, state, pm, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [rawData.project, rawData.wo, rawData.po, rawData.state, rawData.pm, rawData.notes, req.user.id],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Clean up uploaded file
                fs.unlinkSync(pdfPath);

                res.status(201).json({
                    message: 'Work order extracted and created successfully',
                    id: this.lastID,
                    workorder: rawData
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/workorders/:id - Get specific work order
router.get('/:id', authenticateToken, (req, res) => {
    const db = getDatabase();

    db.get(
        'SELECT * FROM workorders WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'Work order not found' });
            }
            res.json({ workorder: row });
        }
    );
});

module.exports = router;
