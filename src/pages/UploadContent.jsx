import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useLearning } from '../contexts/LearningContext';
import { useAuth } from '@clerk/clerk-react';
import { extractTextFromPDF, validatePDFFile } from '../utils/pdfProcessor';
import { useTranslation } from 'react-i18next';

const UploadContent = () => {
  const navigate = useNavigate();
  const { addContent, setLoading } = useLearning();
  const { isSignedIn } = useAuth();
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not authenticated (additional safeguard)
  if (!isSignedIn) {
    navigate('/login');
    return null;
  }

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Please upload only PDF files');
      return;
    }

    acceptedFiles.forEach(file => {
      try {
        validatePDFFile(file);
        
        const newFile = {
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          status: 'pending',
          progress: 0
        };

        setUploadedFiles(prev => [...prev, newFile]);
      } catch (error) {
        toast.error(error.message);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const processFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one PDF file');
      return;
    }

    console.log('=== STARTING FILE PROCESSING ===');
    console.log('Files to process:', uploadedFiles.length);
    console.log('Files:', uploadedFiles.map(f => ({ name: f.name, size: f.size })));
    console.log('================================');

    setIsProcessing(true);
    setLoading(true);

    try {
      for (const fileData of uploadedFiles) {
        console.log(`Processing file: ${fileData.name}`);
        
        // Update file status to processing
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileData.id ? { ...f, status: 'processing' } : f)
        );

        try {
          // Extract text from PDF
          setUploadedFiles(prev =>
            prev.map(f => f.id === fileData.id ? { ...f, progress: 25 } : f)
          );

          const extractedData = await extractTextFromPDF(fileData.file);
          
          // Log extracted data for testing
          console.log('=== EXTRACTED DATA FOR:', fileData.name, '===');
          console.log('Title:', extractedData.title);
          console.log('Text length:', extractedData.text?.length || 0);
          console.log('Text preview (first 500 chars):', extractedData.text?.substring(0, 500));
          console.log('File name:', extractedData.fileName);
          console.log('Page count:', extractedData.pageCount);
          console.log('File size:', extractedData.fileSize);
          console.log('Full extracted data:', extractedData);
          console.log('================================');
          
          setUploadedFiles(prev =>
            prev.map(f => f.id === fileData.id ? { ...f, progress: 50 } : f)
          );

          // Prepare content data for backend
          const contentData = {
            title: extractedData.title,
            extractedText: extractedData.text, // Backend expects 'extractedText', not 'text'
            fileName: extractedData.fileName,
            pageCount: extractedData.pageCount,
            fileSize: extractedData.fileSize,
            category: 'general' // You can add category selection in UI later
          };
          
          // Log content data being sent to backend
          console.log('=== CONTENT DATA FOR BACKEND ===');
          console.log('Content data:', contentData);
          console.log('================================');

          setUploadedFiles(prev =>
            prev.map(f => f.id === fileData.id ? { ...f, progress: 75 } : f)
          );

          // Upload to backend
          console.log('Sending data to backend...');
          const backendResponse = await addContent(contentData);
          console.log('Backend response:', backendResponse);

          setUploadedFiles(prev =>
            prev.map(f => f.id === fileData.id ? { ...f, progress: 100, status: 'completed' } : f)
          );

        } catch (error) {
          console.error('Error processing file:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            file: fileData.name
          });
          setUploadedFiles(prev =>
            prev.map(f => f.id === fileData.id ? { 
              ...f, 
              status: 'error', 
              error: error.message || 'Failed to process file'
            } : f)
          );
          toast.error(`Failed to process ${fileData.name}: ${error.message}`);
        }
      }

      // Check if all files were processed successfully
      const successfulFiles = uploadedFiles.filter(f => 
        uploadedFiles.find(uf => uf.id === f.id && uf.status === 'completed')
      );

      if (successfulFiles.length > 0) {
        toast.success(`Successfully processed ${successfulFiles.length} file(s)!`);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error in processFiles:', error);
      toast.error('An unexpected error occurred while processing files');
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'processing':
        return (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        );
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          {t('upload.title')}
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {t('upload.subtitle')}
        </p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-primary-500 bg-primary-50 scale-105'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          
          <motion.div
            animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CloudArrowUpIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          </motion.div>

          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {isDragActive ? t('upload.drag_drop_active') : t('upload.drag_drop')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('upload.click_browse')}
          </p>
          
          <div className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors">
            {t('upload.choose_files')}
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            {t('upload.supported_files')}
          </p>
        </div>
      </motion.div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t('upload.uploaded_files')} ({uploadedFiles.length})
            </h3>
            
            <div className="space-y-4">
              {uploadedFiles.map((fileData) => (
                <motion.div
                  key={fileData.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card-interactive p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(fileData.status)}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{fileData.name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(fileData.size)}
                          </p>
                        </div>
                        
                        {!isProcessing && fileData.status === 'pending' && (
                          <button
                            onClick={() => removeFile(fileData.id)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <XMarkIcon className="h-5 w-5 text-gray-400" />
                          </button>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {fileData.status === 'processing' && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${fileData.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}

                      {fileData.status === 'completed' && (
                        <div className="text-sm text-green-600 font-medium">
                          ✅ Processing completed successfully!
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center space-x-4"
        >
          <button
            onClick={() => setUploadedFiles([])}
            disabled={isProcessing}
            className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Clear All
          </button>
          
          <button
            onClick={processFiles}
            disabled={isProcessing}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{t('upload.processing')}</span>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-5 w-5" />
                <span>{t('upload.process_files')}</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 card-interactive p-8 text-center"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {t('upload.how_it_works')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{t('upload.step1_title')}</h4>
            <p className="text-gray-600 text-sm">
              {t('upload.step1_desc')}
            </p>
          </div>
          
          <div>
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{t('upload.step2_title')}</h4>
            <p className="text-gray-600 text-sm">
              {t('upload.step2_desc')}
            </p>
          </div>
          
          <div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{t('upload.step3_title')}</h4>
            <p className="text-gray-600 text-sm">
              {t('upload.step3_desc')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadContent;
