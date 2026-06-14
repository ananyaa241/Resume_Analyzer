const mongoose = require('mongoose');

const resumeScanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resumeName: String,
    resumeURL: String,
    jobDescription: String,
    extractedText: String,
    atsScore: Number,
    resumeScore: Number,
    jobMatchScore: Number,
    overview: String,
    highlights: [String],
    improvements: [String],
    grammarErrors: [{
        errorType: String,
        incorrect: String,
        suggestion: String
    }],
    formattingErrors: [String],
    missingSections: [String],
    matchedKeywords: [String],
    missingKeywords: [String],
    recommendedKeywords: [String],
    dateIssues: [String],
    resumeLength: String,
    bulletPointSuggestions: [String],
    industrySkills: [String],
    certificationRecommendations: [String],
    optimizedResume: {
        summary: String,
        workExperience: [{
            original: String,
            optimized: String
        }],
        projects: [{
            original: String,
            optimized: String
        }],
        skills: {
            original: [String],
            optimized: [String]
        }
    },
    interviewPrep: [{
        question: String,
        type: { type: String, enum: ['Technical', 'Behavioral'] },
        rationale: String,
        suggestedAnswer: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ResumeScan', resumeScanSchema);
