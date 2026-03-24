import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LANG_OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'te', label: 'తె' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform">
            🚀
          </div>
          <span className="font-extrabold text-lg gradient-text">IgniteLearn</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/8">
            {LANG_OPTIONS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => changeLanguage(code)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  language === code
                    ? 'bg-brand-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="hidden sm:flex btn-secondary text-sm py-1.5 px-3"
              >
                {t('nav.dashboard')}
              </Link>
              <button onClick={handleLogout} className="text-slate-400 hover:text-white text-sm transition-colors">
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link to="/quiz" className="btn-primary text-sm py-2 px-4">
              {t('nav.quiz')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
