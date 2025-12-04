import React, { useRef, useState } from 'react';
import { FaUpload, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const FileUpload = ({ onFileSelect, accept = "image/*", maxSize = 10 * 1024 * 1024, type = "document" }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }

    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }

    // Check image quality (basic validation)
    return null;
  };

  const processFile = async (file) => {
    setIsProcessing(true);
    setError(null);

    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      setIsProcessing(false);
      return;
    }

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setSelectedFile(file);

      // Optional: Basic image quality checks
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Check for basic quality indicators
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const brightness = calculateBrightness(imageData.data);
        
        if (brightness < 50) {
          setError('Image appears too dark. Please ensure good lighting.');
        } else if (brightness > 200) {
          setError('Image appears overexposed. Please reduce glare.');
        }

        URL.revokeObjectURL(previewUrl);
        setIsProcessing(false);
      };
      img.onerror = () => {
        setError('Invalid image file');
        setIsProcessing(false);
      };
      img.src = previewUrl;

    } catch (err) {
      setError('Error processing file');
      setIsProcessing(false);
    }
  };

  const calculateBrightness = (data) => {
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      brightness += (r * 0.299 + g * 0.587 + b * 0.114);
    }
    return brightness / (data.length / 4);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUseFile = () => {
    if (selectedFile) {
      onFileSelect(selectedFile, preview);
    }
  };

  const handleRemoveFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInstructions = () => {
    switch (type) {
      case 'document':
        return [
          'Ensure all corners of the document are visible',
          'Text should be clear and readable',
          'Avoid shadows and glare',
          'Use good lighting'
        ];
      case 'selfie':
        return [
          'Face should be clearly visible',
          'Remove sunglasses if possible',
          'Ensure good lighting on your face',
          'Look directly at the camera'
        ];
      default:
        return ['Ensure the image is clear and well-lit'];
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      {!selectedFile && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : error 
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="text-center">
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-600">Processing image...</span>
              </div>
            ) : (
              <>
                <FaUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG up to {Math.round(maxSize / (1024 * 1024))}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      {selectedFile && preview && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded-lg border"
            />
            <button
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              <span className="text-sm text-gray-700">{selectedFile.name}</span>
            </div>
            <span className="text-xs text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
            </span>
          </div>

          <button
            onClick={handleUseFile}
            className="w-full btn-primary"
          >
            Use This Image
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Instructions */}
      {!selectedFile && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for best results:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            {getInstructions().map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                {instruction}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;