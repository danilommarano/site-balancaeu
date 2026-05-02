const HERO_IMG = "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?q=80&w=1600&auto=format&fit=crop";

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__grid">
        <div>
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-line"></span>
            <span className="eyebrow">Escola de dança · Brasil</span>
          </div>
          <h1 className="hero__title">
            <span className="word"><span style={{animationDelay: "0ms"}}>Balança</span></span>{" "}
            <span className="word"><span style={{animationDelay: "80ms"}}>Eu:</span></span>{" "}
            <span className="word"><span style={{animationDelay: "160ms"}}><em>muito</em></span></span>{" "}
            <span className="word"><span style={{animationDelay: "240ms"}}><em>mais</em></span></span>{" "}
            <span className="word"><span style={{animationDelay: "320ms"}}>que</span></span>{" "}
            <span className="word"><span style={{animationDelay: "400ms"}}>uma</span></span>{" "}
            <span className="word"><span style={{animationDelay: "480ms"}}>escola</span></span>{" "}
            <span className="word"><span style={{animationDelay: "560ms"}}>de</span></span>{" "}
            <span className="word"><span style={{animationDelay: "640ms"}}>dança.</span></span>
          </h1>
          <p className="hero__sub">
            Um movimento que começa no corpo e se espalha pela alma. Forró, samba, zumba — e a descoberta de quem você é quando dança.
          </p>
          <div className="hero__cta">
            <a href="comecar.html" className="btn btn--primary">
              Agende aula experimental <Arrow />
            </a>
            <a href="#filosofia" className="btn btn--ghost">
              Nossa filosofia <Arrow />
            </a>
          </div>
          <div className="hero__meta">
            <div className="hero__meta-item">
              <div className="hero__meta-num">4</div>
              <div className="hero__meta-label">Modalidades</div>
            </div>
            <div className="hero__meta-item">
              <div className="hero__meta-num">12</div>
              <div className="hero__meta-label">Mestres</div>
            </div>
            <div className="hero__meta-item">
              <div className="hero__meta-num">500+</div>
              <div className="hero__meta-label">Alunos ativos</div>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <img src={HERO_IMG} alt="Dançarina em movimento" className="hero__visual-img" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <div className="hero__tag">
            <span className="dot"></span>
            Ao vivo · sala 3
          </div>
          <div className="hero__badge">Movimento é cura.</div>
        </div>
      </div>

      <div className="hero__marquee" aria-hidden="true">
        <div className="hero__marquee-track">
          <span>Forró Pé Descalço</span><span className="dot"></span>
          <span><em>Samba de Gafieira</em></span><span className="dot"></span>
          <span>Forró Roots</span><span className="dot"></span>
          <span><em>Zumba</em></span><span className="dot"></span>
          <span>Forró Pé Descalço</span><span className="dot"></span>
          <span><em>Samba de Gafieira</em></span><span className="dot"></span>
          <span>Forró Roots</span><span className="dot"></span>
          <span><em>Zumba</em></span><span className="dot"></span>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { Hero });
