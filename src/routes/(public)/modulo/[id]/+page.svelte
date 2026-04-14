<!-- Página de Módulo — Estilo Editorial da Landing Page -->
<script lang="ts">
  import PublicHeader from '$lib/components/landing/PublicHeader.svelte';
  import PublicFooter from '$lib/components/landing/PublicFooter.svelte';

  let { data } = $props();

  const { modality, professores, turmas, cms: cmsData, moduloCms } = $derived(data);

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#professores', label: 'Professores' },
    { href: '#horarios', label: 'Horários' },
    { href: '/#modulos', label: 'Módulos' },
  ];

  function cms(secao: string, chave: string, fallback = ''): string {
    return cmsData?.[secao]?.[chave] ?? fallback;
  }

  // CMS específico do módulo — substitui {modalidade} pelo nome
  function mcms(secao: string, chave: string, fallback = ''): string {
    const raw = moduloCms?.[secao]?.[chave] || fallback;
    return raw.replace(/\{modalidade\}/g, modality.nome);
  }

  const heroImage = $derived(mcms('hero', 'imagem', modality.imagemUrl ?? ''));

  let activeDay = $state('');

  // Calcular dias que têm aulas nessa modalidade
  const diasComAulas = $derived(() => {
    const dias = new Set(turmas.map((t: { diaSemana: string }) => t.diaSemana));
    return dayOrder.filter(d => dias.has(d.key));
  });

  $effect(() => {
    const dias = diasComAulas();
    if (dias.length > 0 && !activeDay) {
      activeDay = dias[0].key;
    }
  });

  const dayOrder = [
    { key: 'SEG', label: 'Segunda' },
    { key: 'TER', label: 'Terça' },
    { key: 'QUA', label: 'Quarta' },
    { key: 'QUI', label: 'Quinta' },
    { key: 'SEX', label: 'Sexta' },
    { key: 'SAB', label: 'Sábado' },
    { key: 'DOM', label: 'Domingo' },
  ];

  const dayLabels: Record<string, string> = {
    SEG: 'Segunda-feira', TER: 'Terça-feira', QUA: 'Quarta-feira',
    QUI: 'Quinta-feira', SEX: 'Sexta-feira', SAB: 'Sábado', DOM: 'Domingo',
  };

  const turmasDoDia = $derived(
    turmas.filter((t: { diaSemana: string }) => t.diaSemana === activeDay)
  );

  const SALAS = ['Sala 1', 'Sala 2', 'Sala 3'];

  const gradeSemanal = $derived.by(() => {
    const slotMap = new Map<string, Record<string, typeof turmas[number] | null>>();
    for (const t of turmasDoDia) {
      const key = `${t.horarioInicio} - ${t.horarioFim}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, { 'Sala 1': null, 'Sala 2': null, 'Sala 3': null });
      }
      slotMap.get(key)![t.sala] = t;
    }
    return Array.from(slotMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  });
</script>

<svelte:head>
  <title>{modality.nome} | Balança Eu</title>
  <meta name="description" content={modality.descricao} />
</svelte:head>

<PublicHeader {navLinks} />

<main class="pt-24">

  <!-- ══════════ 1. HERO ══════════ -->
  <section class="relative min-h-[85vh] flex items-end overflow-hidden bg-stone-950">
    <!-- Background image -->
    {#if heroImage}
      <img
        src={heroImage}
        alt={modality.nome}
        class="absolute inset-0 w-full h-full object-cover opacity-50"
      />
    {:else}
      <!-- Gradient fallback -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary/80 via-stone-900 to-stone-950"></div>
    {/if}

    <!-- Vignette overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-screen-2xl mx-auto px-8 md:px-20 pb-20">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-3 mb-8 text-white/50 font-label text-xs uppercase tracking-widest">
        <a href="/" class="hover:text-white transition-colors">Início</a>
        <span class="material-symbols-outlined text-sm">chevron_right</span>
        <a href="/#modulos" class="hover:text-white transition-colors">Módulos</a>
        <span class="material-symbols-outlined text-sm">chevron_right</span>
        <span class="text-white/80">{modality.nome}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div class="lg:col-span-8">
          <span class="font-label text-sm uppercase tracking-[0.3em] text-primary mb-6 block">
            {mcms('hero', 'label', 'Módulo')}
          </span>
          <h1 class="font-headline text-6xl md:text-9xl text-white leading-[0.95] tracking-tighter mb-8">
            {modality.nome}
          </h1>
          <p class="font-body text-xl md:text-2xl text-white/70 max-w-2xl leading-relaxed">
            {mcms('hero', 'subtitulo', modality.descricao)}
          </p>
        </div>

        <div class="lg:col-span-4 flex flex-col gap-4 lg:items-end">
          <a
            href="/comecar"
            class="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl text-center"
          >
            {mcms('hero', 'cta_primario_texto', 'Matricular-se')}
          </a>
          <a
            href="#horarios"
            class="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all text-center border border-white/20"
          >
            {mcms('hero', 'cta_secundario_texto', 'Ver Horários')}
          </a>

          <!-- Stats -->
          {#if professores.length > 0 || turmas.length > 0}
            <div class="flex gap-6 mt-4 lg:justify-end">
              {#if professores.length > 0}
                <div class="text-center">
                  <span class="block font-headline text-3xl text-white">{professores.length}</span>
                  <span class="text-white/50 text-xs uppercase tracking-widest font-label">
                    {professores.length === 1 ? 'Professor' : 'Professores'}
                  </span>
                </div>
              {/if}
              {#if turmas.length > 0}
                <div class="text-center">
                  <span class="block font-headline text-3xl text-white">{turmas.length}</span>
                  <span class="text-white/50 text-xs uppercase tracking-widest font-label">
                    {turmas.length === 1 ? 'Turma' : 'Turmas'}
                  </span>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Wavy Divider (Dark to Light) -->
  <div class="w-full overflow-hidden bg-stone-950 leading-[0]">
    <svg class="w-full h-16 text-background" fill="currentColor" preserveAspectRatio="none" viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 32C240 64 480 0 720 32C960 64 1200 0 1440 32V64H0Z"></path>
    </svg>
  </div>

  <!-- ══════════ 2. SOBRE ══════════ -->
  <section class="py-32 px-8 md:px-20 bg-background" id="sobre">
    <div class="max-w-screen-xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div class="lg:col-span-7">
          <span class="font-label text-sm uppercase tracking-[0.3em] text-primary mb-6 block">
            {mcms('sobre', 'label', 'A Prática')}
          </span>
          <h2 class="font-headline text-5xl md:text-7xl text-on-surface mb-10 leading-tight">
            {@html mcms('sobre', 'titulo', `O que é<br /><span class="italic text-primary">${modality.nome}?</span>`)}
          </h2>
          <div class="space-y-6">
            <p class="font-body text-xl text-on-surface-variant leading-relaxed">
              {mcms('sobre', 'paragrafo_1', modality.descricao)}
            </p>
            <p class="font-body text-lg text-on-surface-variant/80 leading-relaxed">
              {mcms('sobre', 'paragrafo_2', 'No Balança Eu, cada aula é uma jornada de autoconhecimento através do movimento. Nossos professores guiam você com sensibilidade, respeitando o seu tempo e ritmo de aprendizado.')}
            </p>
          </div>

          <div class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="bg-surface p-6 rounded-2xl border border-stone-100">
              <span class="material-symbols-outlined text-primary text-3xl mb-3 block">{mcms('beneficios', 'card_1_icone', 'self_improvement')}</span>
              <h4 class="font-headline text-lg mb-1">{mcms('beneficios', 'card_1_titulo', 'Todos os níveis')}</h4>
              <p class="text-on-surface-variant text-sm">{mcms('beneficios', 'card_1_texto', 'Do iniciante ao avançado')}</p>
            </div>
            <div class="bg-surface p-6 rounded-2xl border border-stone-100">
              <span class="material-symbols-outlined text-primary text-3xl mb-3 block">{mcms('beneficios', 'card_2_icone', 'group')}</span>
              <h4 class="font-headline text-lg mb-1">{mcms('beneficios', 'card_2_titulo', 'Turmas reduzidas')}</h4>
              <p class="text-on-surface-variant text-sm">{mcms('beneficios', 'card_2_texto', 'Atenção individualizada')}</p>
            </div>
            <div class="bg-surface p-6 rounded-2xl border border-stone-100">
              <span class="material-symbols-outlined text-primary text-3xl mb-3 block">{mcms('beneficios', 'card_3_icone', 'emoji_events')}</span>
              <h4 class="font-headline text-lg mb-1">{mcms('beneficios', 'card_3_titulo', 'Certificação')}</h4>
              <p class="text-on-surface-variant text-sm">{mcms('beneficios', 'card_3_texto', 'Reconhecimento da jornada')}</p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5">
          <div class="relative">
            <div class="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-surface-container-high editorial-shadow">
              {#if modality.imagemUrl}
                <img
                  src={modality.imagemUrl}
                  alt={modality.nome}
                  class="w-full h-full object-cover grayscale-[0.15]"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                  <span class="material-symbols-outlined text-[8rem] text-primary/20">sports_martial_arts</span>
                </div>
              {/if}
            </div>
            <!-- Decorative element -->
            <div class="absolute -bottom-6 -right-6 bg-primary/10 w-48 h-48 rounded-[2rem] -z-10"></div>
            <div class="absolute -top-6 -left-6 bg-secondary/10 w-32 h-32 rounded-[1.5rem] -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ 3. PROFESSORES ══════════ (Red bg like pricing section) -->
  {#if professores.length > 0}
    <!-- Wavy Divider (Light to Red) -->
    <div class="w-full overflow-hidden bg-background leading-[0]">
      <svg class="w-full h-16 text-primary" fill="currentColor" preserveAspectRatio="none" viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 32C240 0 480 64 720 32C960 0 1200 64 1440 32V64H0Z"></path>
      </svg>
    </div>

    <section class="py-32 px-8 bg-primary" id="professores">
      <div class="max-w-screen-2xl mx-auto">
        <div class="text-center mb-20">
          <span class="font-label text-sm uppercase tracking-[0.3em] text-white/60 mb-6 block">
            {mcms('professores', 'label', 'Mestres do Movimento')}
          </span>
          <h2 class="font-headline text-5xl md:text-7xl text-white mb-6">
            {mcms('professores', 'titulo', `Quem ensina ${modality.nome}`)}
          </h2>
          <p class="font-body text-xl text-white/70 max-w-xl mx-auto">
            {mcms('professores', 'descricao', 'Profissionais apaixonados que transformam o ensino em experiência.')}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-{Math.min(professores.length, 4)} gap-10">
          {#each professores as prof, i}
            <div class="group {i % 2 !== 0 ? 'lg:mt-12' : ''}">
              <div class="aspect-[4/5] rounded-[2rem] overflow-hidden relative bg-white/10">
                {#if prof.teacher?.imagemUrl}
                  <img
                    alt={prof.nome}
                    src={prof.teacher.imagemUrl}
                    class="w-full h-full object-cover grayscale-[0.1] group-hover:scale-105 transition-transform duration-700"
                  />
                {:else}
                  <div class="w-full h-full flex items-center justify-center">
                    <span class="material-symbols-outlined text-8xl text-white/20">person</span>
                  </div>
                {/if}
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  {#if prof.teacher?.especialidades?.length}
                    <p class="text-white font-headline text-xl italic">{prof.teacher.especialidades[0]}</p>
                  {/if}
                </div>
              </div>
              <div class="mt-6">
                <h4 class="font-headline text-2xl text-white mb-2">{prof.nome}</h4>
                {#if prof.teacher?.especialidades?.length}
                  <p class="text-white/50 text-xs uppercase tracking-widest font-label mb-3">
                    {prof.teacher.especialidades.join(' · ')}
                  </p>
                {/if}
                {#if prof.teacher?.bio}
                  <p class="text-white/70 leading-relaxed text-sm">{prof.teacher.bio}</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- Wavy Divider (Red to Surface) -->
    <div class="w-full overflow-hidden bg-primary leading-[0]">
      <svg class="w-full h-16 text-surface-container-highest" fill="currentColor" preserveAspectRatio="none" viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 32C240 0 480 64 720 32C960 0 1200 64 1440 32V64H0Z"></path>
      </svg>
    </div>
  {/if}

  <!-- ══════════ 4. HORÁRIOS ══════════ -->
  <section class="py-32 px-8 bg-surface-container-highest" id="horarios">
    <div class="max-w-screen-2xl mx-auto">
      <div class="text-center mb-16">
        <span class="font-label text-sm uppercase tracking-[0.3em] text-primary mb-6 block">
          {mcms('horarios', 'label', 'Agenda')}
        </span>
        <h2 class="font-headline text-5xl md:text-7xl">
          {mcms('horarios', 'titulo', `Horários de ${modality.nome}`)}
        </h2>
      </div>

      {#if turmas.length > 0}
        <!-- Day Tabs (only days with classes) -->
        {@const dias = diasComAulas()}
        {#if dias.length > 1}
          <div class="flex flex-wrap justify-center gap-2 mb-12">
            {#each dias as day}
              <button
                class="px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all border-2 {activeDay === day.key ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-variant border-stone-200 hover:border-primary/30'}"
                onclick={() => activeDay = day.key}
              >
                {day.label}
              </button>
            {/each}
          </div>
        {:else if dias.length === 1}
          <p class="text-center text-on-surface-variant font-label text-sm uppercase tracking-widest mb-10">
            {dayLabels[dias[0].key] ?? dias[0].label}
          </p>
        {/if}

        <!-- Grade: linhas = horários, colunas = salas -->
        {#if gradeSemanal.length > 0}
          <div class="max-w-5xl mx-auto">
            <!-- Header das salas -->
            <div class="grid grid-cols-[80px_1fr_1fr_1fr] md:grid-cols-[120px_1fr_1fr_1fr] gap-3 mb-3">
              <div></div>
              {#each SALAS as sala}
                <div class="text-center">
                  <span class="font-label text-xs md:text-sm uppercase tracking-widest text-primary">{sala}</span>
                </div>
              {/each}
            </div>

            <div class="space-y-3">
              {#each gradeSemanal as [horario, porSala]}
                <div class="grid grid-cols-[80px_1fr_1fr_1fr] md:grid-cols-[120px_1fr_1fr_1fr] gap-3 items-stretch">
                  <div class="bg-primary/5 rounded-xl flex items-center justify-center border-l-2 border-primary/20 px-2">
                    <span class="font-headline text-sm md:text-lg text-primary text-center leading-tight">{horario}</span>
                  </div>
                  {#each SALAS as sala}
                    {@const turma = porSala[sala]}
                    {#if turma}
                      <div class="bg-white p-4 rounded-2xl editorial-shadow border border-stone-100">
                        <h4 class="font-headline text-base md:text-lg text-primary leading-tight">{modality.nome}</h4>
                        <p class="text-xs text-on-surface-variant mt-0.5">{turma.nivel}</p>
                        <p class="text-[10px] text-stone-400 mt-1">Prof. {turma.professor.nome}</p>
                        <div class="mt-2 flex items-center gap-1 text-[10px] text-stone-400">
                          <span class="material-symbols-outlined text-[12px]">group</span>
                          <span>{turma._count.enrollments}/{turma.maxAlunos}</span>
                        </div>
                      </div>
                    {:else}
                      <div class="bg-white/30 rounded-2xl border border-dashed border-stone-200 flex items-center justify-center min-h-[64px]">
                        <span class="text-[10px] text-stone-300 uppercase tracking-widest">—</span>
                      </div>
                    {/if}
                  {/each}
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <div class="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-stone-200 font-headline text-2xl italic text-on-surface-variant opacity-70">
            Selecione um dia para ver os horários.
          </div>
        {/if}
      {:else}
        <div class="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-stone-200">
          <span class="material-symbols-outlined text-4xl text-stone-300 mb-4 block">event_busy</span>
          <p class="font-headline text-2xl italic text-on-surface-variant opacity-70">
            Nenhuma turma disponível no momento.
          </p>
          <p class="text-on-surface-variant/60 text-sm mt-2">Entre em contato para mais informações.</p>
        </div>
      {/if}
    </div>
  </section>

  <!-- ══════════ 5. OUTROS MÓDULOS ══════════ -->
  <section class="py-24 px-8 bg-background">
    <div class="max-w-screen-xl mx-auto text-center">
      <span class="font-label text-sm uppercase tracking-[0.3em] text-primary mb-6 block">Explore</span>
      <h2 class="font-headline text-4xl md:text-5xl text-on-surface mb-4">
        Conheça nossos outros módulos
      </h2>
      <p class="text-on-surface-variant mb-10 text-lg">
        Cada modalidade é uma porta para um novo movimento.
      </p>
      <a
        href="/#modulos"
        class="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all editorial-shadow"
      >
        Ver todos os módulos
        <span class="material-symbols-outlined">arrow_forward</span>
      </a>
    </div>
  </section>

  <!-- ══════════ 6. CTA FINAL ══════════ -->
  <section class="py-40 px-8 relative overflow-hidden">
    <div class="max-w-4xl mx-auto text-center z-10 relative">
      <h2 class="font-headline text-5xl md:text-7xl text-on-surface mb-10 leading-tight">
        {mcms('cta_final', 'titulo', 'Pronto para começar')} <br />
        <span class="italic text-primary">{mcms('cta_final', 'titulo_destaque', `sua jornada em ${modality.nome}?`)}</span>
      </h2>
      <p class="text-on-surface-variant text-xl mb-12 max-w-xl mx-auto leading-relaxed">
        {mcms('cta_final', 'descricao', 'Agende uma aula experimental gratuita e descubra como o movimento pode transformar sua vida.')}
      </p>
      <div class="flex flex-col md:flex-row gap-6 justify-center">
        <a
          href="/comecar"
          class="bg-primary text-on-primary px-10 py-5 rounded-xl font-bold text-xl hover:scale-105 transition-all editorial-shadow"
        >
          {mcms('cta_final', 'cta_primario_texto', 'Agendar Aula Experimental')}
        </a>
        <a
          href="/#contato"
          class="bg-surface-container-high text-on-surface px-10 py-5 rounded-xl font-bold text-xl hover:bg-surface-container-highest transition-all"
        >
          Falar com Consultor
        </a>
      </div>
    </div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-fixed/20 blur-[120px] rounded-full -z-10"></div>
  </section>

</main>

<PublicFooter {navLinks} cms={cmsData} />
