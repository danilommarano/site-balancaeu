<script lang="ts">
  let { cms = {} }: { cms?: Record<string, Record<string, string>> } = $props();

  const sec = $derived(cms.cta_final ?? {});
  const contato = $derived(cms.contato ?? {});

  const titulo = $derived(sec.titulo || 'Seja parte do movimento.');
  const destaque = $derived(sec.titulo_destaque || 'Venha viver a experiência Balança Eu.');
  const subtitulo = $derived(sec.subtitulo || 'Primeira aula por nossa conta. Vem sentir a casa, conhecer os mestres e descobrir qual ritmo balança você.');
  const ctaPrimTexto = $derived(sec.cta_primario_texto || 'Agendar aula experimental');
  const ctaPrimLink = $derived(sec.cta_primario_link || '/comecar');
  const ctaSecTexto = $derived(sec.cta_secundario_texto || 'Falar no WhatsApp');
  const whatsappUrl = $derived(contato.whatsapp_url || '#');
</script>

<section class="sec-cta-final" id="matricula">
  <div class="container sec-cta-final__content">
    <div class="eyebrow" style="color: var(--coral)">Sua vaga te espera</div>
    <h2 class="sec-cta-final__title">
      {titulo} <em>{destaque}</em>
    </h2>
    <p class="sec-cta-final__sub">{subtitulo}</p>
    <div class="sec-cta-final__actions">
      <a href={ctaPrimLink} class="btn btn--coral">
        {ctaPrimTexto}
        <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" class="btn" style="color: var(--creme); border: 1.5px solid rgba(248,241,233,0.4);">
        {ctaSecTexto}
        <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>
    </div>
  </div>
</section>
