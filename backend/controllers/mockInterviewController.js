const ResumeScan = require('../models/ResumeScan');
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// @desc    Conduct Mock Interview turn
// @route   POST /api/resume/mock-interview/:id
exports.conductMockInterview = async (req, res) => {
    try {
        const { messages } = req.body; // Array of chat messages
        const scan = await ResumeScan.findById(req.params.id);

        if (!scan) {
            return res.status(404).json({ message: 'Analysis not found' });
        }

        if (scan.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const systemPrompt = `
You are an expert technical recruiter and hiring manager. Your goal is to conduct a professional mock interview for a candidate.

Context:
- Candidate Resume: ${scan.extractedText}
- Job Description: ${scan.jobDescription}

Instructions:
1. Be professional, encouraging, but rigorous.
2. Ask one question at a time.
3. If the user provides an answer, provide brief feedback and then ask a follow-up or a new question.
4. Use the candidate's actual experience from their resume to tailor the technical questions.
5. Include a mix of behavioral (STAR method) and technical questions.
6. If the interview feels complete, provide a final summary of their performance.

Output strictly the next response from the interviewer.
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            temperature: 0.7,
        });

        const reply = chatCompletion.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error("Mock Interview Error:", error);
        res.status(500).json({ message: error.message });
    }
};
