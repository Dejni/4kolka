import React, { useState, useEffect, useId, useLayoutEffect, useRef } from "react";
import { Phone, MapPin, Wrench, Gauge, Clock, Car, CheckCircle2, MessageSquare, Music, Cookie, AlertTriangle, Paperclip, ChevronDown, Facebook, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

/* ==================== KONFIG / DANE ==================== */

const BIZ = {
  name: "4 KÓŁKA",
  slogan: "SZYBKIE NAPRAWY",
  phone: "+48 796 437 107",
  phoneHref: "tel:+48796437107",
  street: "Sadowa 20",
  postal: "72-100",
  city: "Goleniów",
  region: "Zachodniopomorskie",
  email: "fanatycy35@gmail.com",
  mapQuery: "Sadowa 20, 72-100 Goleniów",
  legal: {
    company: "Mateusz Góral",
    nip: "",
    regon: "",
    seat: { street: "Łoźnica 35", postal: "72-122", city: "Łoźnica" },
    hours: "pon.–sob. 8:00–16:00",
  },
};

const SECOND = {
  label: "Łoźnica",
  street: "Łoźnica 35",
  postal: "72-122",
  city: "Łoźnica",
  mapQuery: "Łoźnica 35, 72-122",
};

const LINKS = {
  map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BIZ.mapQuery)}`,
  nav: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(BIZ.mapQuery)}`,
  whatsapp: `https://wa.me/${BIZ.phone.replace(/[^0-9]/g, "")}`,
};

const SOCIAL_LINKS = {
  facebookPage: 'https://facebook.com/profile.php?id=61573550289093',
  facebookReviews: 'https://www.facebook.com/profile.php?id=61573550289093&sk=reviews',
};

/* ==================== NARZĘDZIA / POMOCNICZE ==================== */

