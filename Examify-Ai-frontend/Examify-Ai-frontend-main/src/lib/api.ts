import axios from 'axios';

// ==============================
// API Base Configuration
// ==============================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==============================
// Notes Service
// ==============================
export const notesService = {
  generateFromSyllabus: async (syllabusId: string) => {
    const response = await api.post('/ai/generate-notes', { syllabusId });
    return response.data;
  },

  getMyNotes: async () => {
    const response = await api.get('/ai');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/ai/${id}`);
    return response.data;
  },

  update: async (id: string, data: { content: string }) => {
    const response = await api.put(`/ai/${id}`, data);
    return response.data;
  }
};


// ==============================
// Interceptors
// ==============================

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling expired/invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==============================
// Auth Service
// ==============================
export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'teacher';
  }) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// ==============================
// Syllabus Service
// ==============================
export const syllabusService = {
  /**
   * Upload syllabus
   * Supports:
   *  - PDF file (FormData)
   *  - Manual text input (JSON)
   */
  upload: async (data: FormData | { title: string; content: string }) => {
    try {
      let response;

      if (data instanceof FormData) {
        // 📄 Upload PDF file
        // CRITICAL: Delete Content-Type to let axios set it automatically
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
        response = await api.post('/syllabus/upload', data, config);
      } else {
        // ✍️ Upload text syllabus (uses default application/json)
        response = await api.post('/syllabus/upload', data);
      }

      return response.data;
    } catch (error: any) {
      console.error('Error uploading syllabus:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all syllabi uploaded by current user
   */
  getAll: async () => {
    try {
      const response = await api.get('/syllabus');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching syllabi:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get a single syllabus by ID (with parsed text)
   */
  getById: async (id: string) => {
    try {
      const response = await api.get(`/syllabus/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching syllabus:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete syllabus by ID
   */
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/syllabus/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting syllabus:', error);
      throw error.response?.data || error;
    }
  },
};

// ==============================
// AI Service
// ==============================
export const aiService = {
  generateNotes: async (syllabusId: string) => {
    const response = await api.post('/ai/generate-notes', { syllabusId });
    return response.data;
  },

  generateQuestions: async (
    syllabusId: string,
    count: number = 10,
    types: string[] = ['mcq', 'short']
  ) => {
    const response = await api.post('/ai/generate-questions', {
      syllabusId,
      count,
      types,
    });
    return response.data;
  },

  getNotes: async (syllabusId: string) => {
    const response = await api.get(`/ai/notes/${syllabusId}`);
    return response.data;
  },

  evaluateAnswer: async (questionId: string, studentAnswer: string) => {
    const response = await api.post('/ai/evaluate', {
      questionId,
      studentAnswer,
    });
    return response.data;
  },
};

// Question Service
export const questionService = {
  getAllByTeacher: async () => {
    const response = await api.get('/questions');
    return response.data;
  },

  getBySyllabus: async (syllabusId: string) => {
    const response = await api.get(`/questions/syllabus/${syllabusId}`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },
};

// ==============================
// Test Service (for teachers)
// ==============================
export const testService = {
  create: async (data: {
    title: string;
    description?: string;
    syllabusId?: string;
    questions: string[];
    duration: number;
    scheduledDate?: string;
    allowedAttempts?: number;
    passingScore?: number;
  }) => {
    const response = await api.post('/tests', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/tests');
    return response.data.data.tests;
  },

  getById: async (id: string) => {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/tests/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/tests/${id}`);
    return response.data;
  },
};

// ==============================
// Exam Service (for students)
// ==============================
export const examService = {
  getAvailable: async () => {
    const response = await api.get('/exams/available');
    return response.data;
  },

  startTest: async (testId: string) => {
    const response = await api.get(`/exams/start/${testId}`);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/exams/history');
    return response.data;
  },

  getResult: async (resultId: string) => {
    const response = await api.get(`/exams/result/${resultId}`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/exams/analytics');
    return response.data;
  },

  uploadForPractice: async (formData: FormData) => {
    const response = await api.post('/exams/practice/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getPracticeTests: async () => {
    const response = await api.get('/exams/practice');
    return response.data;
  },

  deletePracticeTest: async (testId: string) => {
    const response = await api.delete(`/exams/practice/${testId}`);
    return response.data;
  },
};

// ==============================
// Result Service
// ==============================
export const resultService = {
  submit: async (data: {
    testId: string;
    answers: Array<{ questionId: string; answer: string }>;
    timeSpent?: number;
  }) => {
    const response = await api.post('/results/submit', data);
    return response.data;
  },

  getMyResults: async () => {
    const response = await api.get('/results/my-results');
    return response.data;
  },

  getTestResults: async (testId: string) => {
    const response = await api.get(`/results/test/${testId}`);
    return response.data;
  },

  getById: async (resultId: string) => {
    const response = await api.get(`/results/${resultId}`);
    return response.data;
  },
};

export default api;