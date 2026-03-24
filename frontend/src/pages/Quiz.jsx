import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getQuizQuestions, submitQuiz } from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';

const INTERESTS = [
  { id: 'technology', label: '💻 Technology' },
  { id: 'art', label: '🎨 Art & Design' },
  { id: 'business', label: '💼 Business' },
  { id: 'science', label: '🔬 Science' },
  { id: 'teaching', label: '📚 Teaching' },
  { id: 'healthcare', label: '🏥 Healthcare' },
];

export default function Quiz() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('interests'); // 'interests' | 'quiz' | 'submitting'
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Stable guest ID stored in session
  const userId = sessionStorage.getItem('il_uid') || (() => {
    const id = `guest_${Date.now()}`;
    sessionStorage.setItem('il_uid', id);
    return id;
  })();

  const toggleInterest = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const startQuiz = async () => {
    if (selectedInterests.length === 0) {
      setError('Please select at least 1 interest.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const qs = await getQuizQuestions();
      setQuestions(qs);
      setPhase('quiz');
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (idx) => setSelectedOption(idx);

  const handleNext = () => {
    if (selectedOption === null) return;
    const q = questions[currentIdx];
    const newAnswers = [
      ...answers,
      {
        questionId: q.id,
        selectedOption,
        domain: q.domain,
        difficulty: q.difficulty,
      },
    ];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setPhase('submitting');
    setError('');
    try {
      await submitQuiz(userId, finalAnswers);
      // Store interests in session for Results page
      sessionStorage.setItem('il_interests', JSON.stringify(selectedInterests));
      navigate('/results');
    } catch {
      setError(t('common.error'));
      setPhase('quiz');
    }
  };

  const progress = questions.length > 0 ? Math.round((currentIdx / questions.length) * 100) : 0;
  const currentQ = questions[currentIdx];

  const DOMAIN_ICONS = { math: '🔢', logic: '🧩', english: '📖', science: '🔬', creativity: '🎨' };
  const DIFF_COLORS = { easy: 'badge-green', medium: 'badge-orange', hard: 'badge-purple' };

  if (phase === 'submitting') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <LoadingSpinner message={t('quiz.submitting')} size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10">

        {/* ── Interests Phase ── */}
        {phase === 'interests' && (
          <div className="fade-in-up">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold mb-2">{t('quiz.title')}</h1>
              <p className="text-slate-400">What are you interested in? (Pick up to 3)</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {INTERESTS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => toggleInterest(id)}
                  className={`card text-left transition-all flex items-center justify-between ${
                    selectedInterests.includes(id)
                      ? '!border-blue-500 !bg-blue-900/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'hover:border-white/20'
                  }`}
                >
                  <span className="text-sm font-semibold">{label}</span>
                  {selectedInterests.includes(id) && <span>✅</span>}
                </button>
              ))}
            </div>
            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
            <button
              onClick={startQuiz}
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? t('common.loading') : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── Quiz Phase ── */}
        {phase === 'quiz' && currentQ && (
          <div className="fade-in-up">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2 text-sm text-slate-400">
                <span>
                  {t('quiz.question_of', { current: currentIdx + 1, total: questions.length })}
                </span>
                <div className="flex gap-2">
                  <span className={`badge ${DIFF_COLORS[currentQ.difficulty]}`}>
                    {currentQ.difficulty}
                  </span>
                  <span className="badge badge-blue">
                    {DOMAIN_ICONS[currentQ.domain]} {currentQ.domain}
                  </span>
                </div>
              </div>
              <ProgressBar percent={progress} />
            </div>

            {/* Question Card */}
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-slate-100 leading-snug">{currentQ.question}</h2>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-8">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`card text-left transition-all ${
                    selectedOption === idx
                      ? '!border-blue-500 !bg-blue-900/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      selectedOption === idx
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-white/20 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm font-medium">{opt}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="btn-primary w-full justify-center"
            >
              {currentIdx + 1 === questions.length ? t('quiz.submit') : t('quiz.next')} →
            </button>

            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
