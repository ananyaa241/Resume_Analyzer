const getOptimizationPrompt = (resumeText, jobDescription) => {
    return `
Optimize the following resume against the provided Job Description for a professional ATS-friendly result.

Job Description:
${jobDescription}

Resume Text:
${resumeText}

Focus strictly on:
1. Work Experience: Rewrite bullet points for impact and ATS keyword coverage.
2. Projects: Improve technical depth and business impact.
3. Skills: Categorize and suggest missing skills.
4. Professional Summary: Generate a tailored pitch.

Return STRICTLY VALID JSON. 
Output Schema:
{
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
}
Return ONLY JSON and no additional text.
`;
};

module.exports = { getOptimizationPrompt };
