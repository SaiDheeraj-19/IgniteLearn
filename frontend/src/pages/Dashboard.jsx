import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getProgress, getRoadmap, completeLesson, chatWithMentor } from '../services/api';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingLesson, setMarkingLesson] = useState('');

  // Chat Mentor state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm Spark, your AI mentor. Ask me anything about your learning journey! 🚀" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const userId = sessionStorage.getItem('il_uid') || 'demo_user';

  useEffect(() => {
    const load = async () => {
      try {
        const [prog, rm] = await Promise.all([
          getProgress(userId).catch(() => null),
          getRoadmap(userId).catch(() => null),
        ]);
        setProgress(prog);
        setRoadmap(rm);
      } catch {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCompleteLesson = async (lessonId, weekNumber) => {
    setMarkingLesson(lessonId);
    try {
      const updated = await completeLesson(userId, lessonId, weekNumber);
      setProgress(prev => ({ ...prev, ...updated }));
    } catch { /* silent */ }
    finally { setMarkingLesson(''); }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const currentWeek = roadmap?.roadmap?.[((progress?.currentWeek || 1) - 1)];
      const ctx = {
        name: 'Student',
        level: progress?.overallLevel || 'beginner',
        currentWeek: progress?.currentWeek || 1,
        currentTopic: currentWeek?.topic || 'getting started',
      };
      const { reply } = await chatWithMentor(userMsg, ctx, language);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not respond right now. Try again!' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const currentWeekData = roadmap?.roadmap?.[(progress?.currentWeek || 1) - 1];
  const completedLessons = progress?.completedLessons || [];

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <LoadingSpinner message={t('common.loading')} size="lg" />
    </div>
  );

  if (!roadmap) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">📚</p>
        <h2 className="text-xl font-bold mb-2">No Roadmap Yet</h2>
        <p className="text-slate-400 mb-6">Complete the quiz to generate your personalized learning plan.</p>
        <button onClick={() => navigate('/quiz')} className="btn-primary">Start Quiz →</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Welcome Banner */}
        <div className="glass rounded-2xl p-6 mb-8 fade-in-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">{t('dashboard.welcome')} 👋</p>
              <h1 className="text-2xl font-extrabold gradient-text">{t('dashboard.title')}</h1>
              <p className="text-slate-400 text-sm mt-1 italic">{t('dashboard.keep_going')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold gradient-text">
                {progress?.percentComplete || 0}%
              </div>
              <div className="text-xs text-slate-400">{t('dashboard.percent_done')}</div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar percent={progress?.percentComplete || 0} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8 fade-in-up">
          <div className="card text-center py-4">
            <div className="text-2xl font-extrabold text-blue-400">
              {progress?.currentWeek || 1}
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('dashboard.current_week')}</div>
          </div>
          <div className="card text-center py-4">
            <div className="text-2xl font-extrabold text-purple-400">
              {completedLessons.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('dashboard.lessons_done')}</div>
          </div>
          <div className="card text-center py-4">
            <div className="text-2xl font-extrabold text-green-400">
              {progress?.totalWeeks || 4}
            </div>
            <div className="text-xs text-slate-400 mt-1">Total Weeks</div>
          </div>
        </div>

        {/* Current Week Focus */}
        {currentWeekData && (
          <section className="mb-8 fade-in-up">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              🎯 <span>{t('dashboard.next_step')}</span>
            </h2>
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl flex-shrink-0">
                  📖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-purple text-xs">Week {currentWeekData.week}</span>
                    <span className="text-slate-500 text-xs">{currentWeekData.durationHours} hrs</span>
                  </div>
                  <h3 className="font-bold text-slate-100 mb-1">{currentWeekData.topic}</h3>
                  <p className="text-slate-400 text-sm mb-3">{currentWeekData.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {currentWeekData.tags?.map((tag, i) => (
                      <span key={i} className="badge badge-blue text-xs">{tag}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCompleteLesson(`week_${currentWeekData.week}`, currentWeekData.week)}
                    disabled={!!markingLesson || completedLessons.includes(`week_${currentWeekData.week}`)}
                    className={completedLessons.includes(`week_${currentWeekData.week}`)
                      ? 'badge badge-green text-sm py-2 px-4 cursor-default'
                      : 'btn-primary text-sm py-2 px-4'
                    }
                  >
                    {completedLessons.includes(`week_${currentWeekData.week}`)
                      ? '✅ Completed'
                      : markingLesson ? 'Saving…' : `✔ ${t('dashboard.mark_done')}`
                    }
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* All Weeks Progress */}
        <section className="mb-8 fade-in-up">
          <h2 className="text-lg font-bold mb-4">📅 Full Roadmap</h2>
          <div className="space-y-3">
            {roadmap.roadmap?.map((week, i) => {
              const lessonId = `week_${week.week}`;
              const done = completedLessons.includes(lessonId);
              return (
                <div key={i} className={`card flex items-center gap-4 transition-all ${done ? 'opacity-60' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                    done ? 'bg-green-500/20' : 'bg-white/5'
                  }`}>
                    {done ? '✅' : week.week}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-200 truncate">{week.topic}</h4>
                    <p className="text-slate-500 text-xs">{week.durationHours} hrs · Week {week.week}</p>
                  </div>
                  {done
                    ? <span className="badge badge-green text-xs flex-shrink-0">{t('dashboard.completed')}</span>
                    : <button
                        onClick={() => handleCompleteLesson(lessonId, week.week)}
                        disabled={!!markingLesson}
                        className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0"
                      >
                        {markingLesson === lessonId ? '…' : '✔ Done'}
                      </button>
                  }
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* ── AI Chat Mentor Floating Button ── */}
      <div className="fixed bottom-6 right-4 z-50">
        {chatOpen && (
          <div className="mb-3 w-80 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 fade-in-up">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div>
                  <p className="font-bold text-sm">Spark AI Mentor</p>
                  <p className="text-xs text-blue-100 opacity-80">Ask me anything!</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white text-lg leading-none">✕</button>
            </div>
            <div className="h-64 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white/8 text-slate-200 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/8 px-3 py-2 rounded-xl rounded-bl-none">
                    <span className="text-slate-400 text-sm animate-pulse">Spark is thinking…</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
            <div className="px-3 py-3 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask Spark…"
                className="input text-sm py-2"
              />
              <button
                onClick={sendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="btn-primary py-2 px-4 text-sm flex-shrink-0"
              >
                ↑
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setChatOpen(o => !o)}
          className="btn-primary w-14 h-14 rounded-full justify-center shadow-2xl"
          style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
          title="Chat with Spark AI"
        >
          🤖
        </button>
      </div>
    </div>
  );
}
