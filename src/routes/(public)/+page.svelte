<!-- BalancaEu — Landing Page (Dinâmica via CMS) -->
<script lang="ts">
  import PublicHeader from '$lib/components/landing/PublicHeader.svelte';
  import PublicFooter from '$lib/components/landing/PublicFooter.svelte';

  let { data } = $props();

  let activeDay = $state('SEG');

  const navLinks = [
    { href: '#escola', label: 'Sobre a escola' },
    { href: '#modulos', label: 'Módulos' },
    { href: '#professores', label: 'Professores' },
    { href: '#horarios', label: 'Horários' },
    { href: '#eventos', label: 'Eventos' },
    { href: '#contato', label: 'Contato' },
  ];

  // Helper: buscar conteúdo CMS com fallback
  function cms(secao: string, chave: string, fallback = ''): string {
    return data.cms?.[secao]?.[chave] ?? fallback;
  }

  // Modalidades do banco
  const modalidades = $derived(data.modalidades ?? []);

  // Professores do banco
  const professores = $derived(data.professores ?? []);

  // Eventos do banco
  const eventos = $derived(data.eventos ?? []);

  // Turmas agrupadas por dia da semana
  const turmas = $derived(data.turmas ?? []);

  const dayKeys = [
    { key: 'SEG', label: 'Segunda' },
    { key: 'TER', label: 'Terça' },
    { key: 'QUA', label: 'Quarta' },
    { key: 'QUI', label: 'Quinta' },
    { key: 'SEX', label: 'Sexta' },
    { key: 'SAB', label: 'Sábado' },
  ];

  const turmasDoDia = $derived(
    turmas.filter((t: { diaSemana: string }) => t.diaSemana === activeDay)
  );

  const SALAS = ['Sala 1', 'Sala 2', 'Sala 3'];

  // Grid semanal: linhas = horários, colunas = salas
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

  function formatCurrency(value: number | string | null) {
    if (!value) return 'Gratuito';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatMonth(date: string | Date) {
    return new Date(date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
  }
</script>

<svelte:head>
  <title>Balança Eu | Escola de Dança e Centro Cultural</title>
  <meta name="description" content="Um movimento que começa no corpo e transforma quem você é. Escola de dança com Forró, Samba, Zumba e Yoga." />
</svelte:head>

<PublicHeader {navLinks} />

<!-- ═══════════ MAIN ═══════════ -->
<main class="pt-24">

  <!-- 1. HERO (CMS) -->
  <section class="relative min-h-[921px] flex items-center px-8 md:px-20 overflow-hidden">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-12 items-center w-full max-w-screen-2xl mx-auto">
      <div class="md:col-span-7 z-10">
        <h1 class="font-headline text-5xl md:text-8xl text-primary leading-[1.1] tracking-tighter mb-8">
          {cms('hero', 'titulo', 'Balança Eu: Muito mais que uma escola de dança.')}
        </h1>
        <p class="font-body text-xl md:text-2xl text-on-surface-variant max-w-xl leading-relaxed">
          {cms('hero', 'subtitulo', 'Um movimento que começa no corpo e transforma quem você é.')}
        </p>
        <div class="mt-12 flex gap-6 items-center">
          <a href={cms('hero', 'cta_link', '/comecar')} class="bg-primary text-on-primary px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all">
            {cms('hero', 'cta_texto', 'Começar Jornada')}
          </a>
          <a class="font-headline italic text-xl text-secondary flex items-center gap-2 group" href="#escola">
            Nossa Filosofia
            <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </a>
        </div>
      </div>
      <div class="md:col-span-5 relative">
        <div class="aspect-[4/5] w-full rounded-xl overflow-hidden editorial-shadow bg-surface-container-high">
          <img alt="Dançarina profissional em movimento" class="w-full h-full object-cover grayscale-[0.2]" src={cms('hero', 'imagem', '/assets/hero-dance.png')} />
        </div>
        <div class="absolute -bottom-8 -left-8 bg-secondary-container p-8 rounded-xl hidden md:block">
          <p class="font-headline italic text-on-secondary-container text-2xl">{cms('hero', 'frase_destaque', 'Movimento é cura.')}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Wavy Divider -->
  <div class="w-full overflow-hidden bg-background">
    <svg class="w-full h-16 text-primary/10" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M-100 32C0 32 50 10 100 10C150 10 200 54 250 54C300 54 350 10 400 10C450 10 500 54 550 54C600 54 650 10 700 10C750 10 800 54 850 54C900 54 950 10 1000 10C1050 10 1100 54 1150 54C1200 54 1250 10 1300 10C1350 10 1400 54 1540 54" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"></path>
    </svg>
  </div>

  <!-- 2. ESSÊNCIA / SOBRE A ESCOLA (CMS) -->
  <section class="py-24 px-8 md:px-20 bg-surface" id="escola">
    <div class="max-w-screen-xl mx-auto text-center">
      <span class="font-label text-sm uppercase tracking-[0.3em] text-primary mb-6 block">{cms('escola', 'label', 'Balança Eu')}</span>
      <h2 class="font-headline text-5xl md:text-7xl text-on-surface mb-12 leading-tight">{cms('escola', 'titulo', 'Um espaço de encontro, arte e identidade.')}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-16 text-left max-w-4xl mx-auto">
        <p class="font-body text-xl text-on-surface-variant leading-relaxed opacity-90">
          {cms('escola', 'paragrafo_1', 'No Balança Eu, acreditamos que o corpo é o nosso primeiro território. Não ensinamos apenas passos; cultivamos a percepção de si através do ritmo e da expressão artística.')}
        </p>
        <p class="font-body text-xl text-on-surface-variant leading-relaxed opacity-90">
          {cms('escola', 'paragrafo_2', 'Nossa casa é um refúgio contemporâneo onde a tradição e a inovação se abraçam para criar novas linguagens corporais e conexões humanas profundas.')}
        </p>
      </div>
    </div>
  </section>

  <!-- Wavy Divider (Transition to Red) -->
  <div class="w-full overflow-hidden bg-background leading-[0]">
    <svg class="w-full h-16 text-primary" fill="currentColor" preserveAspectRatio="none" viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 32C240 0 480 64 720 32C960 0 1200 64 1440 32V64H0Z"></path>
    </svg>
  </div>

  <!-- 3. MÓDULOS (Modalidades do banco) -->
  <section class="py-24 px-8 bg-primary text-white" id="modulos">
    <div class="max-w-screen-2xl mx-auto">
      <div class="text-center mb-20">
        <span class="font-label text-sm uppercase tracking-[0.3em] text-white/70 mb-6 block">
          {cms('modulos', 'label', 'Nossas Práticas')}
        </span>
        <h2 class="font-headline text-5xl md:text-7xl mb-6 text-white">
          {cms('modulos', 'titulo', 'Nossos Módulos')}
        </h2>
        <p class="font-body text-xl text-white/80 max-w-2xl mx-auto">
          {cms('modulos', 'descricao', 'Explore cada modalidade e encontre o ritmo que transforma.')}
        </p>
      </div>

      {#if modalidades.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {#each modalidades as mod}
            <a
              href="/modulo/{mod.id}"
              class="group relative overflow-hidden rounded-3xl aspect-[3/4] block hover:-translate-y-2 transition-all duration-500"
            >
              {#if mod.imagemUrl}
                <img
                  src={mod.imagemUrl}
                  alt={mod.nome}
                  class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              {:else}
                <div class="absolute inset-0 bg-white/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-9xl text-white/20">sports_martial_arts</span>
                </div>
              {/if}

              <!-- Overlay gradient -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

              <!-- Border on hover -->
              <div class="absolute inset-0 rounded-3xl border border-white/0 group-hover:border-white/30 transition-colors duration-500"></div>

              <!-- Content -->
              <div class="absolute inset-0 flex flex-col justify-end p-8">
                <h3 class="font-headline text-3xl text-white mb-2 italic leading-tight">{mod.nome}</h3>
                <p class="text-white/70 text-sm leading-relaxed line-clamp-2 mb-6">{mod.descricao}</p>
                <span class="inline-flex items-center gap-2 text-white font-label text-xs uppercase tracking-[0.2em] group-hover:gap-4 transition-all duration-300">
                  Explorar módulo
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </a>
          {/each}
        </div>
      {:else}
        <p class="text-center text-white/60 text-lg italic">Módulos em breve disponíveis.</p>
      {/if}
    </div>
  </section>

  <!-- Wavy Divider (Transition from Red to White) -->
  <div class="w-full overflow-hidden bg-primary leading-[0]">
    <svg class="w-full h-16 text-background" fill="currentColor" preserveAspectRatio="none" viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 32C240 0 480 64 720 32C960 0 1200 64 1440 32V64H0Z"></path>
    </svg>
  </div>

  <!-- 4. PROFESSORES (CMS + Banco) -->
  <section class="py-32 px-8" id="professores">
    <div class="max-w-screen-2xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div class="max-w-3xl">
          <span class="font-label text-sm uppercase tracking-[0.3em] text-primary mb-6 block">{cms('professores', 'label', 'Mestres do Movimento')}</span>
          <h2 class="font-headline text-5xl md:text-7xl text-on-surface leading-tight">{cms('professores', 'titulo', 'Quem conduz sua evolução')}</h2>
        </div>
        <p class="font-body text-xl text-on-surface-variant md:w-1/3 italic">{cms('professores', 'descricao', 'Nossa equipe é formada por artistas apaixonados e profissionais sensíveis ao seu tempo e ritmo.')}</p>
      </div>
      {#if professores.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-{Math.min(professores.length, 4)} gap-12">
          {#each professores as prof, i}
            <div class="space-y-6 {i % 2 !== 0 ? 'lg:mt-12' : ''}">
              <div class="aspect-[4/5] rounded-[2rem] overflow-hidden editorial-shadow group cursor-pointer relative bg-surface-container-high">
                {#if prof.teacher?.imagemUrl}
                  <img alt={prof.nome} class="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" src={prof.teacher.imagemUrl} />
                {:else}
                  <div class="w-full h-full flex items-center justify-center">
                    <span class="material-symbols-outlined text-8xl text-on-surface-variant/20">person</span>
                  </div>
                {/if}
                <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <p class="text-white font-headline text-2xl italic leading-tight">{prof.teacher?.especialidades?.[0] ?? 'Dança'}</p>
                </div>
              </div>
              <div>
                <h4 class="font-headline text-3xl text-primary mb-2">{prof.nome}</h4>
                {#if prof.teacher?.especialidades?.length}
                  <p class="text-on-surface-variant font-medium uppercase tracking-widest text-xs mb-4">{prof.teacher.especialidades.join(' · ')}</p>
                {/if}
                {#if prof.teacher?.bio}
                  <p class="text-on-surface-variant leading-relaxed">{prof.teacher.bio}</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-center text-on-surface-variant text-lg italic">Em breve, conheça nossos professores.</p>
      {/if}
    </div>
  </section>

  <!-- 5. HORÁRIOS (CMS + Banco) -->
  <section class="py-32 px-8 bg-surface-container-highest" id="horarios">
    <div class="max-w-screen-2xl mx-auto">
      <div class="text-center mb-16">
        <span class="font-label text-sm uppercase tracking-[0.3em] text-primary mb-6 block">{cms('horarios', 'label', 'Nossa Agenda')}</span>
        <h2 class="font-headline text-5xl md:text-7xl">{cms('horarios', 'titulo', 'Grade de Aulas')}</h2>
      </div>

      <!-- Day Tabs -->
      <div class="flex flex-wrap justify-center gap-2 mb-12">
        {#each dayKeys as day}
          <button
            class="px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all border-2 {activeDay === day.key ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-variant border-stone-200 hover:border-primary/30'}"
            onclick={() => activeDay = day.key}
          >
            {day.label}
          </button>
        {/each}
      </div>

      <!-- Grade semanal: linhas = horários, colunas = salas -->
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

          <!-- Linhas por horário -->
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
                      <h4 class="font-headline text-base md:text-lg leading-tight">{turma.modality.nome}</h4>
                      <p class="text-xs text-on-surface-variant mt-0.5">{turma.nivel}</p>
                      <p class="text-[10px] text-stone-400 mt-1">Prof. {turma.professor.nome}</p>
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
          Nenhuma aula programada para {dayKeys.find(d => d.key === activeDay)?.label ?? 'este dia'}.
        </div>
      {/if}
    </div>
  </section>

  <!-- 6. EVENTOS (CMS + Banco) -->
  <section class="py-32 px-8 bg-background" id="eventos">
    <div class="max-w-screen-2xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-end mb-20">
        <div>
          <span class="font-label text-sm uppercase tracking-[0.3em] text-primary mb-6 block">{cms('eventos', 'label', 'Agenda Cultural')}</span>
          <h2 class="font-headline text-5xl md:text-7xl">{cms('eventos', 'titulo', 'Próximos Eventos')}</h2>
        </div>
        <p class="font-body text-xl text-on-surface-variant max-w-md md:text-right mt-6 md:mt-0">{cms('eventos', 'descricao', 'Vibrações que transcendem as aulas regulares. Conheça nossa programação especial.')}</p>
      </div>
      {#if eventos.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-{Math.min(eventos.length, 3)} gap-8">
          {#each eventos as event}
            {@const eventDate = new Date(event.data)}
            <div class="group bg-surface-container-low rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-stone-100">
              <div class="relative h-64 overflow-hidden bg-surface-container-high">
                <div class="absolute top-6 left-6 z-10 bg-primary text-white p-4 rounded-2xl text-center min-w-[80px]">
                  <span class="block text-2xl font-bold leading-none">{eventDate.getDate().toString().padStart(2, '0')}</span>
                  <span class="text-[10px] uppercase tracking-tighter">{formatMonth(event.data)}</span>
                </div>
                {#if event.imagemUrl}
                  <img alt={event.titulo} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={event.imagemUrl} />
                {:else}
                  <div class="w-full h-full flex items-center justify-center">
                    <span class="material-symbols-outlined text-8xl text-on-surface-variant/10">celebration</span>
                  </div>
                {/if}
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  {#if event.preco}
                    <span class="text-white bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs uppercase tracking-widest">{formatCurrency(event.preco)}</span>
                  {:else}
                    <span class="text-white bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs uppercase tracking-widest">Gratuito</span>
                  {/if}
                </div>
              </div>
              <div class="p-8">
                <h3 class="font-headline text-3xl mb-4 italic">{event.titulo}</h3>
                <p class="text-on-surface-variant mb-8 leading-relaxed">{event.descricao}</p>
                <div class="flex items-center justify-between border-t border-stone-200 pt-8">
                  <div class="flex items-center gap-2 text-stone-500">
                    <span class="material-symbols-outlined text-sm">schedule</span>
                    <span class="text-sm">{event.horario}</span>
                  </div>
                  <div class="flex items-center gap-2 text-stone-500">
                    <span class="material-symbols-outlined text-sm">location_on</span>
                    <span class="text-sm">{event.local}</span>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-20 bg-surface-container-low rounded-3xl border-2 border-dashed border-stone-200">
          <span class="material-symbols-outlined text-4xl text-stone-300 mb-4 block">event_busy</span>
          <p class="font-headline text-2xl italic text-on-surface-variant opacity-70">Nenhum evento programado no momento.</p>
          <p class="text-on-surface-variant/60 text-sm mt-2">Fique de olho, em breve teremos novidades!</p>
        </div>
      {/if}
    </div>
  </section>

  <!-- CTA FINAL (CMS) -->
  <section class="py-40 px-8 relative overflow-hidden" id="contato">
    <div class="max-w-4xl mx-auto text-center z-10 relative">
      <h2 class="font-headline text-5xl md:text-7xl text-on-surface mb-10 leading-tight">
        {cms('cta_final', 'titulo', 'Seja parte do movimento.')} <br />
        <span class="italic text-primary">{cms('cta_final', 'titulo_destaque', 'Venha viver a experiência Balança Eu.')}</span>
      </h2>
      <div class="flex flex-col md:flex-row gap-6 justify-center mt-12">
        <a href={cms('cta_final', 'cta_primario_link', '/comecar')} class="bg-primary text-on-primary px-10 py-5 rounded-xl font-bold text-xl hover:scale-105 transition-all editorial-shadow">
          {cms('cta_final', 'cta_primario_texto', 'Agendar Aula Experimental')}
        </a>
        <button class="bg-surface-container-high text-on-surface px-10 py-5 rounded-xl font-bold text-xl hover:bg-surface-container-highest transition-all">
          {cms('cta_final', 'cta_secundario_texto', 'Falar com Consultor')}
        </button>
      </div>
    </div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-fixed/20 blur-[120px] rounded-full -z-10"></div>
  </section>
</main>

<PublicFooter {navLinks} cms={data.cms} />
