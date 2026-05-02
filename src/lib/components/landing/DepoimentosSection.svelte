<script lang="ts">
  type Depoimento = { quote: string; name: string; role: string; initial: string };

  let { cms = {}, depoimentos = [] }: {
    cms?: Record<string, Record<string, string>>;
    depoimentos?: Depoimento[];
  } = $props();

  const sec = $derived(cms.depoimentos ?? {});
  const label = $derived(sec.label || 'Quem dança conta');
  const titulo = $derived(sec.titulo || 'O que os alunos <em>sentem.</em>');
  const descricao = $derived(sec.descricao || 'Histórias reais de quem encontrou no movimento uma nova forma de habitar o corpo.');
</script>

{#if depoimentos.length > 0}
<section class="sec-depo">
  <div class="container">
    <div class="sec-depo__head">
      <div>
        <div class="eyebrow" style="color: var(--coral)">{label}</div>
        <h2 class="sec-depo__title">{@html titulo}</h2>
      </div>
      <p style="color: rgba(248,241,233,0.7); font-size: 16px; max-width: 360px;">
        {descricao}
      </p>
    </div>
    <div class="depo-track">
      {#each depoimentos as d}
        <article class="depo-card">
          <div class="depo-card__quote-mark">"</div>
          <p class="depo-card__quote">{d.quote}</p>
          <div class="depo-card__author">
            <div class="depo-card__avatar">{d.initial}</div>
            <div>
              <div class="depo-card__name">{d.name}</div>
              <div class="depo-card__role">{d.role}</div>
            </div>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>
{/if}
