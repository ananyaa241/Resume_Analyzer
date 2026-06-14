const getAnalysisPrompt = (resumeText, jobDescription) => {
  return `
Analyze the following resume against the provided Job Description.

Job Description:
${jobDescription}

Resume Text:
${resumeText}

Perform:
1. ATS Compatibility Check
2. Resume Score (0-100)
3. Job Match Score (0-100)
4. Grammar Analysis (identify specific errors)
5. Formatting Analysis
6. Missing Sections Detection
7. Keyword Matching (Matched, Missing, Recommended)
8. Date Formatting Checks
9. Resume Length Evaluation
10. Bullet Point Quality Analysis
11. Web Search for latest industry skills and ATS recommendations (if applicable)
12. Suggest resume improvements
13. Generate optimized resume sections

Return STRICTLY VALID JSON. 
Output Schema:
{
  "atsScore": number,
  "resumeScore": number,
  "jobMatchScore": number,
  "overview": "string",
  "highlights": ["string"],
  "improvements": ["string"],
  "grammarErrors": [
    {"errorType": "string", "incorrect": "string", "suggestion": "string"}
  ],
  "formattingErrors": ["string"],
  "missingSections": ["string"],
  "matchedKeywords": ["string"],
  "missingKeywords": ["string"],
  "recommendedKeywords": ["string"],
  "dateIssues": ["string"],
  "resumeLength": "string",
  "bulletPointSuggestions": ["string"],
  "industrySkills": ["string"],
  "certificationRecommendations": ["string"],
  "optimizedResume": {
    "summary": "string",
    "workExperience": [
      {"original": "string", "optimized": "string"}
    ],
    "projects": [
      {"original": "string", "optimized": "string"}
    ],
    "skills": {
      "original": ["string"],
      "optimized": ["string"]
    }
  },
  "interviewPrep": [
    {
      "question": "string",
      "type": "Technical" | "Behavioral",
      "rationale": "string",
      "suggestedAnswer": "string"
    }
  ]
}
Return ONLY JSON and no additional text.
`;
};

module.exports = { getAnalysisPrompt };
