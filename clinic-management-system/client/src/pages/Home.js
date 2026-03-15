import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { t } from '../utils/translations';

const Home = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden relative">
      {/* Global Animated Background Elements (Under Everything) */}
      <div className="fixed top-0 left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none z-0" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-[30%] right-[20%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse pointer-events-none z-0" style={{ animationDelay: '4s' }}></div>

      {/* Navigation Header */}
      <nav className="fixed w-full top-0 z-50 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/home')}>
              <img 
                src="/clinic-logo.jpg" 
                alt="Agmas Clinic Logo" 
                className="h-14 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform duration-300 rounded-lg"
              />
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-300 hover:text-white font-medium transition-colors flex items-center group">
                <span className="mr-2 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">🏠</span>{t('home', language)}
              </a>
              <button onClick={() => navigate('/about')} className="text-gray-300 hover:text-white font-medium transition-colors flex items-center group">
                <span className="mr-2 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">ℹ️</span>{t('aboutUs', language)}
              </button>
              <button onClick={() => navigate('/services')} className="text-gray-300 hover:text-white font-medium transition-colors flex items-center group">
                <span className="mr-2 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">⚙️</span>{t('services', language)}
              </button>
              <button onClick={() => navigate('/contact')} className="text-gray-300 hover:text-white font-medium transition-colors flex items-center group">
                <span className="mr-2 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">📞</span>{t('contact', language)}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-medium flex items-center"
              >
                🔐 <span className="ml-2">{t('login', language)}</span>
              </button>
              <button
                onClick={() => navigate('/patient-register')}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 font-medium flex items-center shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] transform hover:-translate-y-0.5"
              >
                👤 <span className="ml-2">{t('register', language)}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 z-10 flex items-center min-h-[90vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-white drop-shadow-2xl">
              {t('welcomeTo', language)} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">{t('agmasMediumClinic', language)}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 font-medium leading-relaxed drop-shadow-md">
              {t('homeSubtitle', language)}
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => navigate('/patient-register')}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transform hover:-translate-y-1 flex items-center justify-center"
              >
                {t('getStartedToday', language)} <span className="ml-2 text-xl">→</span>
              </button>
              <button
                onClick={() => navigate('/services')}
                className="px-10 py-4 bg-white/5 border border-white/20 text-white rounded-2xl hover:bg-white/10 hover:border-white/40 transition-all duration-300 font-bold text-lg backdrop-blur-sm flex items-center justify-center"
              >
                {t('exploreServices', language)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-24 bg-slate-900/50 backdrop-blur-md border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Cutting-Edge Features</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto opacity-80">Everything you need for modern, secure, and efficient healthcare management.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] group">
              <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                <span className="text-4xl drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">📅</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Booking</h3>
              <p className="text-blue-100/70 leading-relaxed">
                Schedule appointments directly with doctors and manage your visits effortlessly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] group">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-500">
                <span className="text-4xl drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">🚶‍♂️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Live Queues</h3>
              <p className="text-emerald-100/70 leading-relaxed">
                Real-time queue tracking to instantly know your position and wait time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] group">
              <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30 group-hover:scale-110 transition-transform duration-500">
                <span className="text-4xl drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Digital Records</h3>
              <p className="text-purple-100/70 leading-relaxed">
                Securely access your medical history, prescriptions, and lab results 24/7.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] group">
              <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30 group-hover:scale-110 transition-transform duration-500">
                <span className="text-4xl drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">💊</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">E-Prescriptions</h3>
              <p className="text-red-100/70 leading-relaxed">
                Digital prescriptions sent directly to the pharmacy for rapid dispensing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative z-10 py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.15)]">
            {/* CTA Background Flare */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight relative z-10">Ready to Transform Your Health?</h2>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 opacity-90 max-w-3xl mx-auto relative z-10">
              Join thousands of patients who trust Agmas Clinic with their healthcare journey.
            </p>
            <button
              onClick={() => navigate('/patient-register')}
              className="relative z-10 px-12 py-5 bg-white text-blue-900 rounded-2xl hover:bg-blue-50 transition-all duration-300 font-extrabold text-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transform hover:-translate-y-1"
            >
              Sign Up For Free
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950 border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8 opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-white">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <span className="text-xl">🏥</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Agmas Clinic
              </span>
            </div>
            <div className="flex justify-center space-x-8 mb-8 text-sm font-medium text-gray-400">
              <a href="#home" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#home" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#home" className="hover:text-white transition-colors">Contact Support</a>
            </div>
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Agmas Medium Clinic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
