// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  createdAt?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  token: string;
  data: {
    user: User;
  };
}

// Syllabus Types
export interface Syllabus {
  _id: string;
  title: string;
  uploadedBy: string | User;
  fileUrl: string;
  fileName: string;
  parsedText: string;
  uploadDate: string;
  fileSize: number;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Question Types
export type QuestionType = 'mcq' | 'short' | 'long' | 'true_false';

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
  _id?: string;
}

export interface Question {
  _id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  correctAnswer?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  syllabusId?: string;
  testId?: string;
  createdBy: string;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

// Note Types
export interface Note {
  _id: string;
  syllabusId: string | Syllabus;
  content: string;
  summary?: string;
  keyPoints: string[];
  generatedDate: string;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

// Test Types
export interface Test {
  _id: string;
  title: string;
  description?: string;
  createdBy: string | User;
  syllabusId?: string | Syllabus;
  questions: string[] | Question[];
  scheduledDate?: string;
  duration: number;
  totalPoints: number;
  isActive: boolean;
  allowedAttempts: number;
  passingScore: number;
  createdAt: string;
  updatedAt: string;
}

// Available Test (for students)
export interface AvailableTest extends Test {
  attemptCount: number;
  attemptsRemaining: number;
  canAttempt: boolean;
}

// Answer Types
export interface Answer {
  questionId: string | Question;
  answer: string;
  isCorrect?: boolean;
  pointsEarned: number;
  aiFeedback?: string;
}

// Result Types
export interface Result {
  _id: string;
  studentId: string | User;
  testId: string | Test;
  answers: Answer[];
  score: number;
  percentage: number;
  passed: boolean;
  feedback?: string;
  evaluationType: 'automatic' | 'ai' | 'manual';
  timeSpent?: number;
  attemptNumber: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface StudentAnalytics {
  totalTests: number;
  testsCompleted: number;
  averageScore: number;
  passRate: number;
  passedTests: number;
  failedTests: number;
  highestScore: number;
  lowestScore: number;
  recentTests?: Array<{
    testTitle: string;
    score: number;
    passed: boolean;
    date: string;
  }>;
}

export interface TestHistory {
  resultId: string;
  testTitle: string;
  teacher: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
  submittedAt: string;
  timeSpent?: number;
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  count?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  count: number;
  total?: number;
  page?: number;
  pages?: number;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

export interface CreateTestFormData {
  title: string;
  description?: string;
  syllabusId?: string;
  questions: string[];
  duration: number;
  scheduledDate?: string;
  allowedAttempts?: number;
  passingScore?: number;
}

export interface SubmitTestFormData {
  testId: string;
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
  timeSpent?: number;
}

export interface UploadSyllabusFormData {
  title: string;
  pdf: File;
}

export interface GenerateQuestionsFormData {
  syllabusId: string;
  count: number;
  types: QuestionType[];
}

// Practice Test Types
export interface PracticeTest {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  totalPoints: number;
  questions: Question[];
  attemptCount: number;
  bestScore: number;
  syllabusId: string | Syllabus;
  createdAt: string;
}

// Test Results (for teachers)
export interface TestResults {
  results: Result[];
  stats: {
    totalAttempts: number;
    averageScore: number;
    passCount: number;
    failCount: number;
    highestScore: number;
    lowestScore: number;
  };
}

// Error Types
export interface ApiError {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
}

// Filter/Sort Types
export interface TestFilters {
  isActive?: boolean;
  createdBy?: string;
  scheduledAfter?: string;
  scheduledBefore?: string;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}