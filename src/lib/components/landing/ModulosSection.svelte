<script lang="ts">
  type Modalidade = { id: string; nome: string; descricao: string; imagemUrl?: string | null };

  let { cms = {}, modalidades = [] }: {
    cms?: Record<string, Record<string, string>>;
    modalidades?: Modalidade[];
  } = $props();

  const sec = $derived(cms.modulos ?? {});
  const titulo = $derived(sec.titulo || 'Nossos <em>módulos.</em>');
  const descricao = $derived(sec.descricao || 'Quatro linguagens corporais, uma só escola. Explore cada modalidade e encontre o ritmo que vai te transformar.');

  const LABELS = ['Tradição', 'Raiz', 'Elegância', 'Energia', 'Ritmo', 'Expressão', 'Conexão', 'Liberdade'];

  const modulos = $derived(
    modalidades.length > 0
      ? modalidades.map((m, i) => ({
          num: String(i + 1).padStart(2, '0'),
          label: LABELS[i % LABELS.length],
          title: m.nome,
          desc: m.descricao,
          id: m.id
        }))
      : [
          { num: "01", label: "Tradição", title: "Forró Pé Descalço", desc: "Método próprio de ensino com progressão por graduações — do Azul Iniciante à Preta Avançada.", id: '' },
          { num: "02", label: "Raiz", title: "Forró Roots", desc: "Forró tradicional nordestino: passo marcado, giros e caminhadas. A raiz que move o corpo.", id: '' },
          { num: "03", label: "Elegância", title: "Samba de Gafieira", desc: "O samba dos salões cariocas. Técnica, musicalidade e conexão em dupla.", id: '' },
          { num: "04", label: "Energia", title: "Zumba", desc: "Fitness com ritmos latinos para extravasar, suar e sorrir de verdade.", id: '' },
        ]
  );

  const total = $derived(modulos.length);
</script>

<section class="sec-modulos" id="modulos">
  <div class="container">
    <div class="sec-modulos__head">
      <h2 class="sec-modulos__title">{@html titulo}</h2>
      <p class="sec-modulos__intro">{descricao}</p>
    </div>
    <div class="modulo-grid">
      {#each modulos as m}
        <article class="modulo">
          <div class="modulo__img"></div>
          <div class="modulo__pattern"></div>
          <span class="modulo__shine" aria-hidden="true"></span>
          <div class="modulo__content">
            <div class="modulo__top">
              <div class="modulo__num">{m.num} / {String(total).padStart(2, '0')}</div>
              <span class="modulo__label">{m.label}</span>
            </div>
            <div>
              <h3 class="modulo__title">{m.title}</h3>
              <p class="modulo__desc">{m.desc}</p>
              <div class="modulo__cta">
                Explorar módulo
                <svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  /* Shimmer sutil que atravessa o card lentamente — funciona em desktop e mobile */
  :global(.modulo__shine) {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      115deg,
      transparent 30%,
      rgba(248, 241, 233, 0.08) 48%,
      rgba(248, 241, 233, 0.18) 50%,
      rgba(248, 241, 233, 0.08) 52%,
      transparent 70%
    );
    transform: translateX(-100%);
    animation: moduloShine 7s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) infinite;
    pointer-events: none;
    z-index: 1;
    mix-blend-mode: overlay;
  }
  :global(.modulo:nth-child(2) .modulo__shine) { animation-delay: 1.6s; }
  :global(.modulo:nth-child(3) .modulo__shine) { animation-delay: 3.2s; }
  :global(.modulo:nth-child(4) .modulo__shine) { animation-delay: 4.8s; }

  @keyframes moduloShine {
    0%   { transform: translateX(-100%); }
    55%  { transform: translateX(120%); }
    100% { transform: translateX(120%); }
  }

  /* Pulso muito sutil no gradient (sensação de respirar) */
  :global(.modulo__img) {
    background-size: 100% 130% !important;
    background-position: 50% 50% !important;
    animation: moduloBreathe 9s ease-in-out infinite;
  }
  :global(.modulo:nth-child(2) .modulo__img) { animation-delay: 1.2s; }
  :global(.modulo:nth-child(3) .modulo__img) { animation-delay: 2.4s; }
  :global(.modulo:nth-child(4) .modulo__img) { animation-delay: 3.6s; }
  @keyframes moduloBreathe {
    0%, 100% { background-position: 50% 35%; }
    50%      { background-position: 50% 65%; }
  }

  /* Mobile: card horizontal/compacto. ~3 visíveis na primeira tela. */
  @media (max-width: 760px) {
    :global(.modulo-grid) {
      grid-template-columns: 1fr !important;
      gap: 10px !important;
    }
    :global(.modulo) {
      aspect-ratio: auto !important;
      min-height: 130px !important;
      height: 130px !important;
      border-radius: 14px;
    }
    :global(.modulo .modulo__num),
    :global(.modulo .modulo__label),
    :global(.modulo .modulo__top) {
      display: none !important;
    }
    :global(.modulo .modulo__content) {
      padding: 18px 20px !important;
      justify-content: flex-end !important;
    }
    :global(.modulo .modulo__title) {
      font-size: 22px !important;
      line-height: 1;
    }
    :global(.modulo .modulo__desc) {
      font-size: 12px !important;
      line-height: 1.4;
      margin-top: 4px !important;
      max-width: 38ch;
      /* Limita a 1 linha com elipse pra manter ultra-compactos */
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    :global(.modulo .modulo__cta) {
      margin-top: 8px !important;
      font-size: 10px !important;
      letter-spacing: 0.16em !important;
    }
    :global(.modulo:active) {
      transform: scale(0.985);
    }
    :global(.modulo:active .modulo__cta .arrow) {
      transform: translateX(3px);
    }
    :global(.modulo .modulo__cta .arrow) {
      transition: transform .25s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
    }

    /* Header da seção mais compacto pra dar mais espaço aos cards */
    :global(.sec-modulos) {
      padding: 50px 0 60px !important;
    }
    :global(.sec-modulos__title) {
      font-size: clamp(30px, 8vw, 42px);
      line-height: 1.05;
    }
    :global(.sec-modulos__intro) {
      font-size: 13px !important;
      line-height: 1.5;
      margin-top: 10px;
    }
    :global(.sec-modulos__head) {
      gap: 10px !important;
      margin-bottom: 22px !important;
    }
  }
</style>
