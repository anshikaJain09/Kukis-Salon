import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  User,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell.jsx';
import { TactileCard } from '../components/ui/TactileCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useQueue } from '../context/QueueContext.jsx';
import { springSnappy } from '../lib/motion.js';

export const JoinQueuePage = () => {
  const { t, isGujarati } = useLanguage();
  const { services, barbers, waitingTickets, joinOnline, onlineStatus } = useQueue();
  const navigate = useNavigate();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [preferredBarber, setPreferredBarber] = useState('any');

  // UI / Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Phone input handler enforcing strict numeric 10-digits
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(raw);
    if (formError) setFormError(null);
  };

  const handleNameChange = (e) => {
    setCustomerName(e.target.value);
    if (formError) setFormError(null);
  };

  // Service Selection toggler (Max 3)
  const toggleService = (id) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter((sId) => sId !== id));
      if (formError) setFormError(null);
    } else {
      if (selectedServiceIds.length >= 3) {
        setFormError(t('errors.serviceMax'));
        return;
      }
      setSelectedServiceIds([...selectedServiceIds, id]);
      if (formError) setFormError(null);
    }
  };

  const clearAllServices = () => {
    setSelectedServiceIds([]);
    if (formError) setFormError(null);
  };

  // Calculations
  const selectedServices = services.filter((s) => selectedServiceIds.includes(s._id));
  const totalDurationMin = selectedServices.reduce((sum, s) => sum + s.durationMin, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // Dynamic wait time estimate
  const workingBarbers = barbers.filter((b) => b.onDuty && b.status !== 'on_break').length;
  let estimatedWaitMin = 0;
  if (preferredBarber === 'any') {
    const minutesAhead = waitingTickets.reduce((sum, t) => sum + (t.totalDurationMin || 0), 0);
    estimatedWaitMin = Math.ceil(minutesAhead / Math.max(1, workingBarbers));
  } else {
    const competing = waitingTickets.filter(
      (t) => t.preferredBarber === preferredBarber || t.preferredBarber === 'any'
    );
    const minutesAhead = competing.reduce((sum, t) => sum + (t.totalDurationMin || 0), 0);
    estimatedWaitMin = Math.ceil(minutesAhead / 1);
  }

  // Validation
  const isNameValid = customerName.trim().length >= 2;
  const isPhoneValid = /^\d{10}$/.test(phone);
  const isServicesValid = selectedServiceIds.length >= 1 && selectedServiceIds.length <= 3;
  const isFormValid = isNameValid && isPhoneValid && isServicesValid;

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!isNameValid) {
      setFormError(t('errors.nameRequired'));
      return;
    }
    if (!isPhoneValid) {
      setFormError(t('errors.phoneRequired'));
      return;
    }
    if (!isServicesValid) {
      setFormError(t('errors.serviceRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await joinOnline({
        customerName: customerName.trim(),
        phone,
        serviceIds: selectedServiceIds,
        preferredBarber,
      });

      // Persist active ticket in localStorage
      if (res?.ticket?._id) {
        localStorage.setItem(
          'salon_active_ticket',
          JSON.stringify({ ticketId: res.ticket._id, token: res.ticket.token })
        );
        navigate(`/status/${res.ticket._id}`);
      } else {
        throw new Error('Missing ticket confirmation from server');
      }
    } catch (err) {
      console.error('[Join Error]', err);
      const msg = err.response?.data?.message || err.message || 'Failed to join queue. Please retry.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell hideNav={false}>
      <div className="max-w-3xl mx-auto pb-36 space-y-8">
        {/* Navigation Header */}
        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-amethyst-700 hover:text-pastel-amethyst transition-colors min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 text-pastel-purple" />
            <span>{t('nav.back')}</span>
          </Link>

          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-pastel-amethyst font-bold tracking-tight leading-tight">
              {t('join.title')}
            </h1>
            <p className="text-sm text-amethyst-700 font-normal mt-1">
              {t('join.subtitle')}
            </p>
          </div>
        </div>

        {/* Global Error Notice if online joining closed */}
        {onlineStatus?.isOpen === false && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-pastel-sm">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="font-medium">{t('home.closedNotice')}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Customer Details */}
          <TactileCard className="p-6 space-y-5 bg-white/90 border border-purple-100/90 shadow-pastel-md">
            <h2 className="text-xs font-mono uppercase tracking-wider text-pastel-purple font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-pastel-pink" />
              <span>Step 1 · Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-pastel-amethyst">
                  {t('join.nameLabel')} <span className="text-pastel-pink">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerName}
                    onChange={handleNameChange}
                    placeholder={t('join.namePlaceholder')}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-purple-100 text-pastel-amethyst placeholder-amethyst-300 text-sm font-medium focus:outline-none focus:border-pastel-purple focus:ring-2 focus:ring-pastel-purple/20 shadow-pastel-sm transition-all min-h-[46px]"
                  />
                  {isNameValid && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-pastel-amethyst">
                  {t('join.phoneLabel')} <span className="text-pastel-pink">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder={t('join.phonePlaceholder')}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-purple-100 text-pastel-amethyst placeholder-amethyst-300 text-sm font-mono tracking-wider focus:outline-none focus:border-pastel-purple focus:ring-2 focus:ring-pastel-purple/20 shadow-pastel-sm transition-all min-h-[46px]"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isPhoneValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="text-[10px] font-mono text-amethyst-400 font-semibold">
                        {phone.length}/10
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TactileCard>

          {/* SECTION 2: Service Selection (Max 3) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold text-pastel-amethyst">
                  {t('join.servicesTitle')}
                </h2>
                <p className="text-xs text-amethyst-600 mt-0.5">
                  {t('join.servicesSubtitle')} ({selectedServiceIds.length}/3)
                </p>
              </div>

              {selectedServiceIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllServices}
                  className="text-xs text-amethyst-600 hover:text-pastel-pink flex items-center gap-1 min-h-[44px] px-2 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('join.clearAll')}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service) => {
                const isSelected = selectedServiceIds.includes(service._id);

                return (
                  <motion.div
                    key={service._id}
                    onClick={() => toggleService(service._id)}
                    whileHover={{ scale: 1.01, transition: springSnappy }}
                    whileTap={{ scale: 0.985, transition: springSnappy }}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[76px] select-none ${
                      isSelected
                        ? 'bg-gradient-to-r from-pastel-pink/15 via-pastel-purple/10 to-pastel-softPink border-pastel-pink shadow-pastel-sm ring-1 ring-pastel-pink/40'
                        : 'bg-white/85 border-purple-100 hover:border-pastel-purple/50 shadow-pastel-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 text-pastel-pink">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 fill-pastel-pink text-white" />
                        ) : (
                          <Circle className="w-5 h-5 text-purple-200" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-pastel-amethyst">
                            {service.nameEn}
                          </span>
                          <span className="text-xs text-amethyst-600 font-gujarati">
                            · {service.nameGu}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-amethyst-600 mt-1">
                          <span className="flex items-center gap-1 font-mono text-[11px] font-medium">
                            <Clock className="w-3 h-3 text-pastel-purple" />
                            {service.durationMin} {t('queue.minutesSuffix')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-serif font-bold text-pastel-amethyst block">
                        ₹{service.price}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Stylist Selection */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-pastel-amethyst">
                {t('join.barberTitle')}
              </h2>
              <p className="text-xs text-amethyst-600 mt-0.5">
                {t('join.barberSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Option: Any Barber (Fastest) */}
              <motion.div
                onClick={() => setPreferredBarber('any')}
                whileHover={{ scale: 1.015, transition: springSnappy }}
                whileTap={{ scale: 0.985, transition: springSnappy }}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex sm:flex-col justify-between gap-3 min-h-[96px] select-none ${
                  preferredBarber === 'any'
                    ? 'bg-gradient-to-r sm:bg-gradient-to-b from-pastel-pink/15 via-pastel-purple/10 to-pastel-softPink border-pastel-pink shadow-pastel-sm ring-1 ring-pastel-pink/40'
                    : 'bg-white/85 border-purple-100 hover:border-pastel-purple/50 shadow-pastel-sm'
                }`}
              >
                <div className="flex items-center sm:flex-col sm:items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pastel-pink/20 border border-pastel-pink/40 flex items-center justify-center text-pastel-pink">
                    <Zap className="w-4 h-4 fill-pastel-pink text-pastel-pink" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-pastel-amethyst block leading-tight">
                      {t('join.anyBarber')}
                    </span>
                    <span className="text-[11px] text-amethyst-600 block mt-0.5 font-medium">
                      {t('join.anyBarberSub')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end sm:justify-start">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    Fastest Track
                  </span>
                </div>
              </motion.div>

              {/* Individual Barbers */}
              {barbers.map((barber) => {
                const isSelected = preferredBarber === barber.slug;
                const isFree = barber.status === 'available';

                return (
                  <motion.div
                    key={barber.slug}
                    onClick={() => setPreferredBarber(barber.slug)}
                    whileHover={{ scale: 1.015, transition: springSnappy }}
                    whileTap={{ scale: 0.985, transition: springSnappy }}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer flex sm:flex-col justify-between gap-3 min-h-[96px] select-none ${
                      isSelected
                        ? 'bg-gradient-to-r sm:bg-gradient-to-b from-pastel-pink/15 via-pastel-purple/10 to-pastel-softPink border-pastel-pink shadow-pastel-sm ring-1 ring-pastel-pink/40'
                        : 'bg-white/85 border-purple-100 hover:border-pastel-purple/50 shadow-pastel-sm'
                    }`}
                  >
                    <div className="flex items-center sm:flex-col sm:items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-pastel-lavender border border-purple-100 flex items-center justify-center font-serif text-sm font-bold text-pastel-amethyst">
                        {barber.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-pastel-amethyst block leading-tight">
                          {barber.name}
                        </span>
                        <span className="text-[11px] text-amethyst-600 block mt-0.5 truncate max-w-[140px] font-medium">
                          {isGujarati ? barber.specialtyGu : barber.specialtyEn}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-start">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                          isFree
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isFree ? t('status.free') : t('status.busy')}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Form Error Message */}
          <AnimatePresence>
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3 font-medium shadow-pastel-sm"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{formError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STICKY GLASS BOTTOM SHEET (DRAWER) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl bg-white/92 border-t border-purple-100/90 p-4 sm:p-5 shadow-pastel-lg">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Cumulative Metrics */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 sm:gap-8">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amethyst-500 block font-semibold">
                    {t('join.totalLabel')}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-serif text-pastel-amethyst font-bold">
                      ₹{totalPrice}
                    </span>
                    <span className="text-xs text-amethyst-600 font-mono font-medium">
                      · {totalDurationMin}m
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-purple-100 hidden sm:block" />

                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amethyst-500 block font-semibold">
                    {t('join.expectedWaitLabel')}
                  </span>
                  <div className="flex items-baseline gap-1 text-pastel-amethyst">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-pastel-purple">
                      ~{estimatedWaitMin}
                    </span>
                    <span className="text-xs text-amethyst-600 font-sans font-medium">
                      {t('queue.minutesSuffix')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm / Submit Button */}
              <motion.button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                whileHover={isFormValid && !isSubmitting ? { scale: 1.02, transition: springSnappy } : {}}
                whileTap={isFormValid && !isSubmitting ? { scale: 0.98, transition: springSnappy } : {}}
                className={`w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  isFormValid && !isSubmitting
                    ? 'pastel-gradient-btn text-white shadow-pastel-md cursor-pointer hover:brightness-105'
                    : 'bg-pastel-lavender text-amethyst-400 border border-purple-100 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t('join.submitting')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('join.confirmCta')}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
};

export default JoinQueuePage;