// Clickable phone number with clipboard fallback for desktop users
function isMobile(){
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
function TelLink({ className = "", children }){
  const [copied, setCopied] = useState(false);
  const telHref = BIZ.phoneHref;
  const plain = BIZ.phone.replaceAll(' ', '');
  return (
    <a
      href={telHref}
      onClick={async (e)=>{
        if (!isMobile()) {
          e.preventDefault();
          const num = plain.startsWith('+') ? plain : `+${plain}`;
          try {
            if (typeof window !== 'undefined' && window.isSecureContext && navigator?.clipboard?.writeText) {
              await navigator.clipboard.writeText(num);
              setCopied(true);
              setTimeout(()=>setCopied(false), 1800);
              alert(`Skopiowano numer: ${BIZ.phone}`);
            } else {
              throw new Error('no-secure-clipboard');
            }
          } catch {
            try {
              const ta = document.createElement('textarea');
              ta.value = num; ta.style.position = 'fixed'; ta.style.opacity = '0';
              document.body.appendChild(ta); ta.focus(); ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              setCopied(true); setTimeout(()=>setCopied(false), 1800);
              alert(`Skopiowano numer: ${BIZ.phone}`);
            } catch {
              alert(`Numer: ${BIZ.phone}`);
            }
          }
        }
      }}
      className={className}
      aria-label={`Zadzwoń: ${BIZ.phone}`}
    >
      {children}
      {copied && <span className="ml-2 text-xs text-white/70">Skopiowano</span>}
    </a>
  );
}

// Load fallback font (Archivo 900 italic)
function useLoadFont(href){
  useEffect(()=>{
    if (typeof document === 'undefined') return;
    if (document.querySelector(`link[data-href="${href}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    l.setAttribute('data-href', href);
    document.head.appendChild(l);
  }, [href]);
}


/* ==================== LOGOTYP ==================== */

function LogoRings({ className = "", style = {}, cutLeft = false, stroke = 3, cutW = 14 }){
  const uid = useId();
  const maskId = `rings-cut-${uid}`;
  return (
    <svg className={className} style={style} viewBox="0 0 96 32" aria-hidden="true" focusable="false">
      {cutLeft && (
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width="96" height="32" fill="#fff" />
            <polygon points={`0,0 ${cutW},32 0,32`} fill="#000" />
          </mask>
        </defs>
      )}
      <g fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" mask={cutLeft ? `url(#${maskId})` : undefined}>
        <circle cx="16" cy="16" r="13" />
        <circle cx="36" cy="16" r="13" />
        <circle cx="56" cy="16" r="13" />
        <circle cx="76" cy="16" r="13" />
      </g>
    </svg>
  );
}

function LogoWordmark({ size = 'md', className = '', withRings = true, variant = 'card', ringsAbove = false, wordDx = 0, wordDy = 0, ringsDx = 0, ringsDy = 0, ringsScale = 1, ringsCutW = null, fourDx = 0, fourDy = 0 }){
  const palette = {
    card: { four: '#E21337', word: '#E21337', ring: '#E6E6E6' },
    white: { four: '#E11D48', word: '#FFFFFF', ring: '#E5E5E5' },
  }[variant];

  const cfg = {
    sm: { four: 'text-5xl', text: 'text-2xl', rings: 'h-9 -ml-4 -mt-1', cutW: 12, stroke: 3 },
    md: { four: 'text-7xl md:text-8xl', text: 'text-4xl md:text-5xl', rings: 'h-14 md:h-16 -ml-7 md:-ml-9 -mt-1', cutW: 22, stroke: 3.2 },
    lg: { four: 'text-8xl md:text-9xl', text: 'text-6xl md:text-7xl', rings: 'h-16 md:h-20 -ml-9 md:-ml-12 -mt-1', cutW: 26, stroke: 3.6 },
  }[size];

  return (
    <span className={`relative inline-flex items-end gap-3 md:gap-4 leading-none ${className}`}>
      <span
        className={`relative z-10 top-0 font-extrabold leading-none ${cfg.four}`}
        style={{ color: palette.four, transform: `skewX(-12deg) translate(${fourDx}px, ${fourDy}px)`, fontFamily: 'var(--logo-font, "Archivo", system-ui, sans-serif)', fontWeight: 900, fontStyle: 'italic' }}
      >4</span>
      <span
        className={`relative z-10 font-extrabold tracking-wide leading-none italic ${cfg.text}` }
        style={{ color: palette.word, transform: `skewX(-12deg) translate(${wordDx}px, ${wordDy}px)`, fontFamily: 'var(--logo-font, "Archivo", system-ui, sans-serif)', fontWeight: 900, fontStyle: 'italic' }}
      >KÓŁKA</span>
      {withRings && (
        <LogoRings
          cutLeft
          cutW={ringsCutW ?? cfg.cutW}
          stroke={cfg.stroke}
          className={`hidden sm:block relative pointer-events-none ${cfg.rings} ${ringsAbove ? 'z-20' : 'z-0'}`}
          style={{ color: palette.ring, transform: `translate(${ringsDx}px, ${ringsDy}px) scale(${ringsScale})` }}
        />
      )}
    </span>
  );
}

function BrandLogo({ variant = "hero", className = "" }){
  const cfg = LOGO[variant] || {};
  const style = {
    transform: `translate(${cfg.dx || 0}px, ${cfg.dy || 0}px) scale(${cfg.scale ?? 1})`,
  };
  if (cfg.w) style.width = `${cfg.w}px`;
  if (cfg.h) style.height = `${cfg.h}px`;
  if (cfg.maxW) style.maxWidth = `${cfg.maxW}px`;
  return (
    <img
      src="/logo_full_embed.svg"
      alt="4 KÓŁKA – logo"
      className={`select-none pointer-events-none ${className}`}
      style={style}
    />
  );
}

/* ==================== LOGO USTAWIENIA ==================== */

const LOGO = {
  nav:    { h: 48,  dx: 0,  dy: 0,  scale: 1 },
  hero:   { maxW: 560, dx: 0,  dy: 0,  scale: 1 },
  footer: { w: 210, dx: -2, dy: 0,  scale: 1 },
};

const HERO = {
  left:  { dx: 5, dy: 13, scale: 1 },
  right: { dx: 60, dy: 12, scale: 0.85 },
};
const tStyle = ({dx=0,dy=0,scale=1}={}) => ({ transform: `translate(${dx}px, ${dy}px) scale(${scale})` });


// Simple media query hook (used to disable hero transforms on smaller screens)
function useMediaQuery(query){
  const [matches, setMatches] = useState(()=>{
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(query);
    const handler = (e)=> setMatches(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    setMatches(mq.matches);
    return ()=>{
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, [query]);
  return matches;
}
// Layout-aware scaler that keeps wrapper height in sync with scaled content
function ScaledLayer({ id, dx=0, dy=0, scale=1, className='', children }){
  const ref = useRef(null);
  const [h, setH] = useState(null);
  const isLg = useMediaQuery('(min-width: 1024px)');
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    const ro = new ResizeObserver(()=> setH(el.offsetHeight));
    setH(el.offsetHeight);
    ro.observe(el);
    return ()=> ro.disconnect();
  },[]);
  const wrapperH = h ? (isLg ? h*scale : h) : undefined;
  const transform = isLg ? `translate(${dx}px, ${dy}px) scale(${scale})` : undefined;
  return (
    <div id={id} className={className} style={{ height: wrapperH }}>
      <div ref={ref} className="origin-top-left" style={{ transform }}>
        {children}
      </div>
    </div>
  );
}

/* ==================== COOKIES / ZGODY ==================== */

const CONSENT_KEY = 'cookie-consent-v1';
const CONSENT_VERSION = '2025-08-21';
const DEFAULT_PREFS = { necessary: true, marketing: false };

function readConsent(){
  if (typeof window === 'undefined') return null;
  try {
    const v = JSON.parse(window.localStorage.getItem(CONSENT_KEY));
    if (!v || v.version !== CONSENT_VERSION) return null;
    return v;
  } catch { return null; }
}
function writeConsent(prefs){
  if (typeof window === 'undefined') return;
  const payload = {
    version: CONSENT_VERSION,
    date: new Date().toISOString(),
    prefs: { ...DEFAULT_PREFS, ...prefs, necessary: true },
  };
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
  // Notify all components (e.g., MapEmbed instances) to refresh
  try { window.dispatchEvent(new Event('consent-updated')); } catch {}
}
// Helper to read marketing consent flag
function hasMarketingConsent(){
  const v = readConsent();
  return !!(v && v.prefs && v.prefs.marketing);
}
// Enable marketing consent globally and signal other components
function enableMarketingGlobally(){
  const current = readConsent();
  const prefs = { ...DEFAULT_PREFS, ...current?.prefs, marketing: true };
  writeConsent(prefs);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('consent-updated'));
  }
}

/* ==================== MAPS ==================== */

// Map component with graceful fallback when iframes are blocked and respect for marketing consent
function MapEmbed({ query, title = "Mapa", className = "", height = 256 }) {
  const [loaded, setLoaded] = useState(false);
  const [allowed, setAllowed] = useState(false);
  // Precomputed URLs to avoid template literals in JSX attributes
  const searchUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
  const [keyTick, setKeyTick] = useState(0); // re-mount iframe on consent changes

  // Sync consent state with localStorage and listen for global updates
  useEffect(() => {
    const sync = () => {
      const ok = hasMarketingConsent();
      setAllowed(ok);
      // Remount iframe once consent is granted
      if (ok) setKeyTick(t => t + 1);
    };
    sync();
    const onEvt = () => sync();
    window.addEventListener('consent-updated', onEvt);
    window.addEventListener('storage', onEvt);
    return () => {
      window.removeEventListener('consent-updated', onEvt);
      window.removeEventListener('storage', onEvt);
    };
  }, [query]);

  // Track loading state to show overlay until the iframe is ready
  useEffect(() => {
    if (!allowed) { setLoaded(false); }
  }, [allowed]);

  const carbonStyle = {
    backgroundImage:
      'linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.06) 75%, transparent 75%, transparent), linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.03) 75%, transparent 75%, transparent)',
    backgroundSize: '12px 12px',
    backgroundPosition: '0 0, 6px 6px',
  };

  if (!allowed) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`} style={{ height }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 p-4 text-center" style={carbonStyle}>
          <div className="max-w-md text-white/80">
            Aby wyświetlić <strong>Mapy Google</strong> (usługa podmiotu trzeciego), włącz zgodę kategorii <strong>Marketing/Media</strong>.
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                enableMarketingGlobally();
                setAllowed(true);
                try { window.dispatchEvent(new Event('consent-updated')); } catch {}
                setKeyTick(t => t + 1);
              }}
              className="rounded-2xl bg-rose-600 px-4 py-2 font-semibold text-white shadow hover:bg-rose-500 inline-flex items-center gap-2"
            >
              <span>Włącz mapy</span>
              <span className="inline-flex items-center gap-1">
                <span>(</span>
                <span>akceptuję</span>
                <Cookie className="h-4 w-4" aria-hidden="true" />
                <span>)</span>
              </span>
            </button>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/15 px-4 py-2 hover:bg-white/10"
            >
              Otwórz w Mapach
            </a>
            <button
              onClick={() => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('open-consent')); }}
              className="rounded-2xl border border-white/15 px-4 py-2 hover:bg-white/10"
            >
              Ustawienia prywatności
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`} style={{ height }}>
      <iframe
        key={`map-${query}-${keyTick}`}
        title={title}
        src={"https://www.google.com/maps?q=" + encodeURIComponent(query) + "&output=embed"}
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setLoaded(true)}
        allowFullScreen
      />
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 p-4 text-center" style={carbonStyle}>
          <div className="text-white/80">Ładowanie mapy…</div>
        </div>
      )}
    </div>
  );
}

/* ==================== SECTIONS / COMPONENTS ==================== */

const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_SIZE_MB = 15;
const MAX_TOTAL_ATTACHMENT_SIZE_MB = 15;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const PHONE_PREFIXES = [
  { code: '+48', country: 'Polska', flag: '🇵🇱', minDigits: 9, maxDigits: 9 },
  { code: '+49', country: 'Niemcy', flag: '🇩🇪', minDigits: 5, maxDigits: 13 },
  { code: '+44', country: 'Wielka Brytania', flag: '🇬🇧', minDigits: 9, maxDigits: 10 },
  { code: '+46', country: 'Szwecja', flag: '🇸🇪', minDigits: 7, maxDigits: 10 },
  { code: '+420', country: 'Czechy', flag: '🇨🇿', minDigits: 9, maxDigits: 9 },
  { code: '+421', country: 'Słowacja', flag: '🇸🇰', minDigits: 9, maxDigits: 9 },
  { code: '+43', country: 'Austria', flag: '🇦🇹', minDigits: 6, maxDigits: 12 },
  { code: '+31', country: 'Holandia', flag: '🇳🇱', minDigits: 9, maxDigits: 9 },
  { code: '+32', country: 'Belgia', flag: '🇧🇪', minDigits: 8, maxDigits: 9 },
  { code: '+370', country: 'Litwa', flag: '🇱🇹', minDigits: 8, maxDigits: 8 },
  { code: '+371', country: 'Łotwa', flag: '🇱🇻', minDigits: 8, maxDigits: 8 },
  { code: '+372', country: 'Estonia', flag: '🇪🇪', minDigits: 7, maxDigits: 8 },
  { code: '+33', country: 'Francja', flag: '🇫🇷', minDigits: 9, maxDigits: 9 },
  { code: '+39', country: 'Włochy', flag: '🇮🇹', minDigits: 9, maxDigits: 10 },
  { code: '+34', country: 'Hiszpania', flag: '🇪🇸', minDigits: 9, maxDigits: 9 },
  { code: '+1', country: 'USA / Kanada', flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
  { code: '+353', country: 'Irlandia', flag: '🇮🇪', minDigits: 7, maxDigits: 10 },
  { code: '+47', country: 'Norwegia', flag: '🇳🇴', minDigits: 8, maxDigits: 8 },
  { code: '+41', country: 'Szwajcaria', flag: '🇨🇭', minDigits: 9, maxDigits: 9 },
  { code: '+45', country: 'Dania', flag: '🇩🇰', minDigits: 8, maxDigits: 8 },
  { code: '+40', country: 'Rumunia', flag: '🇷🇴', minDigits: 9, maxDigits: 9 },
  { code: '+380', country: 'Ukraina', flag: '🇺🇦', minDigits: 9, maxDigits: 9 },
];

const DEFAULT_PHONE_RULE = { minDigits: 5, maxDigits: 12 };

const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT?.trim() || "/contact.php";

const FIELD_ERROR_LABELS = {
  name: 'Imię',
  phone: 'Telefon',
  email: 'E-mail',
  vin: 'VIN',
  msg: 'Wiadomość',
  attachments: 'Załączniki',
};

const findPhoneRule = (prefix) => PHONE_PREFIXES.find((item) => item.code === prefix) || DEFAULT_PHONE_RULE;

const getPhoneError = (prefix, localValue) => {
  const trimmed = (localValue || '').replace(/\s+/g, ' ').trim();
  const digits = trimmed.replace(/[^0-9]/g, '');
  const rule = findPhoneRule(prefix);
  const min = rule?.minDigits ?? DEFAULT_PHONE_RULE.minDigits;
  const max = rule?.maxDigits ?? DEFAULT_PHONE_RULE.maxDigits;

  if (!digits.length) return 'Podaj numer telefonu.';
  if (digits.length < min || digits.length > max) {
    return min === max
      ? `Numer dla prefiksu ${prefix} powinien mieć ${min} cyfr (wpisz część po prefiksie).`
      : `Numer dla prefiksu ${prefix} powinien mieć od ${min} do ${max} cyfr (wpisz część po prefiksie).`;
  }
  return '';
};

const formatFileSize = (bytes) => {
  if (bytes <= 0 || Number.isNaN(bytes)) return '0 MB';
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 1 : 2)} MB`;
};

const Section = ({ id, className = "", children, container = true }) => (
  <section id={id} className={`py-16 md:py-24 ${className}`}>
    <div className={container ? "mx-auto max-w-6xl px-4" : ""}>{children}</div>
  </section>
);

const Stat = ({ value, label, compact = false, icon: Icon }) => {
  const big = !compact;
  const valueCls = big ? 'text-3xl md:text-4xl font-extrabold' : 'text-xl md:text-2xl font-bold';
  return (
    <div className="rounded-2xl bg-white/5 p-8 text-center shadow-inner">
      <div className={`${valueCls} tracking-tight text-white flex items-center justify-center gap-2`}>
        {Icon ? <Icon className={big ? 'h-7 w-7' : 'h-5 w-5'} /> : null}
        <span>{value}</span>
      </div>
      <div className="mt-1 text-sm text-white/70">{label}</div>
    </div>
  );
};

const Feature = ({ icon: Icon, title, desc, href = "#kontakt" }) => {
  const handleClick = (e) => {
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const el = typeof document !== 'undefined' ? document.getElementById(href.slice(1)) : null;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  return (
    <a
      href={href}
      onClick={handleClick}
      className="group rounded-2xl bg-white/5 p-8 shadow-inner transition hover:bg-white/10"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
          <Icon className={`h-8 w-8 ${Icon === Car ? 'scale-[1.28]' : ''}`} strokeWidth={2} />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
      </div>
      <p className="text-sm leading-6 text-white/70 break-words hyphens-auto">{desc}</p>
    </a>
  );
};

const Step = ({ nr, title, desc }) => (
  <div className="relative rounded-2xl bg-white/5 p-8 shadow-inner">
    <div className="absolute -top-3 left-6 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow">{nr}</div>
    <h4 className="mt-2 text-base font-semibold text-white">{title}</h4>
    <p className="mt-1 text-sm text-white/70">{desc}</p>
  </div>
);

// Shared input styling
const inputBase = "w-full h-12 rounded-xl border bg-neutral-900 px-4 py-3 outline-none focus:border-rose-500";

/* ==================== RESPONSYWNY NAVBAR (priorytet: logo > telefon > linki) ==================== */

function NavBar(){
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const phoneRef = useRef(null);
  const linksRef = useRef(null);
  const [collapse, setCollapse] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const recalc = () => {
      const navW = navRef.current?.clientWidth ?? 0;
      const leftW = logoRef.current?.offsetWidth ?? 0;
      const rightW = phoneRef.current?.offsetWidth ?? 0;
      const avail = navW - leftW - rightW - 32; // - gap
      const need = linksRef.current?.scrollWidth ?? 0;
      setCollapse(need > avail);
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    if (navRef.current) ro.observe(navRef.current);
    if (linksRef.current) ro.observe(linksRef.current);
    window.addEventListener('resize', recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recalc);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/70 backdrop-blur overflow-visible">
      <nav ref={navRef} className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center px-6 py-4 md:py-5">
        <a ref={logoRef} href="#hero" onClick={(e)=>{e.preventDefault(); const el = document.getElementById('hero'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'});}} className="relative flex items-center gap-3 md:gap-4 justify-self-start">
          <BrandLogo variant="nav" />
        </a>

        {/* Linki pokazuj tylko gdy jest miejsce */}
        {!collapse && (
          <div ref={linksRef} className={`hidden md:flex justify-center gap-8 text-base md:text-lg ${collapse ? "md:invisible" : ""}`}>
            <a href="#uslugi" onClick={(e)=>{e.preventDefault(); const el = document.getElementById('uslugi'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'});}} className="opacity-80 transition hover:opacity-100 font-medium tracking-wide">Usługi</a>
            <a href="#dlaczego-my" onClick={(e)=>{e.preventDefault(); const el = document.getElementById('dlaczego-my'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'});}} className="opacity-80 transition hover:opacity-100 font-medium tracking-wide">Dlaczego my</a>
            <a href="#mapa" onClick={(e)=>{e.preventDefault(); const el = document.getElementById('mapa'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'});}} className="opacity-80 transition hover:opacity-100 font-medium tracking-wide">Mapa</a>
            <a href="#kontakt" onClick={(e)=>{e.preventDefault(); const el = document.getElementById('kontakt'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'});}} className="opacity-80 transition hover:opacity-100 font-medium tracking-wide">Kontakt</a>
          </div>
        )}

        <TelLink className="ml-auto md:ml-0 shrink-0 inline-flex items-center gap-3 rounded-3xl bg-rose-600 px-5 py-3 text-base md:text-lg font-semibold shadow hover:bg-rose-500">
          <Phone className="h-4 w-4" /> Zadzwoń
        </TelLink>

      </nav>
    </header>
  );
}

/* ==================== STRONA ==================== */


// ——— Security hardening injected in <head> at runtime (CSP, referrer) and anti-framing ———
function SecurityHardening(){
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Content Security Policy (works in most browsers via <meta http-equiv>)
    // Note: kept broader in dev to avoid breaking Vite HMR.
    const hostname = window.location?.hostname || '';
    const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self' mailto:",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "frame-src https://www.google.com https://www.google.pl",
      "connect-src 'self' " + (isDev ? "ws: wss:" : ""),
      "script-src 'self' 'unsafe-inline' blob:" + (isDev ? " 'unsafe-eval'" : "")
    ].filter(Boolean).join('; ');

    let meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', csp);

    // Referrer Policy – avoid leaking referrers cross-site
    let ref = document.querySelector('meta[name="referrer"]');
    if (!ref){
      ref = document.createElement('meta');
      ref.setAttribute('name','referrer');
      document.head.appendChild(ref);
    }
    ref.setAttribute('content','no-referrer');

    // Basic frame-busting (header is better, but this protects against casual clickjacking)
    try {
      if (window.top !== window.self) {
        window.top.location = window.location;
      }
    } catch {}
  }, []);
  return null;
}
export default function Website() {
  // Font fallback
  useLoadFont('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@1,900&display=swap');

  // === Form state, validation, and submission ===
  const [form, setForm] = useState({ name: "", phone: "", email: "", vin: "", msg: "" });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [phonePrefix, setPhonePrefix] = useState(PHONE_PREFIXES[0].code);
  const [phoneLocal, setPhoneLocal] = useState("");
  const lastFocusRef = useRef(null);
  const feedbackCloseRef = useRef(null);

  const sanitizeEmail = (s) => s.replace(/\s/g, "").toLowerCase();
  const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  const sanitizeLocalPhone = (s) => s.replace(/[^0-9 ]/g, "");
  const formatPhone = (prefix, local) => [prefix, (local || "").trim()].filter(Boolean).join(' ').trim();

  useEffect(() => {
    setForm((prev) => ({ ...prev, phone: formatPhone(phonePrefix, phoneLocal) }));
  }, [phonePrefix, phoneLocal]);


  const validate = () => {
    const e = {};
    const name = (form.name || "").trim();
    const email = sanitizeEmail(form.email || "");
    const vin = (form.vin || "").toUpperCase();
    const msg = (form.msg || "").trim();

    if (name.length < 2) e.name = "Podaj imię (min 2 znaki).";
    if (!isValidEmail(email)) e.email = "Podaj poprawny adres e-mail.";
    const phoneErr = getPhoneError(phonePrefix, phoneLocal);
    if (phoneErr) e.phone = phoneErr;
    if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) e.vin = "VIN musi mieć 17 znaków (bez I, O, Q).";
    if (msg.length < 10) e.msg = "Opisz problem w co najmniej 10 znakach.";
    return e;
  };

  const handleFileChange = (event) => {
    const selected = Array.from(event.target.files || []);

    if (!selected.length) {
      event.target.value = "";
      return;
    }

    const normalizeKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;
    const existingKeys = new Set(files.map(normalizeKey));
    const merged = [...files];
    selected.forEach((file) => {
      const key = normalizeKey(file);
      if (!existingKeys.has(key)) {
        merged.push(file);
        existingKeys.add(key);
      }
    });

    let errorMessage = "";
    if (merged.length > MAX_ATTACHMENTS) {
      errorMessage = `Możesz dodać maksymalnie ${MAX_ATTACHMENTS} pliki. Zostawiliśmy pierwsze ${MAX_ATTACHMENTS}.`;
    }
    const limited = merged.slice(0, MAX_ATTACHMENTS);

    const tooLarge = limited.find((file) => file.size > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024);
    if (tooLarge) {
      const message = `Plik "${tooLarge.name}" jest zbyt duży (limit ${MAX_ATTACHMENT_SIZE_MB} MB).`;
      setFileError(message);
      setErrors((prev) => ({ ...prev, attachments: message }));
      event.target.value = "";
      return;
    }

    const disallowed = limited.find((file) => file.type && !ALLOWED_ATTACHMENT_TYPES.has(file.type));
    if (disallowed) {
      const message = `Plik "${disallowed.name}" ma nieobsługiwany format. Dozwolone: PDF, JPG, PNG, WEBP.`;
      setFileError(message);
      setErrors((prev) => ({ ...prev, attachments: message }));
      event.target.value = "";
      return;
    }

    const totalBytes = limited.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_ATTACHMENT_SIZE_MB * 1024 * 1024) {
      const message = `Łączny rozmiar załączników to ${formatFileSize(totalBytes)} (limit ${MAX_TOTAL_ATTACHMENT_SIZE_MB} MB).`;
      setFileError(message);
      setErrors((prev) => ({ ...prev, attachments: message }));
      event.target.value = "";
      return;
    }

    setFiles(limited);
    setFileError(errorMessage);
    setErrors((prev) => {
      const next = { ...prev };
      if (errorMessage) {
        next.attachments = errorMessage;
      } else {
        delete next.attachments;
      }
      return next;
    });
    event.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
    setErrors((prev) => {
      if (!prev.attachments) return prev;
      const next = { ...prev };
      delete next.attachments;
      return next;
    });
  };

  const totalAttachmentBytes = files.reduce((sum, file) => sum + (file?.size ?? 0), 0);

  const handleFeedbackClose = () => {
    setFeedback(null);
    const last = lastFocusRef.current;
    if (last && typeof last.focus === 'function') {
      last.focus();
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    const eMap = validate();
    setErrors(eMap);
    const eEntries = Object.entries(eMap);

    const showFeedback = (type, title, message, options = {}) => {
      if (typeof document !== 'undefined') {
        lastFocusRef.current = document.activeElement;
      }
      const { showContact = false } = options;
      setFeedback({ type, title, message, showContact });
    };

    if (eEntries.length) {
      const message = eEntries
        .map(([field, msg]) => `${FIELD_ERROR_LABELS[field] ?? field}: ${msg}`)
        .join(' ');
      showFeedback('error', 'Popraw formularz', message || 'Sprawdź zaznaczone pola i spróbuj ponownie.');
      return;
    }

    if (fileError) {
      showFeedback('error', 'Załączniki', fileError || 'Sprawdź dodane pliki i spróbuj ponownie.');
      return;
    }

    if (!CONTACT_ENDPOINT) {
      showFeedback('error', 'Konfiguracja', 'Formularz nie ma skonfigurowanego adresu wysyłki. Skontaktuj się z administratorem.');
      return;
    }

    const phoneValue = formatPhone(phonePrefix, phoneLocal);
    const payload = {
      name: (form.name || "").trim(),
      phone: phoneValue,
      email: sanitizeEmail(form.email || ""),
      vin: (form.vin || "").toUpperCase(),
      msg: (form.msg || "").trim(),
      honeypot: honeypot.trim(),
      source: 'website-4kolka',
      timestamp: new Date().toISOString(),
    };
    setIsSubmitting(true);

    try {
      const attachmentsPayload = files.length ? await filesToAttachmentPayload(files) : [];
      if (attachmentsPayload.length) {
        payload.attachments = attachmentsPayload;
      }

      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && (data?.ok ?? true)) {
        showFeedback(
          "success",
          "Wiadomość wysłana",
          "Dziękujemy za kontakt. Skontaktujemy się możliwie najszybciej telefonicznie lub mailowo."
        );
        setForm({ name: "", phone: "", email: "", vin: "", msg: "" });
        setErrors({});
        setFiles([]);
        setFileError("");
        setPhonePrefix(PHONE_PREFIXES[0].code);
        setPhoneLocal("");
        setHoneypot('');
        return;
      }

      const detail = data?.error || '';

      if (data?.details?.fieldErrors) {
        const fe = data.details.fieldErrors;
        const fieldEntries = Object.entries(fe).filter(([, arr]) => Array.isArray(arr) && arr.length);
        if (fieldEntries.length) {
          const serverErrors = fieldEntries.reduce((acc, [field, arr]) => {
            acc[field] = arr[0];
            return acc;
          }, {});
          setErrors((prev) => ({ ...prev, ...serverErrors }));
          const detailsMessage = fieldEntries
            .map(([field, arr]) => `${FIELD_ERROR_LABELS[field] ?? field}: ${arr[0]}`)
            .join(' ');
          showFeedback('error', 'Popraw formularz', detailsMessage);
          return;
        }
      }

      if (res.status === 503 || detail === "MAIL_DISABLED") {
        showFeedback(
          "error",
          "Serwer pocztowy niedostępny",
          `Nie mogliśmy wysłać wiadomości, bo skrzynka odbiorcza jest chwilowo offline. Zadzwoń proszę pod numer ${BIZ.phone} – załatwimy sprawę telefonicznie.`,
          { showContact: true }
        );
      } else if (res.status === 429) {
        showFeedback(
          "error",
          "Zbyt wiele prób",
          "Wygląda na to, że formularz został wysłany wiele razy w krótkim czasie. Odczekaj kilka minut i spróbuj ponownie."
        );
      } else if (res.status >= 500) {
        showFeedback(
          "error",
          "Problem po stronie serwera",
          "Coś poszło nie tak po naszej stronie. Spróbuj ponownie za chwilę albo skontaktuj się z nami telefonicznie.",
          { showContact: true }
        );
      } else {
        showFeedback(
          "error",
          "Nie udało się wysłać",
          "Sprawdź, czy wszystkie pola są uzupełnione poprawnie i spróbuj ponownie."
        );
      }
    } catch (err) {
      console.error(err);
      showFeedback(
        "error",
        "Brak połączenia",
        "Nie udało się połączyć z serwerem. Sprawdź dostęp do internetu i spróbuj ponownie albo zadzwoń do nas.",
        { showContact: true }
      );
    } finally {
      setIsSubmitting(false);
    }
  }






  const carbonStyle = {
    backgroundImage:
      'linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.06) 75%, transparent 75%, transparent), linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.03) 75%, transparent 75%, transparent)',
    backgroundSize: '12px 12px',
    backgroundPosition: '0 0, 6px 6px',
  };

  useEffect(() => {
    if (!feedback) return;
    const handler = (event) => {
      if (event.key === 'Escape') {
        setFeedback(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [feedback]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SecurityHardening />
      {/* ===== META / SEO (w realnym wdrożeniu trafi do <Head>) ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoRepair",
            name: BIZ.name,
            telephone: BIZ.phone.replace(/\s/g, ""),
            address: [
              {
                "@type": "PostalAddress",
                streetAddress: BIZ.street,
                addressLocality: BIZ.city,
                postalCode: BIZ.postal,
                addressRegion: BIZ.region,
                addressCountry: "PL",
              },
              {
                "@type": "PostalAddress",
                streetAddress: SECOND.street,
                addressLocality: SECOND.city,
                postalCode: SECOND.postal,
                addressRegion: BIZ.region,
                addressCountry: "PL",
              }
            ],
            areaServed: BIZ.region,
            url: "https://twojadomena.pl",
          }),
        }}
      />

      {/* ===== NAVBAR (dynamiczny) ===== */}
      <NavBar />

      {/* ===== HERO ===== */}
      <Section id="hero" className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950 pt-8 md:pt-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 md:gap-20 px-6 lg:grid-cols-2">
          <ScaledLayer id="hero-left" dx={HERO.left.dx} dy={HERO.left.dy} scale={HERO.left.scale}>
            <div>
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm md:text-base text-white/80">
                <CheckCircle2 className="h-5 w-5" /> Car audio • Mechanika • Wulkanizacja
              </div>
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
                <BrandLogo variant="hero" />
              </h1>
              <p className="mt-2 text-3xl font-black tracking-wide text-white/90">{BIZ.slogan}</p>
              <p className="mt-6 max-w-prose text-white/70">
                Profesjonalny serwis samochodowy w {BIZ.city} i {SECOND.city}. Szybko diagnozujemy usterki, naprawiamy i oddajemy auto w pełni sprawne, często tego samego dnia.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <TelLink className="justify-self-end inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 font-semibold shadow hover:bg-rose-500">
                  <Phone className="h-5 w-5" /> Zadzwoń
                </TelLink>
                <a href="#kontakt" onClick={(e)=>{e.preventDefault(); const el = document.getElementById('kontakt'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'});}} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/0 px-4 py-3 font-semibold hover:bg-white/10">
                  <MessageSquare className="h-5 w-5" /> Umów wizytę
                </a>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(BIZ.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/0 px-4 py-3 font-semibold hover:bg-white/10">
                  <MapPin className="h-5 w-5" /> Nawiguj
                </a>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4">
                <Stat value="15 min" label="Średni czas wyceny" />
                <Stat value="> 2000" label="Napraw rocznie" />
                <Stat value="Car Audio" label="Montaż i konfiguracja" />
              </div>
            </div>
          </ScaledLayer>
          <ScaledLayer id="hero-right" dx={HERO.right.dx} dy={HERO.right.dy} scale={HERO.right.scale}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 p-8 shadow-2xl" style={carbonStyle}>
                <div className="relative z-10">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-sm font-semibold text-white/80">{BIZ.city}</h4>
                      <div className="mt-2 flex items-center gap-2 text-white/80"><MapPin className="h-5 w-5" /> {BIZ.street}, {BIZ.postal} {BIZ.city}</div>
                      <MapEmbed query={BIZ.mapQuery} title={`Mapa dojazdu – ${BIZ.city}`} height={320} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white/80">{SECOND.city}</h4>
                      <div className="mt-2 flex items-center gap-2 text-white/80"><MapPin className="h-5 w-5" /> {SECOND.street}, {SECOND.postal} {SECOND.city}</div>
                      <MapEmbed query={SECOND.mapQuery} title={`Mapa dojazdu – ${SECOND.city}`} height={320} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </ScaledLayer>
        </div>
      </Section>

      {/* ===== USŁUGI ===== */}
      <Section id="uslugi" className="border-b border-white/10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Usługi</h2>
          <p className="mt-3 text-white/70">Wykonujemy pełny zakres prac serwisowych i eksploatacyjnych.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-4">
          <Feature icon={Gauge} title="Diagnostyka komputerowa"
            desc="Szybkie odczyty i kasowanie błędów, testy podzespołów, dobór części." />
          <Feature icon={Wrench} title="Mechanika pojazdowa"
            desc="Hamulce, zawieszenie, rozrządy, układ wydechowy, serwisy olejowe i więcej." />
          <Feature icon={Car} title="Wulkanizacja i opony"
            desc="Naprawy opon, sezonowa wymiana, wyważanie kół, magazynowanie ogumienia." />
          <Feature icon={Music} title="Car audio i elektronika"
            desc="Montaż zestawów audio, radia, wzmacniaczy, kamer cofania, wygłuszenia i konfiguracja." />
        </div>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-white/80">
          Nie ma na liście Twojej usterki? Zadzwoń: <TelLink className="font-semibold hover:underline">{BIZ.phone}</TelLink> – doradzimy i umówimy termin.
        </div>
      </Section>

      {/* ===== DLACZEGO MY ===== */}
      <Section id="dlaczego-my" className="border-b border-white/10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Dlaczego warto nas wybrać?</h2>
          <p className="mt-3 text-white/70">Jasna komunikacja, szybkie terminy i uczciwe podejście.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Step nr="1" title="Szybka diagnoza" desc="Wstępna wycena najczęściej w 15 minut – telefonicznie lub na miejscu." />
          <Step nr="2" title="Zgoda na koszt" desc="Zawsze uzgadniamy zakres i koszt przed rozpoczęciem prac." />
          <Step nr="3" title="Solidna naprawa" desc="Stawiamy na części jakościowe i sprawdzone procedury serwisowe." />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-8"><CheckCircle2 className="mb-3 h-6 w-6"/>Gwarancja na usługę i części</div>
          <div className="rounded-2xl bg-white/5 p-8"><Clock className="mb-3 h-6 w-6"/>Dogodne terminy i szybkie realizacje</div>
          <div className="rounded-2xl bg-white/5 p-8"><MapPin className="mb-3 h-6 w-6"/>Łatwy dojazd – {BIZ.city} & {SECOND.city}</div>
        </div>
      </Section>

      {/* ===== KONTAKT ===== */}
      <Section id="kontakt" className="relative bg-neutral-900">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Kontakt i umawianie wizyt</h2>
          <p className="mt-3 text-white/70">Najpewniej będzie zadzwonić – od razu sprawdzimy dostępne terminy.</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-5">
            <h3 className="text-lg font-semibold">Dane kontaktowe</h3>
            <div className="mt-6 space-y-4 text-white/80">
              <TelLink className="flex items-center gap-3 hover:underline"><Phone className="h-5 w-5"/> <span>{BIZ.phone}</span></TelLink>
              <a href={`mailto:${BIZ.email}`} className="flex items-center gap-3 hover:underline">
                <MessageSquare className="h-5 w-5" /> <span>{BIZ.email}</span>
              </a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BIZ.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:underline"><MapPin className="h-5 w-5"/> <span>{BIZ.street}, {BIZ.postal} {BIZ.city}</span></a>
              {/* Usunięto "Nawiguj" wg prośby */}
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SECOND.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:underline mt-2"><MapPin className="h-5 w-5"/> <span>{SECOND.street}, {SECOND.postal} {SECOND.city}</span></a>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                <strong>Godziny otwarcia:</strong> {BIZ.legal.hours}
              </div>
            </div>
            <TelLink className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 font-semibold shadow hover:bg-rose-500"><Phone className="h-5 w-5"/>Zadzwoń teraz</TelLink>
            <div className="rounded-2xl border border-white/20 bg-neutral-900/90 p-5 text-sm text-white/85 space-y-3 shadow-xl shadow-black/30">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/65">
                <Facebook className="h-4 w-4 text-[#E11D48]" aria-hidden="true" /> Znajdź nas na Facebooku
              </div>
              <p className="font-semibold text-white">Zajrzyj na Facebooka 4 KÓŁKA</p>
              <p className="text-xs text-white/70 leading-relaxed">
                Aktualności z warsztatu, zdjęcia realizacji i informacje o wolnych terminach. Wpadnij na nasz profil, żeby być na bieżąco.
              </p>
              <a
                href={SOCIAL_LINKS.facebookPage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-base font-semibold text-[#F43F5E] hover:text-[#FDA4AF]"
              >
                Otwórz profil <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <div className="mt-5 rounded-xl border border-[#F43F5E]/20 bg-[#111]/95 p-4">
                <p className="font-semibold text-white">Zostaw opinię</p>
                <p className="mt-1 text-xs text-white/70">Byłeś/aś naszym klientem i jesteś zadowolony? Będziemy wdzięczni za kilka słów rekomendacji.</p>
                <a
                  href={SOCIAL_LINKS.facebookReviews}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#F43F5E] hover:text-[#FDA4AF]"
                >
                  Napisz opinię na Facebooku <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          {/* Formularz z E-mailem i VIN (wymagane) */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-lg font-semibold">Formularz zapytań</h3>
            <form className="relative mt-6 grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
              <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
                <label htmlFor="contact-company">Company</label>
                <input
                  id="contact-company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>
              <input
                required
                placeholder="Imię"
                value={form.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({ ...prev, name: value.trimStart() }));
                  setErrors((prev) => {
                    if (!prev?.name) return prev;
                    const next = { ...prev };
                    delete next.name;
                    return next;
                  });
                }}
                aria-invalid={!!errors?.name}
                className={`${inputBase} ${errors?.name ? "border-rose-500" : "border-white/15"}`}
              />
              {errors?.name && <p className="mt-1 text-xs text-rose-400">{errors?.name}</p>}
              <div>
                <label className="sr-only" htmlFor="phone-prefix">Telefon</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <div className="relative w-full sm:w-64">
                    <select
                      id="phone-prefix"
                      value={phonePrefix}
                      onChange={(e) => {
                        const newPrefix = e.target.value;
                        setPhonePrefix(newPrefix);
                        setErrors((prev) => {
                          const next = { ...prev };
                          const msg = getPhoneError(newPrefix, phoneLocal);
                          if (msg) next.phone = msg; else delete next.phone;
                          return next;
                        });
                      }}
                      className="h-12 w-full appearance-none rounded-xl border border-white/15 bg-neutral-900 px-4 pr-10 text-sm outline-none focus:border-rose-500"
                    >
                      {PHONE_PREFIXES.map((item) => (
                        <option key={item.code} value={item.code}>{`${item.flag} ${item.code} (${item.country})`}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" aria-hidden="true" />
                  </div>
                  <input
                    id="phone-local"
                    required
                    type="tel"
                    placeholder="np. 796 000 000"
                    value={phoneLocal}
                    onChange={(e) => {
                      const cleaned = sanitizeLocalPhone(e.target.value);
                      setPhoneLocal(cleaned);
                      setErrors((prev) => {
                        const next = { ...prev };
                        const msg = getPhoneError(phonePrefix, cleaned);
                        if (msg) next.phone = msg; else delete next.phone;
                        return next;
                      });
                    }}
                    aria-invalid={!!errors?.phone}
                    className={`h-12 w-full rounded-xl border bg-neutral-900 px-4 py-3 outline-none ${errors?.phone ? "border-rose-500" : "border-white/15"} focus:border-rose-500`}
                  />
                </div>
                {errors?.phone && <p className="mt-1 text-xs text-rose-400">{errors?.phone}</p>}
              </div>
              <div>
                <input
                  required
                  type="email"
                  inputMode="email"
                  placeholder="E-mail (wymagany)"
                  value={form.email}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, email: sanitizeEmail(e.target.value) }));
                    setErrors((prev) => {
                      if (!prev?.email) return prev;
                      const next = { ...prev };
                      delete next.email;
                      return next;
                    });
                  }}
                  aria-invalid={!!errors?.email}
                  className={`${inputBase} ${errors?.email ? "border-rose-500" : "border-white/15"}`}
                />
                {errors?.email && <p className="mt-1 text-xs text-rose-400">{errors?.email}</p>}
              </div>
              <div>
                <input
                  required
                  placeholder="VIN (wymagany)"
                  value={form.vin}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
                    setForm((prev) => ({ ...prev, vin: value }));
                    setErrors((prev) => {
                      if (!prev?.vin) return prev;
                      const next = { ...prev };
                      delete next.vin;
                      return next;
                    });
                  }}
                  pattern="[A-HJ-NPR-Z0-9]{17}"
                  maxLength={17}
                  aria-invalid={!!errors?.vin}
                  className={`${inputBase} ${errors?.vin ? "border-rose-500" : "border-white/15"}`}
                />
                {errors?.vin && <p className="mt-1 text-xs text-rose-400">{errors?.vin}</p>}
              </div>
              <textarea
                required
                placeholder="Opisz problem / markę i model"
                rows={4}
                value={form.msg}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({ ...prev, msg: value }));
                  setErrors((prev) => {
                    if (!prev?.msg) return prev;
                    const next = { ...prev };
                    delete next.msg;
                    return next;
                  });
                }}
                aria-invalid={!!errors?.msg}
                className={`w-full rounded-xl border bg-neutral-900 px-4 py-3 outline-none ${errors?.msg ? "border-rose-500" : "border-white/15"} focus:border-rose-500`}
              />
              {errors?.msg && <p className="mt-1 text-xs text-rose-400">{errors?.msg}</p>}
              <div>
                <label className="block text-sm font-medium text-white/80">Załącz pliki (opcjonalnie, maks. {MAX_ATTACHMENTS})</label>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="attachments-input"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/10"
                  >
                    <Paperclip className="h-4 w-4" /> Dodaj załącznik
                  </label>
                  <input
                    id="attachments-input"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="text-xs text-white/60">Możesz przeciągnąć pliki lub kliknąć przycisk, aby wybrać z urządzenia.</span>
                </div>
                {files.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-white/70">
                    {files.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2">
                        <span className="truncate" title={`${file.name} (${(file.size/1024).toFixed(0)} KB)`}>{file.name}</span>
                        <button type="button" onClick={() => removeFile(index)} className="text-rose-400 hover:text-rose-300">Usuń</button>
                      </li>
                    ))}
                  </ul>
                )}
                {fileError && <p className="mt-2 text-xs text-rose-400">{fileError}</p>}
                <p className="mt-2 text-xs text-white/50">
                  Łączny rozmiar: {formatFileSize(totalAttachmentBytes)} / {MAX_TOTAL_ATTACHMENT_SIZE_MB} MB.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className={`rounded-2xl bg-rose-600 px-4 py-3 font-semibold shadow transition ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'hover:bg-rose-500'}`}
              >
                {isSubmitting ? 'Wysyłanie…' : 'Wyślij zapytanie'}
              </button>
            </form>
          </div>
        </div>
      </Section>

      {/* ===== MAPA (dolne karty z takim samym 'carbon' jak w hero) ===== */}
      <Section id="mapa" className="border-t border-white/10 bg-neutral-900" container={false}>
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Mapa dojazdu</h2>
          <p className="mt-3 text-white/70">Dwie lokalizacje: {BIZ.city} i {SECOND.city}</p>
        </div>

        <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-10 md:gap-12 px-4">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 p-8 shadow-2xl" style={carbonStyle}>
            <h3 className="text-sm font-semibold text-white/80">{BIZ.city}</h3>
            <div className="mt-2 flex items-center gap-2 text-white/80"><MapPin className="h-5 w-5"/> {BIZ.street}, {BIZ.postal} {BIZ.city}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BIZ.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/15 px-3 py-2 hover:bg-white/10">Otwórz w Mapach</a>
            </div>
            <MapEmbed query={BIZ.mapQuery} title={`Mapa – ${BIZ.city}`} className="mt-4" height={420} />
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 p-8 shadow-2xl" style={carbonStyle}>
            <h3 className="text-sm font-semibold text-white/80">{SECOND.city}</h3>
            <div className="mt-2 flex items-center gap-2 text-white/80"><MapPin className="h-5 w-5"/> {SECOND.street}, {SECOND.postal} {SECOND.city}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SECOND.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/15 px-3 py-2 hover:bg-white/10">Otwórz w Mapach</a>
            </div>
            <MapEmbed query={SECOND.mapQuery} title={`Mapa – ${SECOND.city}`} className="mt-4" height={420} />
          </div>
        </div>
      </Section>

      {/* ===== STOPKA ===== */}
      <footer className="border-t border-white/10 bg-neutral-950 py-10 text-sm text-white/70">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-6 px-4 md:grid-cols-[auto_1fr_auto] md:items-center">
          {/* lewy blok: logo + adresy */}
          <div className="shrink-0">
            <div className="relative inline-flex items-center gap-2 mb-1">
              <BrandLogo variant="footer" />
            </div>
            <div className="mt-1 space-y-1 md:whitespace-nowrap">
              <div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BIZ.mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {BIZ.street}, {BIZ.postal} {BIZ.city}
                </a>
              </div>
              <div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SECOND.mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {SECOND.street}, {SECOND.postal} {SECOND.city}
                </a>
              </div>
            </div>
          </div>

          {/* środkowy blok: linki – zawsze idealnie wyśrodkowane */}
          <nav className="hidden md:flex flex-nowrap items-center gap-8 md:mx-auto whitespace-nowrap">
            <a href="#uslugi" className="hover:underline">Usługi</a>
            <a href="#dlaczego-my" className="hover:underline">Dlaczego my</a>
            <a href="#kontakt" className="hover:underline">Kontakt</a>
            <a
              href="#polityka"
              onClick={(e)=>{e.preventDefault(); if(typeof window!== 'undefined'){ window.dispatchEvent(new Event('open-policy')); }}}
              className="hover:underline"
            >
              Polityka prywatności
            </a>
            <a
              href="#cookies"
              onClick={(e)=>{e.preventDefault(); if(typeof window!== 'undefined'){ window.dispatchEvent(new Event('open-consent')); }}}
              className="hover:underline"
            >
              Zarządzaj cookies
            </a>
          </nav>

          {/* prawy blok: prawa autorskie + podpis – wyrównane do prawej */}
          <div className="w-full md:w-auto md:shrink-0 text-right">
            <div className="md:whitespace-nowrap">
              © {new Date().getFullYear()} {BIZ.name}. Wszelkie prawa zastrzeżone.
            </div>
            <div className="mt-1 text-xs text-white/50 md:whitespace-nowrap">
              <a
                href="https://pl.linkedin.com/in/patrycja-dejneka-365464253"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-block"
              >
                Projekt i realizacja: Patrycja Dejneka
              </a>
            </div>
          </div>
        </div>
      </footer>

      <FeedbackModal data={feedback} onClose={handleFeedbackClose} closeRef={feedbackCloseRef} />

      {/* ===== PASEK COOKIES ===== */}
      <ConsentManager />
    </div>
  );
}

/* ==================== MODAL FEEDBACK ==================== */

function FeedbackModal({ data, onClose, closeRef }) {
  if (!data) return null;
  const isSuccess = data.type === 'success';
  const Icon = isSuccess ? CheckCircle2 : AlertTriangle;
  const iconColor = isSuccess ? 'text-emerald-400' : 'text-amber-400';
  const showContact = !isSuccess && data?.showContact;

  useEffect(() => {
    if (!data) return;
    const closeEl = closeRef?.current;
    if (closeEl && typeof closeEl.focus === 'function') {
      closeEl.focus();
    }
  }, [data, closeRef]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-white">{data.title}</h3>
            <div className="mt-3 flex items-start gap-3 text-sm text-white/80">
              <Icon className={`mt-[3px] h-5 w-5 shrink-0 ${iconColor}`} aria-hidden="true" />
              <p>{data.message}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-3 py-1 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Zamknij
          </button>
        </div>

        {showContact && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <TelLink className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-500">
              <Phone className="h-4 w-4" /> Zadzwoń: {BIZ.phone}
            </TelLink>
            <a
              href={`mailto:${BIZ.email}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Napisz e-mail
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== CONSENT MANAGER (z broadcastem) ==================== */

