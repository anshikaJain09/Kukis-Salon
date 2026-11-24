import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  Sparkles,
  Users,
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  BellRing,
  CheckCircle2,
  Coffee,
  UserCheck,
  Home,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useQueue } from '../context/QueueContext.jsx';
import { LanguageToggle } from '../components/ui/LanguageToggle.jsx';
import socket from '../lib/socket.js';
import { playChime } from '../lib/audio.js';

export const DisplayTvPage = () => {
  const { t, isGujarati } = useLanguage();
  const {
    salonConfig,
    barbers,
    waitingTickets,
    calledTickets,
    inChairTickets,
    upNextTop5,
    isConnected,
  } = useQueue();

  // Clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('salon_tv_sound') === 'true';
    } catch {
      return false;
    }
  });
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active callout overlay state (lasts 6 seconds on ticket:called)
  const [highlightedCall, setHighlightedCall] = useState(null);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Socket listener for 'ticket:called'
  useEffect(() => {
    let timeoutId = null;

    const handleTicketCalled = (payload) => {
      setHighlightedCall(payload);

      if (soundEnabledRef.current) {
        playChime();
      }

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setHighlightedCall(null);
      }, 6000);
    };

    socket.on('ticket:called', handleTicketCalled);

    return () => {
      socket.off('ticket:called', handleTicketCalled);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Sound toggle handler
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    try {
      localStorage.setItem('salon_tv_sound', String(nextState));
    } catch {}

    if (nextState) {
      playChime(); // Unmutes & unlocks AudioContext immediately
    }
  };

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.warn('Could not enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen?.().catch((err) => {
        console.warn('Could not exit fullscreen:', err);
      });
    }
  };

  // Format digital clock
  const timeFormatted = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateFormatted = currentTime.toLocaleDateString(isGujarati ? 'gu-IN' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate active serving count
  const activeServingCount = barbers.filter((b) => {
    const hasInChair = inChairTickets.some((t) => t.assignedBarber === b.slug);
    const hasCalled = calledTickets.some((t) => t.assignedBarber === b.slug);
    return hasInChair || hasCalled;
  }).length;

  return (
    <div
      className={`min-h-screen w-full bg-[#FAF8FC] text-pastel-amethyst flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none relative overflow-x-hidden ${
        isGujarati ? 'gujarati-text' : 'font-sans'
      }`}
    >
      {/* Ambient background pastel glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[340px] bg-gradient-to-b from-pastel-pink/15 via-pastel-purple/10 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[320px] bg-gradient-to-t from-emerald-100/30 via-pastel-softPink/40 to-transparent blur-3xl pointer-events-none -z-0" />

      {/* Floating 6-Second Callout Alert Overlay */}
      <AnimatePresence>
        {highlightedCall && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl pointer-events-none"
          >
            <div className="bg-white/95 border-2 border-pastel-pink rounded-3xl p-5 sm:p-6 shadow-pastel-lg backdrop-blur-2xl text-center relative overflow-hidden">
              {/* Animated top highlight shimmer */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pastel-pink via-pastel-purple to-pastel-pink animate-shimmer" />

              <div className="flex items-center justify-center gap-2 mb-2 text-pastel-purple font-mono text-xs sm:text-sm tracking-wider uppercase font-bold">
                <BellRing className="w-5 h-5 text-pastel-pink animate-bounce" />
                <span>{t('tv.nowCalling')} · હવે બોલાવાય છે</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 my-2">
                <span className="text-5xl sm:text-7xl font-serif font-extrabold text-pastel-amethyst tracking-tight drop-shadow-sm">
                  {highlightedCall.token}
                </span>
                <span className="hidden sm:inline text-amethyst-300 text-3xl font-light">→</span>
                <span className="text-3xl sm:text-5xl font-serif text-pastel-purple font-bold">
                  {t('tv.goTo')} {highlightedCall.barberName}
                </span>
              </div>

              <p className="text-amethyst-800 text-base sm:text-lg font-semibold mt-1">
                {highlightedCall.customerName}
                <span className="text-amethyst-300 mx-2">·</span>
                <span className="font-gujarati text-pastel-amethyst">
                  {highlightedCall.barberName} પાસે ખુરશી પર પધારો
                </span>
              </p>

              {/* Auto-dismiss progress countdown line */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 6, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-pastel-pink to-pastel-purple"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER BAR */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-purple-100">
        {/* Left: Brand & Live Heartbeat */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/"
            title="Return to Home"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-pastel-pink/25 via-pastel-purple/20 to-pastel-softPink border border-pastel-pink/40 flex items-center justify-center text-pastel-amethyst shadow-pastel-sm hover:scale-105 transition-transform cursor-pointer"
          >
            <Scissors className="w-6 h-6 sm:w-7 sm:h-7 -rotate-45" />
          </Link>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-serif text-pastel-amethyst tracking-tight font-bold">
                {salonConfig?.salonNameEn || "Kuki's Saloon"}
              </h1>
              <span className="text-xs text-purple-300 font-serif hidden md:inline">|</span>
              <span className="text-sm font-gujarati text-amethyst-700 font-medium hidden md:inline">
                {salonConfig?.salonNameGu || 'કુકીઝ સલૂન'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {/* Pulsating green Live badge */}
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{t('tv.liveBadge')}</span>
              </div>
              <span className="text-purple-300 text-xs hidden sm:inline">·</span>
              <span className="text-amethyst-600 text-xs hidden sm:inline font-medium">
                {salonConfig?.taglineEn || 'Precision Grooming Lounge'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clock & Kiosk Controls */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Real-time Clock readout */}
          <div className="flex flex-col items-end px-4 py-1.5 rounded-2xl bg-white border border-purple-100 shadow-pastel-sm">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-pastel-amethyst tracking-wider tabular-nums leading-tight">
              {timeFormatted}
            </span>
            <span className="text-[11px] font-bold text-amethyst-500 uppercase tracking-widest leading-none mt-0.5">
              {dateFormatted}
            </span>
          </div>

          {/* Sound Toggle (Audible Turn Chime) */}
          <button
            type="button"
            onClick={toggleSound}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-pastel-pink/20 border-pastel-pink/40 text-pastel-amethyst shadow-pastel-sm'
                : 'bg-white border-purple-100 text-amethyst-500 hover:text-pastel-amethyst'
            }`}
            title={soundEnabled ? 'Audio Chime Enabled' : 'Click to Enable Audio Chime'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-pastel-pink" />
                <span className="hidden sm:inline">{t('tv.soundOn')}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-amethyst-400" />
                <span className="hidden sm:inline">{t('tv.soundMuted')}</span>
              </>
            )}
          </button>

          {/* Language Switcher */}
          <LanguageToggle />

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-white border border-purple-100 text-amethyst-500 hover:text-pastel-amethyst hover:border-pastel-purple transition-all shadow-pastel-sm cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={isFullscreen ? t('tv.exitFullscreen') : t('tv.fullscreen')}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Home Link */}
          <Link
            to="/"
            className="p-2.5 rounded-2xl bg-white border border-purple-100 text-amethyst-500 hover:text-pastel-amethyst hover:border-pastel-purple transition-all shadow-pastel-sm min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* MAIN TWIN GLASS SPLIT (Now Serving vs. Up Next) */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 my-5 sm:my-6">
        {/* LEFT COLUMN: NOW SERVING (60% / col-span-7) */}
        <section className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-pastel-pink/20 border border-pastel-pink/30 text-pastel-pink">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif text-pastel-amethyst font-bold leading-tight">
                  {t('tv.nowServing')}
                </h2>
                <span className="text-xs font-gujarati text-amethyst-600 font-medium">
                  {t('tv.nowServingGu')}
                </span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-white border border-purple-100 text-xs font-mono text-amethyst-700 font-semibold shadow-pastel-sm">
              <span className="text-pastel-purple font-bold">{activeServingCount}</span> /{' '}
              {barbers.length} Active Chairs
            </div>
          </div>

          {/* Barber Stations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            {barbers.map((barber) => {
              // Locate active ticket: in chair takes priority over called
              const activeInChair = inChairTickets.find((t) => t.assignedBarber === barber.slug);
              const activeCalled = calledTickets.find((t) => t.assignedBarber === barber.slug);
              const activeTicket =
                activeInChair ||
                activeCalled ||
                (barber.currentTicketId && typeof barber.currentTicketId === 'object'
                  ? barber.currentTicketId
                  : null);

              const isCalled = activeTicket?.status === 'called';
              const isInChair = activeTicket?.status === 'in_chair';
              const isOnBreak = barber.status === 'on_break';
              const isAvailable = barber.status === 'available' && !activeTicket;

              // Check if this barber is the one in the 6-second highlight callout
              const isHighlightActive = highlightedCall?.assignedBarber === barber.slug;

              return (
                <div
                  key={barber._id || barber.slug}
                  className={`rounded-3xl p-5 flex flex-col justify-between transition-all duration-500 relative overflow-hidden backdrop-blur-xl ${
                    isHighlightActive
                      ? 'bg-gradient-to-b from-pastel-softPink to-white border-2 border-pastel-pink ring-4 ring-pastel-pink/20 shadow-pastel-lg scale-[1.02]'
                      : 'bg-white/90 border border-purple-100/90 shadow-pastel-md hover:border-pastel-purple/40'
                  }`}
                >
                  {/* Subtle top inner glow for highlighted chair */}
                  {isHighlightActive && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pastel-pink via-pastel-purple to-pastel-pink animate-pulse" />
                  )}

                  {/* Station Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-purple-100 pb-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-pastel-amethyst tracking-wide">
                        {barber.name}
                      </h3>
                      <p className="text-xs text-amethyst-600 font-medium">
                        {isGujarati ? barber.specialtyGu : barber.specialtyEn}
                      </p>
                    </div>

                    {/* Status Pill Badge */}
                    <div>
                      {isCalled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pastel-pink/20 border border-pastel-pink/50 text-pastel-amethyst text-[11px] font-mono font-bold animate-pulse">
                          <BellRing className="w-3 h-3 text-pastel-pink" />
                          <span>{t('tv.callingStatus')}</span>
                        </span>
                      )}
                      {isInChair && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-mono font-bold">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>{t('tv.inChairStatus')}</span>
                        </span>
                      )}
                      {isOnBreak && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-mono font-bold">
                          <Coffee className="w-3 h-3 text-amber-600" />
                          <span>{t('tv.onBreak')}</span>
                        </span>
                      )}
                      {isAvailable && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pastel-lavender border border-purple-100 text-amethyst-700 text-[11px] font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{t('status.available')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Station Centerpiece: Active Customer or Idle State */}
                  <div className="py-6 my-auto text-center">
                    {activeTicket ? (
                      <div className="space-y-2">
                        <span className="text-[11px] uppercase font-mono tracking-widest text-amethyst-500 font-bold">
                          {isCalled ? t('tv.nowCalling') : t('tv.now')}
                        </span>
                        {/* Huge high-contrast token */}
                        <div className="text-5xl sm:text-6xl lg:text-7xl font-serif font-extrabold text-pastel-purple tracking-tight drop-shadow-xs">
                          {activeTicket.token}
                        </div>
                        {/* Customer Name */}
                        <p className="text-xl sm:text-2xl font-bold text-pastel-amethyst tracking-tight">
                          {activeTicket.customerName}
                        </p>
                      </div>
                    ) : isOnBreak ? (
                      <div className="space-y-2 py-4">
                        <Coffee className="w-10 h-10 text-amber-500 mx-auto" />
                        <p className="text-base font-serif font-bold text-amber-900">
                          {t('tv.onBreak')}
                        </p>
                        <p className="text-xs text-amethyst-500 font-medium">
                          {t('tv.onBreakSub')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                        <p className="text-lg font-serif font-bold text-emerald-700">
                          {t('tv.chairReady')}
                        </p>
                        <p className="text-xs text-amethyst-700 font-gujarati font-medium">
                          {t('tv.chairReadyGu')}
                        </p>
                        <p className="text-[11px] text-amethyst-500 font-sans font-medium">
                          {t('tv.chairReadySub')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Station Footer / Service readout */}
                  <div className="border-t border-purple-100 pt-3 text-xs">
                    {activeTicket ? (
                      <div className="flex items-center justify-between text-pastel-amethyst">
                        <span className="truncate text-amethyst-700 font-medium">
                          {activeTicket.services
                            ?.map((s) => (isGujarati ? s.nameGu : s.nameEn))
                            .join(', ') || 'Service'}
                        </span>
                        <span className="font-mono text-pastel-purple font-bold ml-2 shrink-0">
                          {activeTicket.totalDurationMin}m
                        </span>
                      </div>
                    ) : (
                      <div className="text-amethyst-400 text-center font-mono text-[11px] font-semibold">
                        Station {barber.name} · Open
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT COLUMN: UP NEXT (40% / col-span-5) */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-pastel-purple/20 border border-pastel-purple/30 text-pastel-purple">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif text-pastel-amethyst font-bold leading-tight">
                  {t('tv.upNext')}
                </h2>
                <span className="text-xs font-gujarati text-amethyst-600 font-medium">
                  {t('tv.upNextGu')}
                </span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-white border border-purple-100 text-xs font-mono text-amethyst-700 font-semibold shadow-pastel-sm">
              <span className="text-pastel-purple font-bold">{waitingTickets.length}</span>{' '}
              {t('tv.peopleWaitingBadge', { count: '' }).trim()}
            </div>
          </div>

          {/* Upcoming Tickets Container */}
          <div className="bg-white/90 border border-purple-100/90 rounded-3xl p-4 sm:p-5 flex-1 flex flex-col justify-between backdrop-blur-xl shadow-pastel-md">
            {waitingTickets.length > 0 ? (
              <div className="space-y-2.5 flex-1 flex flex-col justify-around">
                {(upNextTop5.length > 0 ? upNextTop5 : waitingTickets.slice(0, 5)).map(
                  (ticket, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <div
                        key={ticket._id || ticket.token}
                        className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all ${
                          isFirst
                            ? 'bg-gradient-to-r from-pastel-pink/15 via-pastel-purple/10 to-pastel-softPink border border-pastel-pink/40 shadow-pastel-sm'
                            : 'bg-pastel-porcelain border border-purple-100/80'
                        }`}
                      >
                        {/* Rank + Token Badge */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                              isFirst
                                ? 'bg-pastel-pink text-white shadow-xs'
                                : 'bg-pastel-lavender text-pastel-amethyst border border-purple-100'
                            }`}
                          >
                            {idx + 1}
                          </span>

                          <div>
                            <span className="text-xl sm:text-2xl font-serif font-extrabold text-pastel-amethyst tracking-tight">
                              {ticket.token}
                            </span>
                          </div>
                        </div>

                        {/* Customer Name & Preferred Barber */}
                        <div className="flex-1 mx-3 text-left">
                          <p className="text-base sm:text-lg font-bold text-pastel-amethyst truncate max-w-[160px] sm:max-w-[200px]">
                            {ticket.customerName}
                          </p>
                          <p className="text-xs text-amethyst-600 font-medium">
                            {ticket.preferredBarber === 'any'
                              ? t('join.anyBarber')
                              : `${t('tv.with')} ${
                                  barbers.find((b) => b.slug === ticket.preferredBarber)?.name ||
                                  ticket.preferredBarber
                                }`}
                          </p>
                        </div>

                        {/* Estimated Wait Pill */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-purple-100 text-pastel-purple font-mono font-bold text-xs sm:text-sm shrink-0 shadow-xs">
                          <Clock className="w-3.5 h-3.5 text-pastel-pink" />
                          <span>
                            ~{ticket.estimatedWaitMin || ticket.totalDurationMin || 10}m
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              /* Empty Queue State */
              <div className="my-auto text-center py-12 px-4 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-pastel-lavender border border-purple-100 flex items-center justify-center text-pastel-purple shadow-pastel-sm">
                  <Sparkles className="w-8 h-8 text-pastel-pink" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-pastel-amethyst">
                  {t('tv.emptyUpNext')}
                </h3>
                <p className="text-base font-gujarati font-semibold text-pastel-purple">
                  {t('tv.emptyUpNextGu')}
                </p>
                <p className="text-xs text-amethyst-600 font-sans max-w-sm mx-auto font-medium">
                  {t('tv.emptyUpNextSub')}
                </p>
              </div>
            )}

            {/* Total Waiting summary strip */}
            <div className="mt-3 pt-3 border-t border-purple-100 flex items-center justify-between text-xs text-amethyst-600 font-medium">
              <span className="font-gujarati">
                કુલ પ્રતીક્ષારત ગ્રાહકો: {waitingTickets.length}
              </span>
              <span className="font-mono text-amethyst-500">
                Avg Service: ~{salonConfig?.defaultServiceTime || 20} min
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM AMBIENT FOOTER BAR */}
      <footer className="relative z-10 pt-4 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amethyst-600">
        <div className="flex items-center gap-2">
          <span className="font-serif text-pastel-amethyst text-sm font-semibold">Kuki's Saloon</span>
          <span>·</span>
          <span>{t('brand.hours')}</span>
        </div>

        {/* Center Tagline */}
        <div className="flex items-center gap-2 text-center text-pastel-amethyst font-semibold">
          <span>{t('tv.thankYouNotice')}</span>
          <span className="text-pastel-pink font-serif">✂</span>
          <span className="font-gujarati text-pastel-amethyst">{t('tv.thankYouNoticeGu')}</span>
        </div>

        {/* Live sync heartbeat */}
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
          <span className="relative flex h-2 w-2">
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-500 shadow-sm' : 'bg-slate-400'
              }`}
            />
          </span>
          <span className={isConnected ? 'text-emerald-700' : 'text-slate-500'}>
            {isConnected ? 'LIVE SYNC ACTIVE' : 'CONNECTING...'}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default DisplayTvPage;
