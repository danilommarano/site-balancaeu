<script lang="ts">
  type Props = {
    cms?: Record<string, Record<string, string>>;
    modalidades?: { id: string; nome: string }[];
    professores?: { id: string; nome: string }[];
  };

  let { cms = {}, modalidades = [], professores = [] }: Props = $props();

  const hero = $derived(cms.hero ?? {});
  const HERO_IMG = $derived(hero.imagem || "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?q=80&w=1600&auto=format&fit=crop");

  const titulo = $derived(hero.titulo || 'Balança Eu: muito mais que uma escola de dança.');
  const subtitulo = $derived(hero.subtitulo || 'Um movimento que começa no corpo e se espalha pela alma. Forró, samba, zumba — e a descoberta de quem você é quando dança.');
  const ctaTexto = $derived(hero.cta_texto || 'Agende aula experimental');
  const ctaLink = $derived(hero.cta_link || '/comecar');
  const fraseDestaque = $derived(hero.frase_destaque || 'Movimento é cura.');
  const tagAoVivo = $derived(hero.tag_ao_vivo || 'Ao vivo · sala 3');

  const palavras = $derived(titulo.split(/\s+/));

  const numModalidades = $derived(modalidades.length || 4);
  const numProfessores = $derived(professores.length || 12);
</script>

