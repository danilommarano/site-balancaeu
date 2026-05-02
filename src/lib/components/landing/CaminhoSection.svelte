<script lang="ts">
  let { cms = {} }: { cms?: Record<string, Record<string, string>> } = $props();

  const sec = $derived(cms.caminho ?? {});
  const label = $derived(sec.label || 'Seu caminho');
  const titulo = $derived(sec.titulo || 'Como <em>começa</em> a sua jornada.');
  const descricao = $derived(sec.descricao || 'Cada modalidade tem seu próprio ritmo, sua própria graduação e sua própria mensalidade. Você monta a jornada no seu tempo.');

  const passos = $derived([
    {
      num: '01',
      titulo: sec.passo_1_titulo || 'Escolha seus <em>módulos</em>',
      desc: sec.passo_1_desc || 'Forró, samba, zumba — quantos quiser. Cada um vira uma trilha dentro da sua conta.'
    },
    {
      num: '02',
      titulo: sec.passo_2_titulo || 'Faça seu <em>nivelamento</em>',
      desc: sec.passo_2_desc || 'Um mestre avalia seu ponto de partida em uma aula experimental gratuita.'
    },
    {
      num: '03',
      titulo: sec.passo_3_titulo || 'Dance no <em>seu</em> tempo',
      desc: sec.passo_3_desc || 'Mensalidade por modalidade escolhida. Sem fidelidade, sem pegadinha.'
    }
  ]);

  const ctaTexto = $derived(sec.cta_texto || 'Começar minha jornada');
  const ctaNota = $derived(sec.cta_nota || 'Aula experimental gratuita · Valores apresentados na página de cada modalidade');
</script>

<section class="sec-caminho" id="caminho">
  <div class="container">
    <div class="caminho__head">
      <div class="eyebrow">{label}</div>
      <h2 class="caminho__title">{@html titulo}</h2>
      <p class="caminho__sub">{descricao}</p>
    </div>

    <div class="caminho__steps">
      {#each passos as p}
        <div class="caminho-step">
          <div class="caminho-step__num">{p.num}</div>
          <div class="caminho-step__line"></div>
          <h3>{@html p.titulo}</h3>
          <p>{p.desc}</p>
        </div>
      {/each}
    </div>

    <div class="caminho__cta">
      <a href="/comecar" class="btn btn--primary btn--lg">
        {ctaTexto}
        <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>
      <p class="caminho__cta-note">{ctaNota}</p>
    </div>
  </div>
</section>
