const ResumeScan = require('../models/ResumeScan');
const { extractText } = require('../utils/textExtractor');
const { getAnalysisPrompt } = require('../prompts/analysisPrompt');
const { getOptimizationPrompt } = require('../prompts/optimizationPrompt');
const Groq = require('groq-sdk');
const fs = require('fs');

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// @desc    Upload and Analyze Resume
// @route   POST /api/resume/analyze
exports.analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ message: 'Job description is required' });
        }

        // 1. Extract Text
        const extractedText = await extractText(req.file);

        // 2. AI Analysis via Groq
        const prompt = getAnalysisPrompt(extractedText, jobDescription);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a professional ATS resume analyzer. Output strictly valid JSON." },
                { role: "user", content: prompt }
            ],
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        let analysis;
        try {
            analysis = JSON.parse(chatCompletion.choices[0].message.content);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.log("Raw Content:", chatCompletion.choices[0].message.content);
            throw new Error("AI returned invalid data format. Please try again.");
        }

        // 3. Normalize Data (Defense against AI inconsistencies)
        if (analysis.interviewPrep && Array.isArray(analysis.interviewPrep)) {
            analysis.interviewPrep = analysis.interviewPrep.map(item => ({
                ...item,
                type: item.type && item.type.toLowerCase().includes('tech') ? 'Technical' : 'Behavioral'
            }));
        }

        // 4. Save to History
        const scan = new ResumeScan({
            userId: req.user._id,
            resumeName: req.file.originalname,
            jobDescription,
            extractedText,
            ...analysis
        });

        await scan.save();
        console.log("Scan saved successfully with Groq");

        res.status(200).json(scan);

        // Cleanup
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    } catch (error) {
        console.error("Analysis Error Details:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        // Return a cleaner error message but log the full error
        res.status(500).json({
            message: error.message || 'An internal error occurred during analysis.',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Optimize Resume specifically
// @route   POST /api/resume/optimize
exports.optimizeResume = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        if (!resumeText || !jobDescription) {
            return res.status(400).json({ message: 'Resume text and job description are required' });
        }

        const prompt = getOptimizationPrompt(resumeText, jobDescription);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a professional resume optimizer. Output strictly valid JSON." },
                { role: "user", content: prompt }
            ],
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const optimization = JSON.parse(chatCompletion.choices[0].message.content);
        res.json(optimization);
    } catch (error) {
        console.error("Groq Optimization Error:", error);
        res.status(500).json({ message: 'AI error during optimization.' });
    }
};

// @desc    Get History
// @route   GET /api/resume/history
exports.getHistory = async (req, res) => {
    try {
        const history = await ResumeScan.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete History Item
// @route   DELETE /api/resume/:id
exports.deleteHistoryItem = async (req, res) => {
    try {
        const scan = await ResumeScan.findById(req.params.id);
        if (!scan) return res.status(404).json({ message: 'Scan not found' });

        if (scan.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await scan.deleteOne();
        res.json({ message: 'Scan removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Scan Detail
// @route   GET /api/resume/:id
exports.getScanDetail = async (req, res) => {
    try {
        const scan = await ResumeScan.findById(req.params.id);
        if (!scan) return res.status(404).json({ message: 'Scan not found' });

        if (scan.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        res.json(scan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
