<script lang="ts">
  type Evento = {
    id: string;
    titulo: string;
    descricao: string;
    data: string;
    horario: string;
    local: string;
    preco: number | null;
  };

  let { cms = {}, eventos = [] }: {
    cms?: Record<string, Record<string, string>>;
    eventos?: Evento[];
  } = $props();

  const sec = $derived(cms.eventos ?? {});
  const label = $derived(sec.label || 'Agenda cultural');
  const titulo = $derived(sec.titulo || 'Próximos <em>eventos.</em>');
  const descricao = $derived(sec.descricao || 'Vibrações que transcendem as aulas regulares. Conheça nossa programação especial.');

  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const eventosFormatados = $derived(
    eventos.map(e => {
      const d = new Date(e.data);
      return {
        day: String(d.getDate()).padStart(2, '0'),
        month: MESES[d.getMonth()],
        title: e.titulo,
        sub: `${e.local} · ${e.horario}`,
        tag: e.preco === null || e.preco === 0 ? 'Gratuito' : `R$ ${e.preco}`,
        tagCls: e.preco === null || e.preco === 0 ? 'is-ghost' : ''
      };
    })
  );
</script>

{#if eventosFormatados.length > 0}
<section class="sec-agenda" id="agenda">
  <div class="container">
    <div class="sec-agenda__head">
      <div class="eyebrow">{label}</div>
      <h2 class="sec-agenda__title">{@html titulo}</h2>
      <p style="font-size: 16px; color: var(--ink-soft); margin-top: 16px; max-width: 520px; margin-left: auto; margin-right: auto;">
        {descricao}
      </p>
    </div>
    <div class="agenda-list">
      {#each eventosFormatados as e}
        <article class="agenda-row">
          <div class="agenda-date">
            {e.day}
            <small>{e.month}</small>
          </div>
          <div class="agenda-info">
            <h3>{e.title}</h3>
            <p>{e.sub}</p>
          </div>
          <span class="agenda-tag {e.tagCls}">{e.tag}</span>
          <a href="#" class="agenda-btn">
            Garantir vaga
            <svg class="arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </article>
      {/each}
    </div>
  </div>
</section>
{/if}

<style>
  /* Mobile: card-style com tag + botão alinhados embaixo do info */
  @media (max-width: 760px) {
    :global(.agenda-row) {
      display: grid !important;
      grid-template-columns: 64px 1fr !important;
      grid-template-areas:
        "date info"
        ".    tag"
        ".    btn" !important;
      column-gap: 18px !important;
      row-gap: 10px !important;
      padding: 22px 18px !important;
      background: var(--creme-warm);
      border-radius: 16px;
      border: 1px solid var(--line);
      align-items: start;
    }
    :global(.agenda-row + .agenda-row) {
      margin-top: 12px;
    }
    :global(.agenda-row:hover) {
      padding-left: 18px !important;
      padding-right: 18px !important;
    }
    :global(.agenda-date) {
      grid-area: date;
      font-size: 36px !important;
      line-height: 1;
      color: var(--terracota);
      font-family: var(--serif);
      font-weight: 300;
      letter-spacing: -0.03em;
      align-self: start;
      padding-top: 4px;
    }
    :global(.agenda-date small) {
      display: block;
      font-size: 11px !important;
      letter-spacing: 0.18em !important;
      text-transform: uppercase;
      color: var(--ink-mute);
      font-family: var(--sans);
      font-weight: 600;
      margin-top: 4px;
    }
    :global(.agenda-info) {
      grid-area: info;
      min-width: 0;
    }
    :global(.agenda-info h3) {
      font-size: 18px !important;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }
    :global(.agenda-info p) {
      font-size: 13px !important;
      color: var(--ink-mute);
      margin-top: 4px;
      line-height: 1.45;
    }
    :global(.agenda-row .agenda-tag) {
      grid-area: tag;
      justify-self: start;
      margin: 4px 0 0 0;
    }
    :global(.agenda-row .agenda-btn) {
      grid-area: btn;
      justify-self: start;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--creme);
      color: var(--ink);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: border-color .2s, background .2s, color .2s;
      margin: 4px 0 0 0;
    }
    :global(.agenda-row .agenda-btn:hover) {
      border-color: var(--terracota);
      color: var(--terracota);
    }
  }

  /* Desktop: agenda-btn herda estilo do .btn .btn--outline .btn--sm — adicionar fallback */
  @media (min-width: 761px) {
    :global(.agenda-btn) {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: transparent;
      color: var(--ink);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: border-color .2s, color .2s, background .2s;
      white-space: nowrap;
    }
    :global(.agenda-btn:hover) {
      border-color: var(--terracota);
      color: var(--terracota);
    }
  }
</style>
