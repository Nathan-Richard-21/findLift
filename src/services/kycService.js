import api from './api';

// KYC Service with real backend API integration
export const kycService = {
  // Initialize a new KYC session
  start: async (personalInfo) => {
    try {
      const response = await api.post('/verification/start', { personalInfo });
      
      if (response.data.success) {
        // Store session ID for quick access
        localStorage.setItem('currentKycSession', response.data.sessionId);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to start verification');
      }
    } catch (error) {
      console.error('Failed to start KYC session:', error);
      throw new Error(error.response?.data?.message || 'Failed to initialize verification session');
    }
  },

  // Upload and store document images
  uploadDocument: async (sessionId, documentType, file, metadata = {}) => {
    try {
      // Convert file to base64 for upload
      const base64Data = await fileToBase64(file);
      
      // Prepare document data based on type
      let documentData = {};
      
      if (documentType === 'id_front') {
        documentData = {
          documentType: 'id_document',
          frontImage: base64Data,
          documentData: {
            type: (metadata.documentType === 'id_card') ? 'sa_id' : (metadata.documentType || 'sa_id'),
            documentNumber: metadata.documentNumber || metadata.idNumber,
            expiryDate: metadata.expiryDate
          },
          captureMethod: metadata.captureMethod || 'upload'
        };
      } else if (documentType === 'id_back') {
        // Get existing session to update back image
        const existingData = await kycService.getStatus(sessionId);
        documentData = {
          documentType: 'id_document',
          frontImage: existingData.documents?.idDocument?.frontImage,
          backImage: base64Data,
          documentData: {
            type: (metadata.documentType === 'id_card') ? 'sa_id' : (metadata.documentType || 'sa_id'),
            documentNumber: metadata.documentNumber || metadata.idNumber,
            expiryDate: metadata.expiryDate
          },
          captureMethod: metadata.captureMethod || 'upload'
        };
      } else if (documentType === 'driver_license_front') {
        documentData = {
          documentType: 'driver_license',
          frontImage: base64Data,
          documentData: {
            licenseNumber: metadata.licenseNumber,
            expiryDate: metadata.expiryDate,
            licenseClass: metadata.licenseClass
          },
          captureMethod: metadata.captureMethod || 'upload'
        };
      } else if (documentType === 'driver_license_back') {
        const existingData = await kycService.getStatus(sessionId);
        documentData = {
          documentType: 'driver_license',
          frontImage: existingData.documents?.driverLicense?.frontImage,
          backImage: base64Data,
          documentData: {
            licenseNumber: metadata.licenseNumber,
            expiryDate: metadata.expiryDate,
            licenseClass: metadata.licenseClass
          },
          captureMethod: metadata.captureMethod || 'upload'
        };
      }
      
      const response = await api.put(`/verification/${sessionId}/documents`, documentData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw new Error(error.response?.data?.message || `Failed to upload ${documentType}`);
    }
  },

  // Upload selfie with liveness data
  uploadSelfie: async (sessionId, selfieImage, livenessData = {}) => {
    try {
      // Convert image to base64 if it's a file
      let base64Image = selfieImage;
      if (selfieImage instanceof File) {
        base64Image = await fileToBase64(selfieImage);
      }
      
      const requestData = {
        selfieImage: base64Image,
        livenessData: livenessData.challenges || {},
        livenessScore: livenessData.score || 0
      };
      
      const response = await api.put(`/verification/${sessionId}/selfie`, requestData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to upload selfie');
      }
    } catch (error) {
      console.error('Failed to upload selfie:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload selfie');
    }
  },

  // Update verification with vehicle data
  updateVerification: async (sessionId, updateData) => {
    try {
      const response = await api.put(`/verification/${sessionId}/documents`, updateData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update verification');
      }
    } catch (error) {
      console.error('Failed to update verification:', error);
      throw new Error(error.response?.data?.message || 'Failed to update verification data');
    }
  },

  // Submit for review
  submit: async (sessionId) => {
    try {
      const response = await api.put(`/verification/${sessionId}/submit`);
      
      if (response.data.success) {
        // Clear the current session from localStorage
        localStorage.removeItem('currentKycSession');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to submit verification');
      }
    } catch (error) {
      console.error('Failed to submit for review:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit verification for review');
    }
  },

  // Get session status
  getStatus: async (sessionId) => {
    try {
      const response = await api.get(`/verification/${sessionId}/status`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get verification status');
      }
    } catch (error) {
      console.error('Failed to get status:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve verification status');
    }
  },

  // Get current user's verification status
  getVerificationStatus: async () => {
    try {
      const response = await api.get('/verification/user/history');
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Return the most recent verification
        return {
          success: true,
          data: response.data.data[0]
        };
      }
      
      // No verification found
      return { success: false, data: null };
    } catch (error) {
      console.error('Failed to get verification status:', error);
      // Return null if no verification found instead of throwing
      if (error.response?.status === 404) {
        return { success: false, data: null };
      }
      throw error;
    }
  },

  // Get user's verification history
  getUserHistory: async () => {
    try {
      const response = await api.get('/verification/user/history');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get verification history');
      }
    } catch (error) {
      console.error('Failed to get user history:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve verification history');
    }
  },

  // Admin: List pending submissions
  listPending: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/verification/admin/pending?page=${page}&limit=${limit}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get pending verifications');
      }
    } catch (error) {
      console.error('Failed to list pending submissions:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve pending submissions');
    }
  },

  // Admin: Get verification details with documents
  getVerificationDetails: async (sessionId) => {
    try {
      const response = await api.get(`/verification/admin/${sessionId}/details`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get verification details');
      }
    } catch (error) {
      console.error('Failed to get verification details:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve verification details');
    }
  },

  // Admin: Approve verification
  approve: async (sessionId, approvalNotes = '') => {
    try {
      const response = await api.put(`/verification/admin/${sessionId}/approve`, {
        approvalNotes
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to approve verification');
      }
    } catch (error) {
      console.error('Failed to approve verification:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve verification');
    }
  },

  // Admin: Reject verification
  reject: async (sessionId, rejectionReason, adminNotes = '') => {
    try {
      const response = await api.put(`/verification/admin/${sessionId}/reject`, {
        rejectionReason,
        adminNotes
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to reject verification');
      }
    } catch (error) {
      console.error('Failed to reject verification:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject verification');
    }
  },

  // Admin: Get verification statistics
  getStats: async () => {
    try {
      const response = await api.get('/verification/admin/stats');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get verification stats');
      }
    } catch (error) {
      console.error('Failed to get verification stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve verification statistics');
    }
  },

  // Get current session ID from localStorage
  getCurrentSessionId: () => {
    return localStorage.getItem('currentKycSession');
  },

  // Clear current session from localStorage
  clearCurrentSession: () => {
    localStorage.removeItem('currentKycSession');
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export default kycService;
