const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

const extractTextFromPDF = async (buffer) => {
    const data = await pdf(buffer);
    return data.text;
};

const extractTextFromDOCX = async (buffer) => {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
};

const extractText = async (file) => {
    const { buffer, mimetype } = file;
    if (mimetype === 'application/pdf') {
        return await extractTextFromPDF(buffer);
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
        return await extractTextFromDOCX(buffer);
    } else {
        throw new Error('Unsupported file type');
    }
};

module.exports = { extractText };
