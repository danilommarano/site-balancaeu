<script lang="ts">
  let { cms = {} }: { cms?: Record<string, Record<string, string>> } = $props();

  const sec = $derived(cms.local ?? {});
  const contato = $derived(cms.contato ?? {});

  const descricao = $derived(sec.descricao || 'Um sobrado reformado no coração de Pinheiros, com três salas de assoalho de madeira, pé-direito alto e janelões para a rua. Entra sol pela manhã, entra música à noite.');
  const endereco = $derived(sec.endereco || 'R. Cunha Gago, 331 - 2° Andar');
  const bairroCidade = $derived(sec.bairro_cidade || 'Pinheiros · São Paulo');
  const comoChegar = $derived(sec.como_chegar || 'Metrô Faria Lima (4-amarela), 2.5 min a pé\nEstacionamento conveniado');
  const horario = $derived(sec.horario || 'Seg a Sex · 09h às 22h\nSábado · 10h às 18h');
  const telefone = $derived(sec.telefone || contato.whatsapp || '(11) 94000-0000');
  const email = $derived(sec.email || contato.email || 'ola@balancaeu.com.br');
  const mapsQuery = $derived(sec.maps_query || 'R.+Cunha+Gago,+331+-+Pinheiros,+São+Paulo+-+SP');

  const whatsappUrl = $derived(contato.whatsapp_url || '#');
  const mapsSearchUrl = $derived(`https://www.google.com/maps/search/${encodeURIComponent(endereco + ', ' + bairroCidade)}`);
  const mapsEmbedUrl = $derived(`https://maps.google.com/maps?q=${mapsQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`);
</script>

<section class="sec-local" id="local">
  <div class="container">
    <div class="local-grid">
      <div class="local-info">
        <div class="eyebrow">Onde a gente dança</div>
        <h2>Nossa <em>casa.</em></h2>
        <p>{descricao}</p>
        <div class="local-meta">
          <div class="local-meta__item">
            <h4>Endereço</h4>
            <p>{endereco}<br/>{bairroCidade}</p>
          </div>
          <div class="local-meta__item">
            <h4>Como chegar</h4>
            <p>{@html comoChegar.replace(/\n/g, '<br/>')}</p>
          </div>
          <div class="local-meta__item">
            <h4>Horário</h4>
            <p>{@html horario.replace(/\n/g, '<br/>')}</p>
          </div>
          <div class="local-meta__item">
            <h4>Contato</h4>
            <p>{telefone}<br/>{email}</p>
          </div>
        </div>
        <div style="margin-top: 36px; display: flex; gap: 12px; flex-wrap: wrap;">
          <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer" class="btn btn--primary">
            Ver no Google Maps
            <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" class="btn btn--outline">
            Chamar no WhatsApp
            <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </div>
      <div class="local-map" aria-label="Mapa com a localização da escola Balança Eu">
        <iframe
          title="Localização Balança Eu"
          src={mapsEmbedUrl}
          width="100%"
          height="100%"
          style="border:0;"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </div>
</section>
