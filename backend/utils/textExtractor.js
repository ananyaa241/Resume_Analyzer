const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

const extractTextFromPDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
};

const extractTextFromDOCX = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
};

const extractText = async (file) => {
    const { path, mimetype } = file;
    if (mimetype === 'application/pdf') {
        return await extractTextFromPDF(path);
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
        return await extractTextFromDOCX(path);
    } else {
        throw new Error('Unsupported file type');
    }
};

module.exports = { extractText };
