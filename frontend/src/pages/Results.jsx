import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { generateRoadmap, getRoadmap, getContent } from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const MATCH_COLOR = (pct) => {
  if (pct >= 80) return 'badge-green';
  if (pct >= 60) return 'badge-orange';
  return 'badge-blue';
};

export default function Results() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeWeek, setActiveWeek] = useState(0);
  const [weekVideos, setWeekVideos] = useState({});
  const [loadingVideos, setLoadingVideos] = useState(false);

  const userId = sessionStorage.getItem('il_uid') || 'demo_user';
  const interests = JSON.parse(sessionStorage.getItem('il_interests') || '[]');

  useEffect(() => {
    const load = async () => {
      try {
        // Try fetching cached roadmap first
        const cached = await getRoadmap(userId).catch(() => null);
        if (cached) { setRoadmap(cached); setLoading(false); return; }

        // Generate new roadmap
        const data = await generateRoadmap(userId, interests, language);
        setRoadmap(data);
      } catch (e) {
        setError(e.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadVideos = async (week, tags) => {
    if (weekVideos[week]) return; // cached
    setLoadingVideos(true);
    try {
      const videos = await getContent(tags, language);
      setWeekVideos(prev => ({ ...prev, [week]: videos }));
    } catch { /* silent fail — YouTube API is optional */ }
    finally { setLoadingVideos(false); }
  };

  const toggleWeek = (idx) => {
    const week = roadmap.roadmap[idx];
    if (activeWeek === idx) { setActiveWeek(null); return; }
    setActiveWeek(idx);
    if (week?.tags) loadVideos(idx, week.tags);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-xl mx-auto px-4">
          <LoadingSpinner message={t('results.generating')} size="lg" />
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer rounded-2xl h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button onClick={() => navigate('/quiz')} className="btn-secondary">
          ← {t('common.back')} to Quiz
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-10 fade-in-up">
          <h1 className="text-3xl font-extrabold gradient-text mb-3">{t('results.title')}</h1>
          {roadmap?.motivationalMessage && (
            <p className="text-slate-300 italic text-sm max-w-lg mx-auto">
              "{roadmap.motivationalMessage}"
            </p>
          )}
        </div>

        {/* Top Career Matches */}
        <section className="mb-10 fade-in-up">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            🎯 <span>{t('results.careers_title')}</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {roadmap?.careers?.map((career, i) => (
              <div key={i} className="card hover:scale-[1.02] transition-transform cursor-default">
                {i === 0 && (
                  <div className="badge badge-orange mb-2 text-xs">⭐ Best Match</div>
                )}
                <h3 className="font-bold text-slate-100 mb-1">{career.title}</h3>
                <p className="text-slate-400 text-xs mb-3 leading-relaxed">{career.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {career.skills?.slice(0, 3).map((skill, j) => (
                    <span key={j} className="badge badge-blue text-xs">{skill}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`badge ${MATCH_COLOR(career.matchPercent)} text-xs`}>
                    {career.matchPercent}% {t('common.match')}
                  </span>
                  {career.avgSalary && (
                    <span className="text-slate-500 text-xs">{career.avgSalary}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skill Gaps */}
        {roadmap?.skillGaps?.length > 0 && (
          <section className="mb-10 fade-in-up">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              📈 <span>{t('results.skill_gaps')}</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {roadmap.skillGaps.map((gap, i) => (
                <span key={i} className="badge badge-orange">{gap}</span>
              ))}
            </div>
          </section>
        )}

        {/* Weekly Roadmap */}
        <section className="mb-10 fade-in-up">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            🗺️ <span>{t('results.roadmap_title')}</span>
          </h2>
          <div className="space-y-3">
            {roadmap?.roadmap?.map((week, idx) => (
              <div key={idx} className="card">
                <button
                  onClick={() => toggleWeek(idx)}
                  className="w-full text-left flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-purple text-xs">
                        {t('results.week')} {week.week}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {week.durationHours} {t('results.hours')}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-100">{week.topic}</h3>
                  </div>
                  <span className={`text-slate-400 transition-transform ${activeWeek === idx ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {activeWeek === idx && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-slate-400 text-sm mb-3">{week.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {week.tags?.map((tag, i) => (
                        <span key={i} className="badge badge-blue text-xs">{tag}</span>
                      ))}
                    </div>

                    {/* Resources */}
                    {week.resources?.map((res, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <span>{res.type === 'youtube' ? '▶️' : '📄'}</span>
                        <span>{res.title}</span>
                      </div>
                    ))}

                    {/* YouTube Videos */}
                    {loadingVideos && <p className="text-slate-500 text-xs">Loading videos…</p>}
                    {weekVideos[idx]?.map((v, i) => (
                      <a
                        key={i}
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 mt-2 p-2 rounded-xl bg-white/4 hover:bg-white/8 transition-colors group"
                      >
                        {v.thumbnail && (
                          <img src={v.thumbnail} alt={v.title} className="w-20 h-12 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                            {v.title}
                          </p>
                          <p className="text-xs text-slate-500">{v.channel}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="text-center">
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            📊 {t('results.view_dashboard')}
          </button>
        </div>
      </div>
    </div>
  );
}
