import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Scissors,
  Radio,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell.jsx';
import { SplitHeading } from '../components/ui/SplitHeading.jsx';
import { TactileCard } from '../components/ui/TactileCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useQueue } from '../context/QueueContext.jsx';
import { springSnappy, fadeInUp, staggerContainer } from '../lib/motion.js';

export const HomePage = () => {
  const { t, isGujarati } = useLanguage();
  const { barbers, todayStats, waitingTickets, onlineStatus, salonConfig } = useQueue();
  const navigate = useNavigate();

  // Compute live estimated wait time across all waiting patrons
  const workingBarbersCount = barbers.filter((b) => b.onDuty && b.status !== 'on_break').length;
  const totalWaitingMinutes = waitingTickets.reduce((sum, t) => sum + (t.totalDurationMin || 0), 0);
  const estimatedWaitMin =
    waitingTickets.length > 0
      ? Math.ceil(totalWaitingMinutes / Math.max(1, workingBarbersCount))
      : 0;

  const isOnlineOpen = onlineStatus?.isOpen !== false;

  const [activeTicket] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_active_ticket');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  return (
    <AppShell>
      <motion.div
        variants={staggerContainer(0.08, 0.05)}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-8 sm:space-y-12"
      >
        {/* Active Ticket Jump Banner */}
        {activeTicket?.ticketId && (
          <motion.div variants={fadeInUp} className="flex justify-center -mb-2">
            <Link
              to={`/status/${activeTicket.ticketId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pastel-pink/20 via-pastel-purple/15 to-pastel-softPink border border-pastel-pink/40 text-pastel-amethyst text-xs font-bold hover:border-pastel-pink hover:scale-102 shadow-pastel-sm transition-all min-h-[44px]"
            >
              <Radio className="w-3.5 h-3.5 text-pastel-pink animate-pulse" />
              <span>
                {t('home.viewActiveTicket', 'View Active Ticket ({token}) →').replace(
                  '{token}',
                  activeTicket.token || 'Active'
                )}
              </span>
            </Link>
          </motion.div>
        )}

        {/* Salon Status Alert Banner */}
        <motion.div variants={fadeInUp} className="flex justify-center">
          {isOnlineOpen ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-pastel-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{t('brand.hours')}</span>
              <span className="text-emerald-300">·</span>
              <span className="text-emerald-700 font-mono">
                {salonConfig?.openTime || '09:00'} - {salonConfig?.closeTime || '21:00'} IST
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-pastel-sm backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{t('home.closedWarning')}</span>
              <span className="text-amber-300">·</span>
              <span className="text-amber-700">
                Closes {onlineStatus?.closeTimeFormatted || '9:00 PM'}
              </span>
            </div>
          )}
        </motion.div>

        {/* Hero Section */}
        <motion.div variants={fadeInUp} className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pastel-pink/15 to-pastel-purple/15 border border-pastel-pink/30 text-pastel-amethyst text-xs font-semibold shadow-pastel-sm">
            <Sparkles className="w-3.5 h-3.5 text-pastel-pink" />
            <span>{t('home.heroTag')}</span>
          </div>

          <div>
            <SplitHeading
              text={t('brand.tagline')}
              as="h1"
              className="text-4xl sm:text-6xl font-serif text-pastel-amethyst tracking-tight justify-center leading-tight font-bold"
            />
          </div>

          <p className="text-amethyst-700 text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            {t('brand.subtitle')}
          </p>
        </motion.div>

        {/* Hero Pulse Card: Real-time Stats */}
        <motion.div variants={fadeInUp}>
          <TactileCard
            glow
            className="p-6 sm:p-8 bg-white/90 border border-purple-100/90 shadow-pastel-lg relative overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-6 sm:gap-8 divide-x divide-purple-100">
              {/* Stat 1: People Waiting */}
              <div className="flex flex-col items-center justify-center text-center px-2">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-amethyst-600 font-semibold flex items-center gap-1.5 mb-2">
                  <Users className="w-4 h-4 text-pastel-purple" />
                  {t('home.peopleWaiting')}
                </span>
                <span className="text-5xl sm:text-6xl font-serif text-pastel-amethyst font-bold tracking-tight leading-none">
                  {todayStats?.waitingCount ?? waitingTickets.length ?? 0}
                </span>
                <span className="text-[11px] text-amethyst-500 mt-2 font-medium">
                  {todayStats?.waitingCount === 1 ? 'customer in line' : 'customers in line'}
                </span>
              </div>

              {/* Stat 2: Est. Wait Time */}
              <div className="flex flex-col items-center justify-center text-center px-2">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-amethyst-600 font-semibold flex items-center gap-1.5 mb-2">
                  <Clock className="w-4 h-4 text-pastel-pink" />
                  {t('home.estWaitTime')}
                </span>
                <span className="text-5xl sm:text-6xl font-serif text-pastel-amethyst font-bold tracking-tight leading-none">
                  ~{estimatedWaitMin}
                  <span className="text-2xl sm:text-3xl text-pastel-pink font-sans font-medium ml-1">m</span>
                </span>
                <span className="text-[11px] text-amethyst-500 mt-2 font-medium">
                  {workingBarbersCount} {workingBarbersCount === 1 ? 'barber active' : 'barbers active'}
                </span>
              </div>
            </div>

            {/* Offline notice if closed */}
            {!isOnlineOpen && (
              <div className="mt-6 pt-5 border-t border-purple-100 flex items-start gap-3 bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">{t('home.closedNotice')}</p>
              </div>
            )}
          </TactileCard>
        </motion.div>

        {/* Dynamic Barber Chips */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono tracking-wider uppercase text-amethyst-600 font-bold flex items-center gap-2">
              <Scissors className="w-4 h-4 text-pastel-pink" />
              <span>{t('home.ourBarbers')}</span>
            </h2>
            <span className="text-[11px] text-amethyst-500 font-mono font-medium">
              {barbers.length} Stylists On Roster
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {barbers.map((barber) => {
              const isFree = barber.status === 'available';
              const isBusy = barber.status === 'busy';

              const statusColor = isFree
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isBusy
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200';

              const statusLabel = isFree
                ? t('status.free')
                : isBusy
                ? t('status.busy')
                : t('status.onBreak');

              return (
                <div
                  key={barber._id || barber.slug}
                  className="p-4 rounded-3xl bg-white/85 border border-purple-100/90 backdrop-blur-md flex items-center gap-3.5 hover:border-pastel-purple/50 shadow-pastel-sm hover:shadow-pastel-md transition-all group"
                >
                  {/* Stylist Avatar with initials */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pastel-softPink via-pastel-lavender to-pastel-porcelain border border-pastel-pink/30 flex items-center justify-center font-serif text-lg text-pastel-amethyst font-bold group-hover:scale-105 transition-transform flex-shrink-0 shadow-sm">
                    {barber.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-sm text-pastel-amethyst truncate block">
                        {barber.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-bold whitespace-nowrap ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-amethyst-600 truncate mt-0.5 font-medium">
                      {isGujarati ? barber.specialtyGu : barber.specialtyEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Primary Call to Action Button */}
        <motion.div variants={fadeInUp} className="pt-2 text-center">
          {isOnlineOpen ? (
            <motion.button
              type="button"
              onClick={() => navigate('/join')}
              whileHover={{ scale: 1.025, transition: springSnappy }}
              whileTap={{ scale: 0.975, transition: springSnappy }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full pastel-gradient-btn font-bold text-base shadow-pastel-lg hover:brightness-105 transition-all min-h-[48px] cursor-pointer"
            >
              <span>{t('home.joinCta')}</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </motion.button>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                disabled
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-pastel-lavender border border-purple-100 text-amethyst-400 font-semibold text-sm cursor-not-allowed min-h-[48px]"
              >
                <span>{t('home.closedWarning')}</span>
              </button>
              <p className="text-xs text-amethyst-600 max-w-md mx-auto">
                {t('home.closedNotice')}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AppShell>
  );
};

export default HomePage;
