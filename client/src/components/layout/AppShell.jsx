import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, Sparkles } from 'lucide-react';
import { LanguageToggle } from '../ui/LanguageToggle.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useQueue } from '../../context/QueueContext.jsx';

export const AppShell = ({ children, hideNav = false }) => {
  const { t, isGujarati } = useLanguage();
  const { isConnected, salonConfig } = useQueue();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/join', label: t('nav.joinQueue') },
    { to: '/reception', label: t('nav.reception') },
    { to: '/barber/ravi', label: t('nav.barberStation') },
    { to: '/display', label: t('nav.displayTv') },
    { to: '/admin', label: t('nav.admin') },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#FAF8FC] text-pastel-amethyst selection:bg-pastel-pink/30 selection:text-pastel-amethyst relative ${
        isGujarati ? 'gujarati-text' : 'font-sans'
      }`}
    >
      {/* Top Translucent Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-purple-100/80 shadow-pastel-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-3">
          {/* Brand Identity & Modern Pastel Badge */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none min-h-[44px] min-w-[44px]"
            aria-label="Kuki's Saloon Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pastel-pink/25 via-pastel-purple/20 to-pastel-softPink border border-pastel-pink/40 flex items-center justify-center text-pastel-amethyst shadow-pastel-sm group-hover:scale-105 group-hover:border-pastel-pink transition-all">
              <Scissors className="w-5 h-5 -rotate-45 text-pastel-amethyst" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl tracking-tight text-pastel-amethyst group-hover:text-purple-700 transition-colors leading-tight font-semibold">
                {salonConfig?.salonNameEn || "Kuki's Saloon"}
              </span>
              <span className="text-[11px] font-gujarati text-amethyst-700 group-hover:text-amethyst-900 leading-tight">
                {salonConfig?.salonNameGu || 'કુકીઝ સલૂન'}
              </span>
            </div>
          </Link>

          {/* Quick Route Nav (Desktop Viewports) */}
          {!hideNav && (
            <nav className="hidden lg:flex items-center gap-1 bg-pastel-lavender/90 p-1.5 rounded-full border border-purple-100/80 text-xs shadow-inner">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`min-h-[40px] px-3.5 py-2 rounded-full inline-flex items-center transition-all ${
                      isActive
                        ? 'bg-white text-pastel-amethyst font-bold border border-pastel-purple/30 shadow-pastel-sm'
                        : 'text-amethyst-700 hover:text-pastel-amethyst hover:bg-white/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Controls: Live Sync Indicator + Language Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Socket Status Pill */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-purple-100/80 text-xs select-none shadow-pastel-sm min-h-[44px]"
              title={isConnected ? 'Live sync connected' : 'Connecting to live socket...'}
            >
              <span className="relative flex h-2 w-2">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? 'bg-emerald-500 shadow-sm' : 'bg-slate-400'
                  }`}
                />
              </span>
              <span
                className={`text-[11px] font-medium hidden sm:inline ${
                  isConnected ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                }`}
              >
                {isConnected ? t('system.connected') : t('system.offline')}
              </span>
            </div>

            {/* Language Switcher Pill */}
            <LanguageToggle />
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        {!hideNav && (
          <div className="lg:hidden flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-t border-purple-100/60 scrollbar-none text-xs bg-pastel-lavender/60">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap text-xs inline-flex items-center transition-all ${
                    isActive
                      ? 'bg-white text-pastel-amethyst font-bold border border-pastel-purple/30 shadow-pastel-sm'
                      : 'text-amethyst-700 hover:text-pastel-amethyst hover:bg-white/40'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 z-10 relative">
        {children}
      </main>

      {/* Elegant Minimalist Pastel Footer */}
      <footer className="border-t border-purple-100/80 py-6 text-center text-xs text-amethyst-600 mt-auto bg-white/70 backdrop-blur-md z-10 relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amethyst-700">
            <Sparkles className="w-4 h-4 text-pastel-pink" />
            <span className="font-serif text-sm tracking-wide text-pastel-amethyst font-medium">
              {salonConfig?.salonNameEn || "Kuki's Saloon"}
            </span>
            <span className="text-purple-300">·</span>
            <span className="text-xs">{t('brand.hours')}</span>
          </div>
          <p className="text-amethyst-500 text-[11px]">{t('footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
