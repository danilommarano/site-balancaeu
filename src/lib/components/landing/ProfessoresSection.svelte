<script lang="ts">
  type Professor = {
    id: string;
    nome: string;
    teacher: { bio: string | null; especialidades: string[]; imagemUrl: string | null } | null;
  };

  let { cms = {}, professores = [] }: {
    cms?: Record<string, Record<string, string>>;
    professores?: Professor[];
  } = $props();

  const sec = $derived(cms.professores ?? {});
  const label = $derived(sec.label || 'Mestres do movimento');
  const titulo = $derived(sec.titulo || 'Quem <em>conduz</em> sua evolução.');
  const descricao = $derived(sec.descricao || 'Nossa equipe é formada por artistas apaixonados e profissionais sensíveis ao seu tempo e ritmo.');

  const FALLBACK_PROFS = [
    { name: "Ani Gâlíoti", badge: "Mestra", tags: "Samba de Gafieira · Dança de Salão", bio: "Profissional com forte formação em dança de salão brasileira.", img: null },
    { name: "Danilo Marano", badge: "Mestre", tags: "Forró Roots · Forró Pé de Serra", bio: "Apaixonado pela tradição nordestina e pela dança enraizada na cultura popular.", img: null },
    { name: "Mari Meireles", badge: "Mestra", tags: "Forró Roots · Footwork", bio: "Dançarina há mais de uma década, especialista em footwork e técnica feminina.", img: null },
    { name: "Renato Almeida", badge: "Mestre", tags: "Samba de Gafieira · Salão", bio: "Herdeiro da escola carioca tradicional dos salões.", img: null },
  ];

  const profs = $derived(
    professores.length > 0
      ? professores.map(p => ({
          name: p.nome,
          badge: 'Mestre(a)',
          tags: p.teacher?.especialidades?.join(' · ') || '',
          bio: p.teacher?.bio || '',
          img: p.teacher?.imagemUrl || null
        }))
      : FALLBACK_PROFS
  );

  function initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
  }
</script>

<section class="sec-prof" id="professores">
  <div class="container">
    <div class="sec-prof__head">
      <div>
        <div class="eyebrow">{label}</div>
        <h2 class="sec-prof__title">{@html titulo}</h2>
      </div>
      <p class="sec-prof__intro">{descricao}</p>
    </div>
    <div class="prof-grid">
      {#each profs as p}
        <article class="prof-card">
          <!-- Imagem grande (desktop) -->
          <div class="prof-card__img">
            <span class="prof-card__badge">{p.badge}</span>
            {#if p.img}
              <img src={p.img} alt={p.name} class="prof-card__photo" />
            {:else}
              <div class="prof-card__placeholder">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="40" cy="30" r="12" />
                  <path d="M16 68 Q 16 48 40 48 Q 64 48 64 68" stroke-linecap="round" />
                </svg>
              </div>
            {/if}
          </div>
          <!-- Avatar circular (mobile) -->
          <div class="prof-card__avatar" aria-hidden="true">
            {#if p.img}
              <img src={p.img} alt="" />
            {:else}
              <span>{initials(p.name)}</span>
            {/if}
          </div>
          <div class="prof-card__body">
            <h3 class="prof-card__name">{p.name}</h3>
            <div class="prof-card__tags">{p.tags}</div>
            <p class="prof-card__bio">{p.bio}</p>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  /* Avatar circular: visível só em mobile */
  :global(.prof-card__avatar) {
    display: none;
    width: 84px;
    height: 84px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    background: linear-gradient(135deg, var(--coral), var(--ocre));
    color: var(--terracota-ink);
    align-items: center;
    justify-content: center;
    font-family: var(--serif);
    font-size: 28px;
    font-weight: 500;
    letter-spacing: -0.02em;
    border: 2px solid var(--creme);
    box-shadow: 0 8px 20px -10px rgba(74, 20, 15, 0.3);
  }
  :global(.prof-card__avatar img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  :global(.prof-card__avatar span) {
    display: block;
  }

  @media (max-width: 760px) {
    :global(.prof-grid) {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
    :global(.prof-card) {
      display: grid !important;
      grid-template-columns: 84px 1fr !important;
      grid-template-areas: "avatar body" !important;
      gap: 16px !important;
      padding: 18px !important;
      align-items: start;
      background: var(--creme-warm);
      border-radius: 16px;
      border: 1px solid var(--line);
    }
    :global(.prof-card__img) {
      display: none !important;
    }
    :global(.prof-card__avatar) {
      grid-area: avatar;
      display: flex;
    }
    :global(.prof-card__body) {
      grid-area: body;
      min-width: 0;
    }
    :global(.prof-card__name) {
      font-size: 19px !important;
      line-height: 1.2;
      letter-spacing: -0.01em;
      margin-bottom: 2px;
    }
    :global(.prof-card__tags) {
      font-size: 11px !important;
      letter-spacing: 0.12em !important;
      color: var(--terracota);
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    :global(.prof-card__bio) {
      font-size: 13px !important;
      color: var(--ink-soft);
      line-height: 1.5;
    }
  }
</style>
