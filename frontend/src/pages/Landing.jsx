import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';

const FEATURES = [
  { icon: '🧠', key: 'feat1' },
  { icon: '🗺️', key: 'feat2' },
  { icon: '📊', key: 'feat3' },
];

const STATS = [
  { value: '5 min', label: 'Quiz time' },
  { value: '4 weeks', label: 'Learning plan' },
  { value: '3', label: 'Career paths' },
  { value: 'Free', label: 'Always' },
];

export default function Landing() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 text-center max-w-3xl mx-auto">
        {/* Background glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative fade-in-up">
          <span className="badge badge-blue mb-4">
            ✨ {t('landing.hero_tag')}
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mt-4 mb-6">
            {t('landing.hero_title')}{' '}
            <span className="gradient-text block">{t('landing.hero_title_highlight')}</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            {t('landing.hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/quiz')}
              className="btn-primary text-base"
              style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
            >
              🚀 {t('landing.cta')}
            </button>
            <button
              onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary text-base"
            >
              {t('landing.cta_secondary')} ↓
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-8 max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="card text-center py-5">
              <div className="text-2xl font-extrabold gradient-text">{value}</div>
              <div className="text-slate-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="how" className="px-4 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10 text-slate-200">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, key }, i) => (
            <div key={key} className="card group cursor-default">
              <div className="text-3xl mb-3">{icon}</div>
              <div className="text-xs font-semibold text-blue-400 mb-1">Step {i + 1}</div>
              <h3 className="font-bold text-slate-100 mb-2">{t(`landing.${key}_title`)}</h3>
              <p className="text-slate-400 text-sm">{t(`landing.${key}_desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-20 text-center">
        <div className="glass max-w-2xl mx-auto rounded-2xl p-10">
          <h2 className="text-3xl font-extrabold mb-4">
            Ready to find your <span className="gradient-text">dream career?</span>
          </h2>
          <p className="text-slate-400 mb-8">Join thousands of students discovering their potential.</p>
          <button onClick={() => navigate('/quiz')} className="btn-primary text-base">
            🚀 Start Free Assessment
          </button>
        </div>
      </section>

      <footer className="text-center text-slate-600 text-sm py-8">
        © 2025 IgniteLearn — Built with ❤️ for Bharat
      </footer>
    </div>
  );
}
