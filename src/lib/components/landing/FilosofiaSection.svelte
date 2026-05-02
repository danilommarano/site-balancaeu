<script lang="ts">
  let { cms = {} }: { cms?: Record<string, Record<string, string>> } = $props();

  const escola = $derived(cms.escola ?? {});
  const label = $derived(escola.label || 'Balança Eu');
  const titulo = $derived(escola.titulo || 'Um <em>espaço</em> de encontro, arte e identidade.');
  const p1 = $derived(escola.paragrafo_1 || 'No Balança Eu, acreditamos que o corpo é nosso primeiro território. Não ensinamos apenas passos; cultivamos a percepção de si através do ritmo e da expressão artística.');
  const p2 = $derived(escola.paragrafo_2 || 'Nossa casa é um refúgio contemporâneo onde a tradição e a inovação se abraçam para criar novas linguagens corporais e conexões humanas profundas.');
</script>

<section class="sec-filosofia" id="filosofia">
  <div class="container">
    <div class="eyebrow">{label}</div>
    <h2 class="sec-filosofia__title">{@html titulo}</h2>
    <div class="sec-filosofia__grid">
      <div class="sec-filosofia__col">
        <p>{p1}</p>
      </div>
      <div class="sec-filosofia__col">
        <p>{p2}</p>
      </div>
    </div>
  </div>
</section>
