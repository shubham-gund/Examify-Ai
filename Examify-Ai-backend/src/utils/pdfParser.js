const pdf = require('pdf-parse');
const fs = require('fs').promises;

/**
 * Parse PDF file and extract text content
 * @param {String} filePath - Path to PDF file
 * @returns {Object} - { text, pageCount, info }
 */
const parsePDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    return {
      text: data.text.trim(),
      pageCount: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
};

/**
 * Clean and preprocess text for AI processing
 * @param {String} text - Raw text from PDF
 * @returns {String} - Cleaned text
 */
const cleanText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .trim();
};

/**
 * Split text into chunks for better AI processing
 * @param {String} text - Text to split
 * @param {Number} maxLength - Maximum chunk length
 * @returns {Array} - Array of text chunks
 */
const splitTextIntoChunks = (text, maxLength = 4000) => {
  const chunks = [];
  const paragraphs = text.split('\n\n');
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      if (paragraph.length > maxLength) {
        const words = paragraph.split(' ');
        for (const word of words) {
          if ((currentChunk + word).length > maxLength) {
            chunks.push(currentChunk.trim());
            currentChunk = word + ' ';
          } else {
            currentChunk += word + ' ';
          }
        }
      } else {
        currentChunk = paragraph + '\n\n';
      }
    } else {
      currentChunk += paragraph + '\n\n';
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

module.exports = {
  parsePDF,
  cleanText,
  splitTextIntoChunks
};