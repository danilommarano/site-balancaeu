<script lang="ts">
  let { cms = {} }: { cms?: Record<string, Record<string, string>> } = $props();

  const sec = $derived(cms.faq ?? {});
  const label = $derived(sec.label || 'Perguntas frequentes');
  const titulo = $derived(sec.titulo || 'Tudo que você <em>precisa saber.</em>');
  const descricao = $derived(sec.descricao || 'Se não encontrar a resposta aqui, chame a gente no WhatsApp. A gente responde rápido.');

  const FALLBACK_FAQS = [
    { q: "Preciso de experiência prévia para começar?", a: "Nenhuma. Metade dos nossos alunos nunca dançou antes. Nossa didática é pensada para iniciantes absolutos — a primeira aula já é um mergulho gostoso, sem julgamento." },
    { q: "Como funciona a progressão por graduações?", a: "No módulo Forró Pé Descalço adotamos um método por cores — Azul, Branca, Marrom e Preta. Você evolui no seu tempo, sendo avaliado por um mestre ao final de cada ciclo." },
    { q: "Preciso levar par para as aulas?", a: "Não. A maioria das nossas turmas trabalha com rodízio, e você dança com diferentes pessoas ao longo da aula. Isso acelera o aprendizado e cria conexões reais." },
    { q: "O que é o portal do aluno?", a: "É o sistema onde cada aluno acompanha suas aulas, graduações, presenças, mensalidades e recebe conteúdos exclusivos dos mestres. Professores e gestores também têm acesso, cada um com sua visão." },
    { q: "Posso cancelar quando quiser?", a: "Sim. Não trabalhamos com fidelidade. Basta avisar até o dia 20 do mês para não ter cobrança no mês seguinte." },
    { q: "Tem vestiário, chuveiro, estacionamento?", a: "Temos vestiário completo, chuveiros quentes e convênio com estacionamento a 50 metros da escola. Também há bicicletário gratuito na calçada." },
  ];

  const faqs = $derived.by(() => {
    // Check if CMS has FAQ entries
    const cmsFaqs: { q: string; a: string }[] = [];
    for (let i = 1; i <= 6; i++) {
      const q = sec[`faq_${i}_q`];
      const a = sec[`faq_${i}_a`];
      if (q && a) cmsFaqs.push({ q, a });
    }
    return cmsFaqs.length > 0 ? cmsFaqs : FALLBACK_FAQS;
  });

  let open = $state(0);
</script>

<section class="sec-faq" id="faq">
  <div class="container">
    <div class="faq-wrap">
      <div>
        <div class="eyebrow">{label}</div>
        <h2 class="faq-wrap__title">{@html titulo}</h2>
        <p class="faq-wrap__sub">{descricao}</p>
      </div>
      <div class="faq-list">
        {#each faqs as f, i}
          <div class="faq-item {open === i ? 'is-open' : ''}">
            <button class="faq-q" onclick={() => open = open === i ? -1 : i}>
              <span>{f.q}</span>
              <span class="faq-q__icon">+</span>
            </button>
            <div class="faq-a"><p>{f.a}</p></div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>
