<!-- BalancaEu — Página dedicada: Forró Roots -->
<script lang="ts">
  import PublicHeader from '$lib/components/landing/PublicHeader.svelte';
  import PublicFooter from '$lib/components/landing/PublicFooter.svelte';

  let { data } = $props();
  const { modality, cms: cmsData, moduloCms } = $derived(data);

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '#raiz', label: 'A Raiz' },
    { href: '#sobre', label: 'Sobre' },
    { href: '/#modulos', label: 'Módulos' },
  ];

  function mcms(secao: string, chave: string, fallback = ''): string {
    const raw = moduloCms?.[secao]?.[chave] || fallback;
    return raw.replace(/\{modalidade\}/g, modality.nome);
  }
</script>

<svelte:head>
  <title>{modality.nome} | Balança Eu</title>
  <meta name="description" content={modality.descricao} />
</svelte:head>

<PublicHeader />

<main class="pt-24 bg-background">

  <!-- ══════════ HERO: Desenho de raiz em SVG ══════════ -->
  <section id="raiz" class="relative w-full overflow-hidden py-16 md:py-24 px-4">
    <div class="max-w-[1000px] mx-auto flex flex-col items-center">

      <span class="font-label text-sm uppercase tracking-[0.3em] text-primary mb-6 block">
        {mcms('hero', 'label', 'Módulo')}
      </span>

      <h1 class="font-headline text-5xl md:text-8xl text-primary leading-[0.95] tracking-tighter mb-4 text-center italic">
        {modality.nome}
      </h1>

      <p class="font-body text-lg md:text-xl text-on-surface-variant max-w-xl text-center mb-12 leading-relaxed">
        {mcms('hero', 'subtitulo', modality.descricao)}
      </p>

      <!-- ─── SVG RAIZ (1000px responsivo) ─── -->
      <div class="w-full max-w-[1000px]">
        <svg
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
          class="w-full h-auto text-primary"
          aria-label="Desenho de uma raiz"
        >
          <!-- Tronco / haste principal -->
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">

            <!-- Ponto de origem (superfície) -->
            <line x1="100" y1="120" x2="900" y2="120" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.35" />

            <!-- Haste principal descendo -->
            <path d="M500 80 Q510 180 495 280 T480 460 Q490 620 500 780 Q502 860 500 940" stroke-width="5" />

            <!-- Raízes laterais primárias (superiores) -->
            <path d="M495 230 Q400 270 310 320 Q240 360 165 420" stroke-width="3.5" />
            <path d="M498 230 Q595 270 690 320 Q760 360 835 420" stroke-width="3.5" />

            <!-- Raízes laterais primárias (mediais) -->
            <path d="M488 400 Q370 450 260 520 Q180 570 100 650" stroke-width="3" />
            <path d="M492 400 Q610 450 720 520 Q810 570 895 650" stroke-width="3" />

            <!-- Raízes laterais primárias (inferiores) -->
            <path d="M485 600 Q400 670 320 740" stroke-width="2.5" />
            <path d="M505 600 Q590 670 680 740" stroke-width="2.5" />

            <!-- Ramificações secundárias superiores -->
            <path d="M310 320 Q290 390 270 470" stroke-width="2" />
            <path d="M310 320 Q360 370 385 445" stroke-width="2" />
            <path d="M690 320 Q710 390 730 470" stroke-width="2" />
            <path d="M690 320 Q640 370 615 445" stroke-width="2" />

            <path d="M260 520 Q230 590 205 670" stroke-width="2" />
            <path d="M260 520 Q315 560 340 630" stroke-width="2" />
            <path d="M740 520 Q770 590 795 670" stroke-width="2" />
            <path d="M740 520 Q685 560 660 630" stroke-width="2" />

            <path d="M165 420 Q145 500 135 580" stroke-width="2" />
            <path d="M835 420 Q855 500 865 580" stroke-width="2" />

            <!-- Raízes finas / pelos radiculares -->
            <g stroke-width="1.25" opacity="0.85">
              <path d="M270 470 Q250 510 235 550" />
              <path d="M385 445 Q395 490 405 530" />
              <path d="M730 470 Q750 510 765 550" />
              <path d="M615 445 Q605 490 595 530" />

              <path d="M205 670 Q180 720 165 770" />
              <path d="M340 630 Q335 690 330 740" />
              <path d="M795 670 Q820 720 835 770" />
              <path d="M660 630 Q665 690 670 740" />

              <path d="M135 580 Q115 630 100 680" />
              <path d="M865 580 Q885 630 900 680" />

              <path d="M320 740 Q295 800 275 860" />
              <path d="M680 740 Q705 800 725 860" />
              <path d="M100 650 Q75 700 60 760" />
              <path d="M895 650 Q925 700 940 760" />

              <!-- Hastes finais no fundo -->
              <path d="M500 940 Q490 970 485 995" />
              <path d="M500 940 Q510 970 515 995" />
              <path d="M500 940 Q500 975 500 995" />

              <path d="M275 860 Q260 905 250 945" />
              <path d="M725 860 Q740 905 750 945" />
            </g>

            <!-- Pequenos círculos nas juntas (nós da raiz) -->
            <g fill="currentColor" stroke="none">
              <circle cx="495" cy="230" r="4" />
              <circle cx="488" cy="400" r="3.5" />
              <circle cx="492" cy="400" r="3.5" />
              <circle cx="485" cy="600" r="3" />
              <circle cx="505" cy="600" r="3" />
              <circle cx="310" cy="320" r="2.5" />
              <circle cx="690" cy="320" r="2.5" />
              <circle cx="260" cy="520" r="2.5" />
              <circle cx="740" cy="520" r="2.5" />
              <circle cx="500" cy="940" r="3" />
            </g>

            <!-- Semente no topo -->
            <ellipse cx="500" cy="60" rx="18" ry="30" stroke-width="3" fill="none" />
            <path d="M500 30 Q490 15 485 5" stroke-width="2" />
            <path d="M500 30 Q510 15 515 5" stroke-width="2" />
          </g>
        </svg>
      </div>

      <!-- CTAs -->
      <div class="mt-16 flex flex-col sm:flex-row gap-6 items-center">
        <a
          href="/comecar"
          class="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all editorial-shadow"
        >
          {mcms('hero', 'cta_primario_texto', 'Matricular-se')}
        </a>
        <a
          href="#sobre"
          class="font-headline italic text-xl text-secondary flex items-center gap-2 group"
        >
          {mcms('hero', 'cta_secundario_texto', 'Descer às raízes')}
          <span class="material-symbols-outlined group-hover:translate-y-1 transition-transform">arrow_downward</span>
        </a>
      </div>
    </div>
  </section>

  <!-- ══════════ SOBRE ══════════ -->
  <section id="sobre" class="py-24 px-8 md:px-20 bg-surface">
    <div class="max-w-screen-xl mx-auto text-center">
      <span class="font-label text-sm uppercase tracking-[0.3em] text-primary mb-6 block">
        {mcms('sobre', 'label', 'A Prática')}
      </span>
      <h2 class="font-headline text-5xl md:text-7xl text-on-surface mb-12 leading-tight">
        {mcms('sobre', 'titulo', `O que é ${modality.nome}?`)}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-16 text-left max-w-4xl mx-auto">
        <p class="font-body text-xl text-on-surface-variant leading-relaxed">
          {mcms('sobre', 'paragrafo_1', modality.descricao)}
        </p>
        <p class="font-body text-xl text-on-surface-variant leading-relaxed">
          {mcms('sobre', 'paragrafo_2', 'Dançar Forró Roots é voltar à origem — sentir o chão, o ritmo da zabumba, o abraço sem pressa. É encontrar no movimento a memória das festas de São João e a sabedoria dos mestres do sertão.')}
        </p>
      </div>
    </div>
  </section>
</main>

<PublicFooter />
