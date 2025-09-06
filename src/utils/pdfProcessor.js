import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - try local file first, then CDN
const setWorkerSource = () => {
  // Use local worker file from public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  console.log('PDF.js worker configured with local .mjs file');
};

setWorkerSource();

/**
 * Extract text from PDF file
 * @param {File} file - PDF file object
 * @returns {Promise<{text: string, title: string, pageCount: number}>}
 */
export const extractTextFromPDF = async (file) => {
  try {
    console.log('Starting PDF text extraction for:', file.name);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF document loaded successfully');
    
    let fullText = '';
    const pageCount = pdf.numPages;
    console.log('Total pages:', pageCount);
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      console.log(`Processing page ${pageNum}/${pageCount}`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
      console.log(`Page ${pageNum} processed, text length:`, pageText.length);
    }
    
    // Get document info for title
    const info = await pdf.getMetadata();
    const title = info?.info?.Title || file.name.replace('.pdf', '');
    console.log('Document title:', title);
    console.log('Total extracted text length:', fullText.trim().length);
    
    const result = {
      text: fullText.trim(),
      title: title,
      pageCount: pageCount,
      fileSize: file.size,
      fileName: file.name
    };
    
    console.log('PDF extraction completed successfully:', result);
    return result;
    
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Validate PDF file
 * @param {File} file - File to validate
 * @returns {boolean}
 */
export const validatePDFFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PDF files are allowed');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }
  
  return true;
};

/**
 * Process multiple PDF files
 * @param {FileList|Array} files - Files to process
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>}
 */
export const processPDFFiles = async (files, onProgress = () => {}) => {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Validate file
      validatePDFFile(file);
      
      // Extract text
      const extracted = await extractTextFromPDF(file);
      
      results.push({
        id: `${Date.now()}-${i}`,
        success: true,
        data: extracted,
        error: null
      });
      
      // Update progress
      onProgress({
        current: i + 1,
        total: files.length,
        fileName: file.name,
        status: 'completed'
      });
      
    } catch (error) {
      results.push({
        id: `${Date.now()}-${i}`,
        success: false,
        data: null,
        error: error.message,
        fileName: file.name
      });
      
      // Update progress
      onProgress({
        current: i + 1,
        total: files.length,
        fileName: file.name,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return results;
};
