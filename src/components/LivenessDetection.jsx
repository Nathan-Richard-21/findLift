import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaCamera } from 'react-icons/fa';

const LivenessDetection = ({ onComplete, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (stream && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (stream && countdown === 0 && !isCapturing) {
      capturePhoto();
    }
  }, [stream, countdown, isCapturing]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = async () => {
    setIsCapturing(true);
    
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `liveness_selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const imageUrl = URL.createObjectURL(blob);
          
          stopCamera();
          onComplete(file, imageUrl, {
            timestamp: new Date().toISOString(),
            captureMethod: 'auto-timer'
          });
        }
      }, 'image/jpeg', 0.9);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Camera Error</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex space-x-3">
            <button onClick={startCamera} className="btn-primary flex-1">
              Try Again
            </button>
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Live Selfie Capture</h3>
            <p className="text-sm text-gray-600">
              Position your face in the circle
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        {/* Video Area */}
        <div className="p-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Face outline guide */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="border-4 border-white rounded-full w-48 h-64 opacity-60"></div>
            </div>

            {/* Countdown overlay */}
            {countdown > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <div className="text-center text-white">
                  <FaCamera className="text-6xl mx-auto mb-4 animate-pulse" />
                  <div className="text-7xl font-bold mb-2">{countdown}</div>
                  <p className="text-xl">Taking photo...</p>
                </div>
              </div>
            )}

            {/* Capturing overlay */}
            {isCapturing && (
              <div className="absolute inset-0 bg-white animate-pulse"></div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Instructions */}
        <div className="px-4 pb-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-center">
              <p className="text-blue-900 font-medium text-lg mb-2">
                {countdown > 0 ? 'Keep your face centered and look at the camera' : 'Capturing...'}
              </p>
              <p className="text-sm text-blue-700">
                💡 <strong>Tips:</strong> Ensure good lighting, remove glasses if possible, and keep your face fully visible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivenessDetection;