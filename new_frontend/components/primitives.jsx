// Shared primitive components + hooks

const Arrow = ({ size = 16 }) => (
  <svg className="arrow" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const Check = () => (
  <svg className="plano__check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 12 10 18 20 6" />
  </svg>
);

const PersonIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="40" cy="30" r="12" />
    <path d="M16 68 Q 16 48 40 48 Q 64 48 64 68" strokeLinecap="round" />
  </svg>
);

// Intersection-observer reveal hook
function useReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

const Reveal = ({ children, stagger = false, as: Tag = "div", className = "", ...rest }) => {
  const ref = useReveal();
  const cls = (stagger ? "reveal-stagger " : "reveal ") + className;
  return <Tag ref={ref} className={cls} {...rest}>{children}</Tag>;
};

// Soft wavy divider
const Wave = ({ fill = "#F8F1E9", flip = false }) => (
  <div className="wave" style={{ transform: flip ? "scaleY(-1)" : "none", lineHeight: 0 }}>
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
        fill={fill}
      />
    </svg>
  </div>
);

Object.assign(window, { Arrow, Check, PersonIcon, useReveal, Reveal, Wave });
