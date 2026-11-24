import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  Plus,
  Maximize2,
  Minimize2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  Search,
} from 'lucide-react';
import { StaffPinGate } from '../components/auth/StaffPinGate.jsx';
import { TactileCard } from '../components/ui/TactileCard.jsx';
import { LanguageToggle } from '../components/ui/LanguageToggle.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useQueue } from '../context/QueueContext.jsx';
import { api, getStaffHeaders } from '../lib/api.js';
import { springSnappy } from '../lib/motion.js';

export const ReceptionPage = () => {
  return (
    <StaffPinGate>
      <ReceptionDashboard />
    </StaffPinGate>
  );
};

const ReceptionDashboard = () => {
  const { t, isGujarati } = useLanguage();
  const {
    barbers,
    services,
    waitingTickets,
    calledTickets,
    inChairTickets,
    refreshQueue,
  } = useQueue();

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Selected row for action bar
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Cancel confirmation prompt state
  const [ticketToCancel, setTicketToCancel] = useState(null);

  // Action loading indicators
  const [callingBarberSlug, setCallingBarberSlug] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Combine called and waiting tickets for the Waiting Queue view
  // Called tickets appear prominently at the top
  const queueList = useMemo(() => {
    const combined = [...calledTickets, ...waitingTickets];
    if (!searchQuery.trim()) return combined;
    const query = searchQuery.toLowerCase().trim();
    return combined.filter(
      (ticket) =>
        ticket.token?.toLowerCase().includes(query) ||
        ticket.customerName?.toLowerCase().includes(query) ||
        ticket.phone?.includes(query)
    );
  }, [calledTickets, waitingTickets, searchQuery]);

  const selectedTicket = [...calledTickets, ...waitingTickets].find(
    (item) => String(item._id) === String(selectedTicketId)
  );

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Call Next handler for a specific barber
  const handleCallNext = async (barberSlug) => {
    try {
      setCallingBarberSlug(barberSlug);
      await api.post(`/queue/barber/${barberSlug}/call-next`, {}, { headers: getStaffHeaders() });
      await refreshQueue();
    } catch (err) {
      alert(err.message || 'Could not call next customer');
    } finally {
      setCallingBarberSlug(null);
    }
  };

  // Mark No-Show handler
  const handleMarkNoShow = async (ticketId) => {
    try {
      setActionLoading(true);
      await api.post(`/queue/ticket/${ticketId}/no-show`, {}, { headers: getStaffHeaders() });
      if (selectedTicketId === ticketId) setSelectedTicketId(null);
      await refreshQueue();
    } catch (err) {
      alert(err.message || 'Failed to mark as no-show');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Ticket handler
  const handleCancelTicket = async (ticketId) => {
    try {
      setActionLoading(true);
      await api.post(`/queue/ticket/${ticketId}/cancel`, {}, { headers: getStaffHeaders() });
      if (selectedTicketId === ticketId) setSelectedTicketId(null);
      setTicketToCancel(null);
      await refreshQueue();
    } catch (err) {
      alert(err.message || 'Failed to cancel ticket');
    } finally {
      setActionLoading(false);
    }
  };

  // Current formatted date string
  const formattedTodayDate = new Intl.DateTimeFormat(isGujarati ? 'gu-IN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className={`min-h-screen flex flex-col bg-[#FAF8FC] text-pastel-amethyst selection:bg-pastel-pink/30 selection:text-pastel-amethyst ${
      isGujarati ? 'gujarati-text' : 'font-sans'
    }`}>
      {/* 1. TOP UTILITY BAR (Optimized for Reception & Landscape Tablet) */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-purple-100/90 shadow-pastel-sm px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Identity & Quick Navigation Pills */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pastel-pink/25 via-pastel-purple/20 to-pastel-softPink border border-pastel-pink/40 flex items-center justify-center text-pastel-amethyst shadow-pastel-sm">
                <Scissors className="w-4 h-4 -rotate-45" />
              </div>
              <div>
                <span className="font-serif text-lg text-pastel-amethyst font-semibold block leading-none">
                  {salonConfig?.salonNameEn || "Kuki's Saloon"}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-pastel-purple font-bold block mt-0.5">
                  {t('reception.title')}
                </span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 ml-4 pl-4 border-l border-purple-100 text-xs">
              <Link
                to="/barber/ravi"
                className="px-3.5 py-1.5 rounded-full bg-pastel-lavender hover:bg-purple-100/80 text-amethyst-700 transition-colors flex items-center gap-1.5 min-h-[36px] font-medium"
              >
                <span>Barber Chair</span>
                <ExternalLink className="w-3 h-3 text-pastel-purple" />
              </Link>
              <Link
                to="/display"
                className="px-3.5 py-1.5 rounded-full bg-pastel-lavender hover:bg-purple-100/80 text-amethyst-700 transition-colors flex items-center gap-1.5 min-h-[36px] font-medium"
              >
                <span>TV Board</span>
                <ExternalLink className="w-3 h-3 text-pastel-purple" />
              </Link>
            </div>
          </div>

          {/* Right: Date, Language Switcher & Fullscreen Button */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs font-mono text-amethyst-600 px-3.5 py-1.5 rounded-full bg-white border border-purple-100/80 shadow-pastel-sm font-semibold">
              {t('reception.today')} · {formattedTodayDate}
            </span>

            <LanguageToggle />

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2.5 rounded-2xl bg-white border border-purple-100 text-amethyst-600 hover:text-pastel-amethyst hover:border-pastel-purple transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shadow-pastel-sm cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Tablet Mode'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN LANDSCAPE SPLIT GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMN 1: BARBERS OVERVIEW (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Header row with Add Walk-In Button */}
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif text-xl sm:text-2xl text-pastel-amethyst font-bold flex items-center gap-2">
                <span>{t('reception.barbersOverview')}</span>
              </h2>

              <motion.button
                type="button"
                onClick={() => setShowWalkInModal(true)}
                whileHover={{ scale: 1.03, transition: springSnappy }}
                whileTap={{ scale: 0.97, transition: springSnappy }}
                className="min-h-[44px] px-4 py-2 rounded-full pastel-gradient-btn text-white font-bold text-xs flex items-center gap-1.5 shadow-pastel-sm cursor-pointer hover:brightness-105"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>{t('reception.addWalkIn')}</span>
              </motion.button>
            </div>

            {/* Stacked Barber Cards */}
            <div className="space-y-3">
              {barbers.map((barber) => {
                const isFree = barber.status === 'available';

                // Look for active ticket assigned to this barber
                const activeInChair = inChairTickets.find((t) => t.assignedBarber === barber.slug);
                const activeCalled = calledTickets.find((t) => t.assignedBarber === barber.slug);
                const activeTicket = activeInChair || activeCalled;

                // Check if an eligible waiting ticket exists for this barber
                const hasEligible = waitingTickets.some(
                  (t) => t.preferredBarber === barber.slug || t.preferredBarber === 'any'
                );

                const canCallNext = isFree && hasEligible && !callingBarberSlug;

                return (
                  <div
                    key={barber.slug}
                    className="p-4 rounded-3xl bg-white/90 border border-purple-100/90 backdrop-blur-xl space-y-3 hover:border-pastel-purple/50 transition-all shadow-pastel-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Barber Avatar & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pastel-softPink via-pastel-lavender to-pastel-porcelain border border-pastel-pink/30 flex items-center justify-center font-serif text-base text-pastel-amethyst font-bold flex-shrink-0 shadow-sm">
                          {barber.name.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <span className="font-semibold text-sm text-pastel-amethyst block leading-tight truncate">
                            {barber.name}
                          </span>
                          <span className="text-xs text-amethyst-600 block mt-0.5 truncate font-medium">
                            {activeInChair
                              ? `${t('reception.serving', 'Serving {token}').replace('{token}', activeInChair.token)}`
                              : activeCalled
                              ? `${t('reception.called', 'Called {token}').replace('{token}', activeCalled.token)}`
                              : isFree
                              ? t('status.available')
                              : t('status.onBreak')}
                          </span>
                        </div>
                      </div>

                      {/* Right Action: Call Next Button */}
                      <button
                        type="button"
                        onClick={() => handleCallNext(barber.slug)}
                        disabled={!canCallNext}
                        className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          canCallNext
                            ? 'bg-gradient-to-r from-pastel-pink to-pastel-purple text-white hover:brightness-105 shadow-pastel-sm cursor-pointer'
                            : 'bg-pastel-lavender text-amethyst-300 border border-purple-100/60 cursor-not-allowed'
                        }`}
                      >
                        {callingBarberSlug === barber.slug ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : (
                          <span>{t('reception.callNext')}</span>
                        )}
                      </button>
                    </div>

                    {/* Progress Bar when Active */}
                    {activeTicket && (
                      <div className="space-y-1 pt-1 border-t border-purple-100">
                        <div className="flex items-center justify-between text-[10px] font-mono text-amethyst-600 font-semibold">
                          <span>{activeTicket.customerName}</span>
                          <span>{activeTicket.totalDurationMin} min</span>
                        </div>
                        <div className="h-2 w-full bg-pastel-lavender rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              activeInChair ? 'bg-emerald-500' : 'bg-pastel-purple animate-pulse'
                            }`}
                            style={{ width: activeInChair ? '70%' : '30%' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: WAITING QUEUE BOARD (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            <TactileCard className="p-5 sm:p-6 space-y-4 bg-white/90 border border-purple-100/90 shadow-pastel-md">
              {/* Header with Active Count and Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl text-pastel-amethyst font-bold">
                    {t('reception.waitingQueue')}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-pastel-lavender text-pastel-purple text-xs font-mono font-bold border border-pastel-purple/30">
                    {queueList.length}
                  </span>
                </div>

                {/* Search Bar for Tablet & Desktop */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-amethyst-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search token / name..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-full bg-pastel-lavender/60 border border-purple-100 text-pastel-amethyst placeholder-amethyst-400 text-xs focus:outline-none focus:border-pastel-purple transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amethyst-400 hover:text-pastel-amethyst"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Table / Row Stack */}
              {queueList.length === 0 ? (
                // Friendly Empty State
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-base font-serif font-bold text-pastel-amethyst">
                    {t('reception.emptyQueue')}
                  </p>
                  <p className="text-xs text-amethyst-600 font-medium">
                    Front desk is clear. Walk-ins can be seated directly.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Table Column Labels */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-amethyst-500 font-bold border-b border-purple-100">
                    <span className="col-span-2">{t('reception.tokenCol')}</span>
                    <span className="col-span-4">{t('reception.customerCol')}</span>
                    <span className="col-span-3">{t('reception.servicesCol')}</span>
                    <span className="col-span-3 text-right">{t('reception.waitCol')}</span>
                  </div>

                  {/* Rows */}
                  {queueList.map((ticket) => {
                    const isSelected = selectedTicketId === ticket._id;
                    const isCalled = ticket.status === 'called';
                    const waitMin = ticket.estimatedWaitMin ?? 0;
                    const isHighWait = waitMin > 60;

                    return (
                      <div
                        key={ticket._id}
                        onClick={() => setSelectedTicketId(isSelected ? null : ticket._id)}
                        className={`grid grid-cols-12 gap-2 items-center px-3.5 py-3 rounded-2xl border transition-all cursor-pointer select-none text-xs ${
                          isSelected
                            ? 'bg-pastel-lavender/90 border-pastel-purple shadow-sm ring-1 ring-pastel-purple/30'
                            : isCalled
                            ? 'bg-emerald-50/70 border-emerald-200'
                            : 'bg-white/80 border-purple-100 hover:bg-pastel-lavender/40 hover:border-purple-200'
                        }`}
                      >
                        {/* Token + Status Badge */}
                        <div className="col-span-2 flex items-center gap-1.5 font-serif font-extrabold text-sm text-pastel-amethyst">
                          <span>{ticket.token}</span>
                          {isCalled && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-sans font-bold shadow-xs">
                              CALLED
                            </span>
                          )}
                        </div>

                        {/* Customer Name & Phone */}
                        <div className="col-span-4 min-w-0">
                          <span className="font-semibold text-pastel-amethyst truncate block leading-tight">
                            {ticket.customerName}
                          </span>
                          <span className="text-[11px] text-amethyst-500 font-mono block font-medium">
                            {ticket.phone}
                          </span>
                        </div>

                        {/* Services count or summary */}
                        <div className="col-span-3 min-w-0">
                          <span className="text-amethyst-700 block truncate font-medium">
                            {ticket.services?.map((s) => s.nameEn).join(', ') || '1 service'}
                          </span>
                          <span className="text-[10px] text-amethyst-400 font-mono block">
                            Pref: {ticket.preferredBarber || 'any'}
                          </span>
                        </div>

                        {/* Wait Badge & Inline Quick Triggers */}
                        <div className="col-span-3 flex items-center justify-end gap-2 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full font-mono text-[11px] border font-bold ${
                              isCalled
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : isHighWait
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-pastel-lavender text-amethyst-700 border-purple-100'
                            }`}
                          >
                            {isCalled ? '0m' : `~${waitMin}m`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ROW SELECTION BOTTOM ACTION BAR */}
              <div className="pt-3 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-amethyst-600 font-medium">
                  {selectedTicket ? (
                    <span className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-pastel-amethyst text-sm">
                        {selectedTicket.token}
                      </span>
                      <span>({selectedTicket.customerName}) selected</span>
                    </span>
                  ) : (
                    <span>Tap any ticket in table above to manage</span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* No-Show Button */}
                  <button
                    type="button"
                    onClick={() => selectedTicket && handleMarkNoShow(selectedTicket._id)}
                    disabled={!selectedTicket || selectedTicket.status !== 'called' || actionLoading}
                    className={`min-h-[44px] px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                      selectedTicket?.status === 'called' && !actionLoading
                        ? 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 cursor-pointer shadow-sm'
                        : 'border-purple-50 text-amethyst-300 bg-pastel-lavender/30 cursor-not-allowed'
                    }`}
                  >
                    {t('reception.noShowBtn')}
                  </button>

                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={() => selectedTicket && setTicketToCancel(selectedTicket)}
                    disabled={!selectedTicket || selectedTicket.status !== 'waiting' || actionLoading}
                    className={`min-h-[44px] px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                      selectedTicket?.status === 'waiting' && !actionLoading
                        ? 'border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 cursor-pointer shadow-sm'
                        : 'border-purple-50 text-amethyst-300 bg-pastel-lavender/30 cursor-not-allowed'
                    }`}
                  >
                    {t('reception.cancelBtn')}
                  </button>
                </div>
              </div>
            </TactileCard>
          </div>
        </div>
      </main>

      {/* 3. ADD WALK-IN MODAL (`AddWalkInModal`) */}
      <AnimatePresence>
        {showWalkInModal && (
          <AddWalkInModal
            services={services}
            barbers={barbers}
            onClose={() => setShowWalkInModal(false)}
            onSuccess={async () => {
              setShowWalkInModal(false);
              await refreshQueue();
            }}
          />
        )}
      </AnimatePresence>

      {/* 4. CANCEL TICKET CONFIRMATION MODAL */}
      <AnimatePresence>
        {ticketToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pastel-amethyst/30 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springSnappy}
              className="max-w-sm w-full p-6 rounded-3xl bg-white border border-purple-100 shadow-pastel-lg space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-pastel-amethyst">
                  {t('reception.cancelConfirmTitle', 'Cancel waiting ticket {token}?').replace(
                    '{token}',
                    ticketToCancel.token
                  )}
                </h3>
                <p className="text-xs text-amethyst-600 font-medium">
                  {t('reception.cancelConfirmDesc')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTicketToCancel(null)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-full bg-pastel-lavender hover:bg-purple-100 text-xs text-amethyst-700 font-bold transition-all min-h-[44px] cursor-pointer"
                >
                  {t('statusTracker.keepMySpot')}
                </button>
                <button
                  type="button"
                  onClick={() => handleCancelTicket(ticketToCancel._id)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-xs text-white font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>{t('actions.submit')}</span>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * AddWalkInModal: Receptionist rapid intake for in-salon patrons
 */
const AddWalkInModal = ({ services, barbers, onClose, onSuccess }) => {
  const { t, isGujarati } = useLanguage();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [preferredBarber, setPreferredBarber] = useState('any');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Auto-select first service by default for 5-second rapid intake
  React.useEffect(() => {
    if (services.length > 0 && selectedServiceIds.length === 0) {
      setSelectedServiceIds([services[0]._id]);
    }
  }, [services]);

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(raw);
    if (error) setError(null);
  };

  const toggleService = (id) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length === 1) return; // Keep at least 1
      setSelectedServiceIds(selectedServiceIds.filter((sId) => sId !== id));
    } else {
      if (selectedServiceIds.length >= 3) return;
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s._id));
  const totalDurationMin = selectedServices.reduce((sum, s) => sum + s.durationMin, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (customerName.trim().length < 2) {
      setError(t('errors.nameRequired'));
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError(t('errors.phoneRequired'));
      return;
    }
    if (selectedServiceIds.length === 0) {
      setError(t('errors.serviceRequired'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.post(
        '/queue/walkin',
        {
          customerName: customerName.trim(),
          phone,
          serviceIds: selectedServiceIds,
          preferredBarber,
        },
        { headers: getStaffHeaders() }
      );

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add walk-in ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pastel-amethyst/30 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={springSnappy}
        className="max-w-lg w-full p-6 sm:p-7 rounded-3xl bg-white border border-purple-100 shadow-pastel-lg space-y-5"
      >
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div>
            <h3 className="font-serif text-xl text-pastel-amethyst font-bold">
              {t('reception.walkInModalTitle')}
            </h3>
            <p className="text-xs text-amethyst-600 mt-0.5 font-medium">
              {t('reception.walkInModalSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl text-amethyst-400 hover:text-pastel-amethyst hover:bg-pastel-lavender transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-pastel-amethyst">
                {t('join.nameLabel')} <span className="text-pastel-pink">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Client Name"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/40 border border-purple-100 text-pastel-amethyst placeholder-amethyst-400 text-xs focus:outline-none focus:border-pastel-purple min-h-[44px] font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-pastel-amethyst">
                {t('join.phoneLabel')} <span className="text-pastel-pink">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="10-digit mobile"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/40 border border-purple-100 text-pastel-amethyst placeholder-amethyst-400 text-xs font-mono focus:outline-none focus:border-pastel-purple min-h-[44px]"
              />
            </div>
          </div>

          {/* Service multi-select pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-pastel-amethyst">
              Services (Select 1 to 3)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 scrollbar-none">
              {services.map((svc) => {
                const isSelected = selectedServiceIds.includes(svc._id);
                return (
                  <div
                    key={svc._id}
                    onClick={() => toggleService(svc._id)}
                    className={`p-2.5 rounded-2xl border text-xs cursor-pointer flex items-center justify-between select-none transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-pastel-pink/20 to-pastel-purple/20 border-pastel-pink text-pastel-amethyst font-bold'
                        : 'bg-white border-purple-100 text-amethyst-700 hover:border-pastel-purple/50'
                    }`}
                  >
                    <span className="truncate">{svc.nameEn}</span>
                    <span className="font-mono text-[10px] text-pastel-purple font-bold ml-1">
                      ₹{svc.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stylist Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-pastel-amethyst">Stylist Preference</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setPreferredBarber('any')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap min-h-[38px] border transition-all cursor-pointer ${
                  preferredBarber === 'any'
                    ? 'bg-gradient-to-r from-pastel-pink to-pastel-purple text-white border-transparent'
                    : 'bg-pastel-lavender border-purple-100 text-amethyst-700 hover:border-pastel-purple'
                }`}
              >
                Any Barber
              </button>

              {barbers.map((b) => (
                <button
                  key={b.slug}
                  type="button"
                  onClick={() => setPreferredBarber(b.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap min-h-[38px] border transition-all cursor-pointer ${
                    preferredBarber === b.slug
                      ? 'bg-gradient-to-r from-pastel-pink to-pastel-purple text-white border-transparent'
                      : 'bg-pastel-lavender border-purple-100 text-amethyst-700 hover:border-pastel-purple'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Bottom Bar: Total & Submit */}
          <div className="pt-3 border-t border-purple-100 flex items-center justify-between gap-3">
            <div className="text-xs">
              <span className="text-amethyst-500 font-mono font-medium">Total: </span>
              <span className="font-serif font-bold text-pastel-amethyst text-sm">
                ₹{totalPrice} ({totalDurationMin}m)
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full pastel-gradient-btn text-white font-bold text-xs hover:brightness-105 transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer shadow-pastel-sm"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <span>{t('reception.addToQueue')}</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReceptionPage;