function ConsentManager(){
  const [open, setOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  function PolicyModalInner({ open, onClose }){
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center">
        <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl md:p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Polityka prywatności i cookies</h3>
            <button onClick={onClose} className="rounded-xl border border-white/15 px-3 py-1 text-sm hover:bg-white/10">Zamknij</button>
          </div>
          <div className="mt-4 max-h-[70vh] overflow-y-auto space-y-4 text-sm text-white/80">
            <p><strong>Administrator danych:</strong> {BIZ.legal.company}, {BIZ.legal.seat.street}, {BIZ.legal.seat.postal} {BIZ.legal.seat.city}. Kontakt: <a href={`mailto:${BIZ.email}`} className="underline">{BIZ.email}</a>, tel. {BIZ.phone}.</p>
            <h4 className="font-semibold text-white">1. Cookies i podobne technologie</h4>
            <p>Stosujemy wyłącznie: (a) pliki <strong>niezbędne</strong> – zapamiętują Twój wybór zgód; (b) pliki <strong>marketingowe/media</strong> – po wyrażeniu zgody ładują Mapy Google. Brak zgody oznacza brak wczytania map.</p>
            <p>Cookies zgody przechowujemy do 12 miesięcy, pliki Map Google – zgodnie z zasadami Google Ireland/Google LLC (transfer danych poza EOG). Zgody możesz zmienić w każdej chwili w stopce („Zarządzaj cookies”).</p>
            <h4 className="font-semibold text-white">2. Formularz kontaktowy</h4>
            <p>Dane: imię, telefon, e-mail, VIN i treść wiadomości. Cel: obsługa zapytania i umówienie wizyty (art. 6 ust. 1 lit. b RODO) oraz nasz uzasadniony interes – korespondencja (art. 6 ust. 1 lit. f RODO). Dane trafiają do skrzynki e-mail warsztatu i są usuwane najpóźniej po 6 miesiącach od zakończenia sprawy, chyba że przepisy wymagają dłuższego okresu.</p>
            <h4 className="font-semibold text-white">3. Twoje prawa</h4>
            <p>Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, sprzeciwu, przeniesienia oraz wniesienia skargi do Prezesa UODO. Zgody marketingowej możesz udzielić lub cofnąć w każdej chwili – cofnięcie nie wpływa na legalność wcześniejszego przetwarzania.</p>
            <p className="text-xs text-white/50">Wersja informacji: {CONSENT_VERSION}</p>
          </div>
        </div>
      </div>
    );
}

  useEffect(() => {
    const current = readConsent();
    if (!current) {
      setShowBanner(true);
    } else {
      setPrefs({ ...DEFAULT_PREFS, ...current.prefs });
    }
    const handler = () => setOpen(true);
    const policyHandler = () => setPolicyOpen(true);
    window.addEventListener('open-consent', handler);
    window.addEventListener('open-policy', policyHandler);
    return () => {
      window.removeEventListener('open-consent', handler);
      window.removeEventListener('open-policy', policyHandler);
    };
  }, []);

  const acceptAll = () => {
    const p = { ...DEFAULT_PREFS, marketing: true };
    writeConsent(p); setPrefs(p); setShowBanner(false); setOpen(false);
    window.dispatchEvent(new Event('consent-updated'));
  };
  const rejectAll = () => {
    const p = { ...DEFAULT_PREFS, marketing: false };
    writeConsent(p); setPrefs(p); setShowBanner(false); setOpen(false);
    window.dispatchEvent(new Event('consent-updated'));
  };
  const save = () => {
    writeConsent(prefs); setShowBanner(false); setOpen(false);
    window.dispatchEvent(new Event('consent-updated'));
  };

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[95%] -translate-x-1/2 rounded-2xl border border-white/10 bg-neutral-900 p-4 text-sm text-white/80 shadow-2xl md:w-[800px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="md:max-w-[60%]">
              Używamy niezbędnych cookies do zapamiętania Twoich wyborów oraz (po zgodzie) plików marketingowych, aby wyświetlić Mapy Google.
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button onClick={() => setOpen(true)} className="rounded-xl border border-white/15 px-3 py-2 font-semibold hover:bg-white/10">Zarządzaj cookies</button>
              <button onClick={rejectAll} className="rounded-xl border border-white/15 px-3 py-2 font-semibold hover:bg-white/10">Odrzuć</button>
              <button onClick={acceptAll} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 font-semibold text-white hover:bg-rose-500">
                <Cookie className="h-4 w-4" aria-hidden="true" /> Akceptuję
              </button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl md:p-8">
            <h3 className="text-lg font-bold">Ustawienia prywatności (cookies)</h3>
            <p className="mt-2 text-sm text-white/70">Wybierz, na co się zgadzasz. Zmianę możesz zrobić w każdym czasie w stopce („Zarządzaj cookies”).</p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <input type="checkbox" checked disabled className="mt-1" />
                <span>
                  <span className="font-semibold">Niezbędne</span>
                  <span className="block text-sm text-white/70">Wymagane do działania strony. Zapisujemy jedynie Twój wybór zgód.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <input type="checkbox" checked={prefs.marketing} onChange={(e)=>setPrefs(v=>({...v, marketing: e.target.checked}))} className="mt-1" />
                <span>
                  <span className="font-semibold">Marketing/Media</span>
                  <span className="block text-sm text-white/70">Wyświetlanie Map Google – bez zgody pokazujemy jedynie linki.</span>
                </span>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button onClick={rejectAll} className="rounded-xl border border-white/15 px-4 py-2 font-semibold hover:bg-white/10">Odrzuć wszystkie</button>
              <button onClick={acceptAll} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white shadow hover:bg-rose-500">
                <Cookie className="h-4 w-4" aria-hidden="true" /> Akceptuj wszystkie
              </button>
              <button onClick={save} className="rounded-xl border border-white/15 px-4 py-2 font-semibold hover:bg-white/10">Zapisz wybór</button>
            </div>

            <p className="mt-3 text-xs text-white/50">
              Więcej informacji: <button onClick={() => setPolicyOpen(true)} className="underline hover:text-white/70">Polityka prywatności i cookies</button>
            </p>
          </div>
        </div>
      )}

      <PolicyModalInner open={policyOpen} onClose={() => setPolicyOpen(false)} />
    </>
  );
}
