import { useState, useRef, useContext, useId, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '@/context/AuthContext';
import useCanvasCursor from '@/hooks/useCanvasCursor';

const RippleScene = lazy(() => import('@/components/ripple/RippleScene'));

// ── Role config ──────────────────────────────────────────────────
const ROLE_CONFIG = {
  trainer: {
    label:       'Trainer',
    redirect:    '/',
    tagline:     'Manage your sprints & track attendance',
    accent:      '#0d9488',
    accentLight: '#f0fafa',
    accentRing:  'rgba(13,148,136,0.25)',
    gradient:    'linear-gradient(135deg,#0d4f4a,#14b8a6)',
    inputFocus:  '#0d9488',
    pageBg:      '#eef8f7',
    glowColor:   'rgba(13,148,136,0.12)',
  },
  hr: {
    label:       'HR',
    redirect:    '/hr',
    tagline:     'Schedule sprints & manage your team',
    accent:      '#D45769',
    accentLight: '#fdf8f8',
    accentRing:  'rgba(212,87,105,0.25)',
    gradient:    'linear-gradient(135deg,#a42e43,#D45769)',
    inputFocus:  '#D45769',
    pageBg:      '#fdf2f4',
    glowColor:   'rgba(212,87,105,0.12)',
  },
  manager: {
    label:       'Manager',
    redirect:    '/manager',
    tagline:     'Full oversight of sprints & attendance',
    accent:      '#374151',
    accentLight: '#f3f4f6',
    accentRing:  'rgba(55,65,81,0.15)',
    gradient:    'linear-gradient(135deg,#111827,#374151)',
    inputFocus:  '#374151',
    pageBg:      '#f0f1f3',
    glowColor:   'rgba(55,65,81,0.10)',
  },
};

const ROLES = ['trainer', 'hr', 'manager'];

// ── Role SVG icons ───────────────────────────────────────────────
const RoleIcon = ({ role, size = 14 }) => {
  if (role === 'trainer') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
  if (role === 'hr') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
};

// ── Login ────────────────────────────────────────────────────────
export default function Login() {
  const [role, setRole]           = useState('trainer');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate                  = useNavigate();
  const { login }                 = useContext(AuthContext);
  const emailId                   = useId();
  const passwordId                = useId();
  const panelRef = useRef(null);

  useCanvasCursor();

  const cfg = ROLE_CONFIG[role];

  const handleLogin = (e) => {
    e.preventDefault();
    const isMock = import.meta.env.VITE_USE_MOCK === "true";
    const credential = isMock ? role : email;
    login(credential, password)
      .then(() => navigate(cfg.redirect))
      .catch((err) => alert(err.message || 'Login failed'));
  };

  return (
    <motion.div
      className="min-h-screen w-full flex items-center justify-center p-4"
      animate={{ background: cfg.pageBg }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{ position: 'relative' }}
    >
      {/* Soft radial spotlight behind the card */}
      <canvas id="canvas-cursor" className="pointer-events-none fixed inset-0 z-0" />
      {/* Soft radial spotlight behind the card */}
      <motion.div
        aria-hidden="true"
        animate={{ background: `radial-gradient(ellipse 75% 55% at 50% 50%, ${cfg.glowColor}, transparent 70%)` }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl flex relative z-10"
        style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)', minHeight: 580 }}
      >

        {/* ── LEFT PANEL — Ripple ── */}
        <motion.div
          key={role}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          ref={panelRef}
          className="hidden md:flex w-5/12 relative overflow-hidden flex-col"
          style={{ background: cfg.gradient }}
        >
          {/* WebGL removed — canvas cursor handles background effect */}

          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.35),transparent)' }}
            aria-hidden="true"
          />

          {/* Content overlay — logo, brand, badge, tagline */}
          <div className="relative z-20 flex flex-col items-center justify-center flex-1 px-8 py-10 text-center">

            <motion.div
              key={`icon-${role}`}
              initial={{ opacity: 0, y: -16, scale: 0.85 }}
              animate={{ opacity: 1, y: 0,   scale: 1    }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mb-5"
            >
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{
                  background:     'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(16px)',
                  border:         '2px solid rgba(255,255,255,0.28)',
                  boxShadow:      '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <img
                  src="https://res.cloudinary.com/dgx25btzm/image/upload/v1732010481/72res_zr0pot.png"
                  alt="SprintFlow"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 20%', transform: 'scale(1.15)' }}
                />
              </div>
            </motion.div>

            <motion.h2
              key={`brand-${role}`}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0   }}
              transition={{ delay: 0.22, duration: 0.4 }}
              className="text-3xl font-bold text-white mb-2 tracking-tight"
              style={{ fontFamily: "'Space Grotesk',sans-serif", textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}
            >
              SprintFlow
            </motion.h2>

            <motion.div
              key={`badge-${role}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1   }}
              transition={{ delay: 0.3, duration: 0.35 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
              style={{
                background: 'rgba(255,255,255,0.18)',
                border:     '1px solid rgba(255,255,255,0.32)',
                color:      '#ffffff',
                fontSize:   12,
                fontWeight: 600,
              }}
            >
              <RoleIcon role={role} size={12} />
              {cfg.label} Portal
            </motion.div>

            <motion.p
              key={`tag-${role}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.4 }}
              className="text-sm leading-relaxed max-w-[220px]"
              style={{ color: 'rgba(255,255,255,0.78)' }}
            >
              {cfg.tagline}
            </motion.p>
          </div>
        </motion.div>

        {/* ── RIGHT PANEL — Form ── */}
        <div className="w-full md:w-7/12 flex flex-col justify-center px-8 md:px-10 py-10 bg-white" style={{ borderLeft: '1px solid #e5e7eb' }}>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              Welcome back
            </h1>
            <p className="text-sm text-gray-400 mb-7">Sign in to your workspace</p>

            {/* Role toggle */}
            <div
              className="relative flex rounded-xl p-1 mb-6"
              style={{ background: '#f1f5f9' }}
              role="group"
              aria-label="Select role"
            >
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg"
                animate={{ left: `calc(4px + ${ROLES.indexOf(role)} * (100% - 8px) / 3)` }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                style={{ width: 'calc((100% - 8px) / 3)', background: cfg.gradient, boxShadow: `0 2px 10px ${cfg.accentRing}` }}
                aria-hidden="true"
              />
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={role === r}
                  onClick={() => setRole(r)}
                  className="relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold capitalize transition-colors duration-200 focus-visible:outline-none rounded-lg"
                  style={{ color: role === r ? '#fff' : '#64748b' }}
                >
                  <span style={{ opacity: role === r ? 1 : 0.55 }}>
                    <RoleIcon role={r} size={13} />
                  </span>
                  {r}
                </button>
              ))}
            </div>

            {/* Offline demo only when VITE_USE_MOCK=true */}
            {import.meta.env.VITE_USE_MOCK === "true" && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-6 text-xs"
                style={{ background: cfg.accentLight, border: `1px solid ${cfg.accentRing}`, color: '#475569' }}
                role="note"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.accent }} aria-hidden="true" />
                <span>
                  <strong style={{ color: cfg.accent }}>Demo:</strong>{' '}
                  Use any email & password · role selected above
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} noValidate className="space-y-4">

              {/* Email */}
              <div>
                <label htmlFor={emailId} className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#d1d5db' }} />
                  <input
                    id={emailId}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`${cfg.label.toLowerCase()}@company.com`}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 outline-none transition-all duration-200 focus:bg-white"
                    onFocus={(e) => { e.target.style.borderColor = cfg.inputFocus; e.target.style.boxShadow = `0 0 0 3px ${cfg.accentRing}`; }}
                    onBlur={(e)  => { e.target.style.borderColor = '#e5e7eb';      e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor={passwordId} className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium transition-opacity duration-150 focus-visible:outline-none focus-visible:underline"
                    style={{ color: cfg.accent }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#d1d5db' }} />
                  <input
                    id={passwordId}
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 outline-none transition-all duration-200 focus:bg-white"
                    onFocus={(e) => { e.target.style.borderColor = cfg.inputFocus; e.target.style.boxShadow = `0 0 0 3px ${cfg.accentRing}`; }}
                    onBlur={(e)  => { e.target.style.borderColor = '#e5e7eb';      e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPwd((p) => !p)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-300 hover:text-gray-500 transition-colors duration-150 focus-visible:outline-none"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.div
                className="pt-1"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <button
                  type="submit"
                  className="w-full relative overflow-hidden py-2.5 rounded-xl text-sm font-semibold text-white focus-visible:outline-none active:scale-[0.98]"
                  style={{
                    background:  cfg.gradient,
                    boxShadow:   isHovered ? `0 6px 22px ${cfg.accentRing}` : `0 2px 10px ${cfg.accentRing}`,
                    transition:  'box-shadow 0.2s ease',
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    Sign in as {cfg.label}
                    <ArrowRight size={15} aria-hidden="true" />
                  </span>
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span
                        aria-hidden="true"
                        initial={{ left: '-100%' }}
                        animate={{ left: '110%'  }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.75, ease: 'easeInOut' }}
                        className="absolute top-0 bottom-0 w-16 pointer-events-none"
                        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)', filter: 'blur(4px)' }}
                      />
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            </form>

            <p className="text-center text-[11px] text-gray-300 mt-6">
              By continuing you agree to SprintFlow's{' '}
              <a href="#" className="text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors duration-150">Terms</a>
              {' & '}
              <a href="#" className="text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors duration-150">Privacy</a>
            </p>
          </motion.div>
        </div>

      </motion.div>
    </motion.div>
  );
}