<section class="hero" id="top">
  <!-- Decoração de fundo: formas que sugerem movimento -->
  <div class="hero__bg" aria-hidden="true">
    <svg class="hero__bg-shape hero__bg-shape--1" viewBox="0 0 600 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="heroGrad1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#F08478" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#F08478" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="280" fill="url(#heroGrad1)"/>
    </svg>
    <svg class="hero__bg-shape hero__bg-shape--2" viewBox="0 0 600 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="heroGrad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#D9A84A" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#D9A84A" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="280" fill="url(#heroGrad2)"/>
    </svg>
    <svg class="hero__bg-shape hero__bg-shape--3" viewBox="0 0 600 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="heroGrad3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#A83A2E" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#A83A2E" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="280" fill="url(#heroGrad3)"/>
    </svg>

    <!-- Curvas/ondas que sugerem movimento -->
    <svg class="hero__waves" viewBox="0 0 1200 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,200 Q300,120 600,200 T1200,200" stroke="#F08478" stroke-width="1.5" stroke-opacity="0.35" fill="none"/>
      <path d="M0,240 Q300,160 600,240 T1200,240" stroke="#A83A2E" stroke-width="1" stroke-opacity="0.25" fill="none"/>
      <path d="M0,280 Q300,200 600,280 T1200,280" stroke="#D9A84A" stroke-width="1" stroke-opacity="0.3" fill="none"/>
    </svg>

    <!-- Pontos rítmicos -->
    <span class="hero__dot hero__dot--a"></span>
    <span class="hero__dot hero__dot--b"></span>
    <span class="hero__dot hero__dot--c"></span>
    <span class="hero__dot hero__dot--d"></span>
  </div>

  <div class="container hero__grid">
    <div>
      <div class="hero__eyebrow">
        <span class="hero__eyebrow-line"></span>
        <span class="eyebrow">Escola de dança · Brasil</span>
      </div>
      <h1 class="hero__title">
        {#each palavras as word, i}
          <span class="word"><span style="animation-delay: {i * 80}ms">{@html word.includes('*') ? `<em>${word.replace(/\*/g, '')}</em>` : word}</span></span>{" "}
        {/each}
      </h1>
      <p class="hero__sub">{subtitulo}</p>
      <div class="hero__cta">
        <a href={ctaLink} class="btn btn--primary">
          {ctaTexto}
          <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
        <a href="#filosofia" class="btn btn--ghost">
          Nossa filosofia
          <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
      <div class="hero__meta">
        <div class="hero__meta-item">
          <div class="hero__meta-num">{numModalidades}</div>
          <div class="hero__meta-label">Modalidades</div>
        </div>
        <div class="hero__meta-item">
          <div class="hero__meta-num">{numProfessores}</div>
          <div class="hero__meta-label">Mestres</div>
        </div>
        <div class="hero__meta-item">
          <div class="hero__meta-num">500+</div>
          <div class="hero__meta-label">Alunos ativos</div>
        </div>
      </div>
    </div>

    <div class="hero__visual">
      <img src={HERO_IMG} alt="Dançarina em movimento" class="hero__visual-img" />
      <div class="hero__tag">
        <span class="dot"></span>
        {tagAoVivo}
      </div>
      <div class="hero__badge">{fraseDestaque}</div>
    </div>
  </div>

</section>

<style>
  /* Decoração de fundo do hero */
  .hero__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }
  .hero__bg-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    will-change: transform;
  }
  .hero__bg-shape--1 {
    width: 520px; height: 520px;
    top: -80px; left: -120px;
    animation: heroFloat1 14s ease-in-out infinite;
  }
  .hero__bg-shape--2 {
    width: 460px; height: 460px;
    top: 30%; right: -140px;
    animation: heroFloat2 18s ease-in-out infinite;
  }
  .hero__bg-shape--3 {
    width: 420px; height: 420px;
    bottom: -60px; left: 30%;
    animation: heroFloat3 16s ease-in-out infinite;
  }
  @keyframes heroFloat1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(40px, 30px) scale(1.05); }
  }
  @keyframes heroFloat2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-50px, 20px) scale(0.95); }
  }
  @keyframes heroFloat3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -30px) scale(1.08); }
  }

  .hero__waves {
    position: absolute;
    left: 0; right: 0;
    bottom: 8%;
    width: 100%;
    height: 40%;
    opacity: 0.7;
    animation: waveDrift 22s ease-in-out infinite;
  }
  @keyframes waveDrift {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-30px); }
  }

  /* Pontos rítmicos espalhados */
  .hero__dot {
    position: absolute;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--terracota);
    opacity: 0.55;
    animation: dotPulse 3s ease-in-out infinite;
  }
  .hero__dot--a { top: 22%; left: 8%; background: var(--terracota); animation-delay: 0s; }
  .hero__dot--b { top: 14%; right: 18%; background: var(--coral); width: 6px; height: 6px; animation-delay: 0.6s; }
  .hero__dot--c { bottom: 30%; left: 14%; background: var(--ocre); width: 10px; height: 10px; animation-delay: 1.2s; }
  .hero__dot--d { bottom: 18%; right: 10%; background: var(--coral); animation-delay: 1.8s; }
  @keyframes dotPulse {
    0%, 100% { transform: scale(1); opacity: 0.55; }
    50% { transform: scale(1.6); opacity: 0.9; }
  }

  /* Garante que o conteúdo fica acima da decoração */
  :global(.hero .container) { position: relative; z-index: 1; }
  :global(.hero__marquee) { position: relative; z-index: 1; }

  /* KPIs com mais presença visual */
  :global(.hero__meta-item) {
    border-top: 1px solid var(--line);
    border-left: 0;
    padding: 14px 0 0;
    transition: transform .3s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
  }
  :global(.hero__meta-item:hover) {
    transform: translateY(-3px);
  }
  :global(.hero__meta-item:hover) :global(.hero__meta-num) {
    color: var(--coral);
  }

  @media (max-width: 760px) {
    .hero__bg-shape--1 { width: 320px; height: 320px; top: -60px; left: -100px; }
    .hero__bg-shape--2 { width: 280px; height: 280px; right: -80px; }
    .hero__bg-shape--3 { width: 260px; height: 260px; left: 20%; bottom: -40px; }
    .hero__dot { display: none; }
    .hero__waves { bottom: 16%; }

    /* KPI mobile: card-like com border-left terracota */
    :global(.hero__meta) {
      grid-template-columns: 1fr !important;
      gap: 10px !important;
      margin-top: 36px !important;
    }
    :global(.hero__meta-item) {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 14px;
      align-items: baseline;
      padding: 14px 16px;
      border-top: 0;
      border-left: 3px solid var(--terracota);
      background: linear-gradient(90deg, rgba(168, 58, 46, 0.06), transparent 70%);
      border-radius: 0 12px 12px 0;
    }
    :global(.hero__meta-item:nth-child(2)) { border-left-color: var(--coral); background: linear-gradient(90deg, rgba(240, 132, 120, 0.08), transparent 70%); }
    :global(.hero__meta-item:nth-child(3)) { border-left-color: var(--ocre); background: linear-gradient(90deg, rgba(217, 168, 74, 0.08), transparent 70%); }
    :global(.hero__meta-num) {
      font-size: 38px !important;
      line-height: 1 !important;
      min-width: 70px;
    }
    :global(.hero__meta-label) {
      margin-top: 0 !important;
      font-size: 11px !important;
      letter-spacing: 0.15em !important;
    }
  }

  @media (max-width: 460px) {
    :global(.hero__meta-num) { font-size: 32px !important; }
  }
</style>
