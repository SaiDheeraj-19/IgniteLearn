import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Quiz ────────────────────────────────────────────────────────────────────
export const getQuizQuestions = () => api.get('/quiz/questions').then(r => r.data.data);

export const getNextQuestion = (questionId, isCorrect) =>
  api.get('/quiz/next', { params: { questionId, isCorrect } }).then(r => r.data.data);

export const submitQuiz = (userId, answers) =>
  api.post('/quiz/submit', { userId, answers }).then(r => r.data.data);

// ─── Roadmap ─────────────────────────────────────────────────────────────────
export const generateRoadmap = (userId, interests, language) =>
  api.post('/roadmap/generate', { userId, interests, language }).then(r => r.data.data);

export const getRoadmap = (userId) =>
  api.get(`/roadmap/${userId}`).then(r => r.data.data);

export const chatWithMentor = (message, studentContext, language) =>
  api.post('/roadmap/mentor', { message, studentContext, language }).then(r => r.data.data);

// ─── Progress ─────────────────────────────────────────────────────────────────
export const getProgress = (userId) =>
  api.get(`/progress/${userId}`).then(r => r.data.data);

export const completeLesson = (userId, lessonId, weekNumber) =>
  api.post('/progress/complete', { userId, lessonId, weekNumber }).then(r => r.data.data);

// ─── Content ─────────────────────────────────────────────────────────────────
export const getContent = (tags, language) =>
  api.get('/content', { params: { tags: tags.join(','), language } }).then(r => r.data.data);

export default api;
