<!-- BalancaEu — Fluxo de Onboarding (/comecar) — estilo Typeform -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import Logo from '$lib/components/landing/Logo.svelte';

  let { data, form } = $props();

  const modalidades = $derived(data.modalidades ?? []);
  const turmas = $derived(data.turmas ?? []);

  // ─── Estado do fluxo ───────────────────────────────
  let step = $state(1);
  let direction = $state(1);
  let selectedModalityIds = $state<string[]>([]);
  let selectedPlacements = $state<Record<string, string>>({});
  let activeDay = $state('SEG');
  let submitting = $state(false);

  // ─── Derivados ─────────────────────────────────────
  const selectedModalidades = $derived(
    modalidades.filter((m: { id: string }) => selectedModalityIds.includes(m.id))
  );

  const turmasFiltradas = $derived(
    turmas.filter((t: { modalityId: string }) => selectedModalityIds.includes(t.modalityId))
  );

  const diasComAulas = $derived.by(() => {
    const dias = new Set<string>(
      turmasFiltradas.map((t: { diaSemana: string }) => t.diaSemana)
    );
    return dayKeys.filter(d => dias.has(d.key));
  });

  $effect(() => {
    const dias = diasComAulas;
    if (dias.length > 0 && !dias.find(d => d.key === activeDay)) {
      activeDay = dias[0].key;
    }
  });

  const turmasDoDia = $derived(
    turmasFiltradas.filter((t: { diaSemana: string }) => t.diaSemana === activeDay)
  );

  const SALAS = ['Sala 1', 'Sala 2', 'Sala 3'];

  // Grid: linhas = horários, colunas = salas
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

  const allModalitiesPlaced = $derived(
    selectedModalityIds.length > 0 &&
    selectedModalityIds.every(id => selectedPlacements[id])
  );

  const placementsList = $derived(
    Object.entries(selectedPlacements).map(([modalityId, classGroupId]) => {
      const m = modalidades.find((x: { id: string }) => x.id === modalityId);
      const t = turmas.find((x: { id: string }) => x.id === classGroupId);
      return { modalityId, classGroupId, modalidade: m, turma: t };
    })
  );

  const dayKeys = [
    { key: 'SEG', label: 'Seg' },
    { key: 'TER', label: 'Ter' },
    { key: 'QUA', label: 'Qua' },
    { key: 'QUI', label: 'Qui' },
    { key: 'SEX', label: 'Sex' },
    { key: 'SAB', label: 'Sáb' },
  ];

  // ─── Ações ─────────────────────────────────────────
  function toggleModalidade(id: string) {
    if (selectedModalityIds.includes(id)) {
      selectedModalityIds = selectedModalityIds.filter(x => x !== id);
      const next = { ...selectedPlacements };
      delete next[id];
      selectedPlacements = next;
    } else {
      selectedModalityIds = [...selectedModalityIds, id];
    }
  }

  function selectPlacement(modalityId: string, classGroupId: string) {
    if (selectedPlacements[modalityId] === classGroupId) {
      const next = { ...selectedPlacements };
      delete next[modalityId];
      selectedPlacements = next;
    } else {
      selectedPlacements = { ...selectedPlacements, [modalityId]: classGroupId };
    }
  }

  function removeModalidade(id: string) {
    selectedModalityIds = selectedModalityIds.filter(x => x !== id);
    const next = { ...selectedPlacements };
    delete next[id];
    selectedPlacements = next;
  }

  function next() {
    direction = 1;
    step++;
  }

  function back() {
    direction = -1;
    step--;
  }

  function slide(node: Element) {
    return fly(node, { x: direction * 40, duration: 350, easing: cubicOut });
  }
</script>

<svelte:head>
  <title>Comece sua jornada | Balança Eu</title>
  <meta name="description" content="Escolha suas modalidades e agende seu nivelamento." />
</svelte:head>

<!-- ═══════════ HEADER FIXO ═══════════ -->
<header class="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-stone-100">
  <div class="flex justify-between items-center px-6 md:px-8 py-4 max-w-screen-2xl mx-auto">
    <a class="flex items-center gap-2" href="/">
      <Logo class="h-7 w-auto" />
    </a>

    <!-- Progress tracker -->
    <div class="hidden md:flex items-center gap-3">
      {#each [1, 2, 3] as s}
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-500 {step >= s ? 'bg-primary text-white' : 'bg-stone-200 text-stone-500'}">
            {#if step > s}
              <span class="material-symbols-outlined text-[14px]">check</span>
            {:else}
              {s}
            {/if}
          </div>
          {#if s < 3}
            <div class="w-10 h-[2px] rounded-full transition-all duration-500 {step > s ? 'bg-primary' : 'bg-stone-200'}"></div>
          {/if}
        </div>
      {/each}
    </div>

    <a href="/login" class="text-[11px] text-stone-500 hover:text-primary transition-colors font-label uppercase tracking-widest flex items-center gap-1">
      <span class="material-symbols-outlined text-[14px]">login</span>
      <span class="hidden sm:inline">Já tenho conta</span>
    </a>
  </div>
</header>

<!-- ═══════════ MAIN (TYPEFORM: FIT VIEWPORT) ═══════════ -->
<main class="h-screen pt-16 bg-background flex flex-col overflow-x-hidden">
  <div class="flex-1 flex flex-col justify-center items-center px-4 md:px-8 py-4 md:py-6 w-full">

    <!-- ─── STEP 1: MÓDULOS ─── -->
    {#if step === 1}
      <div in:slide class="w-full max-w-6xl flex flex-col items-center gap-5 md:gap-6">
        <div class="text-center max-w-xl px-4">
          <span class="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-2 block">Passo 1 de 3</span>
          <h1 class="font-headline text-3xl md:text-5xl text-on-surface mb-2 leading-tight">
            Quais <span class="italic text-primary">módulos</span> você quer conhecer?
          </h1>
          <p class="text-on-surface-variant text-sm md:text-base">
            Selecione todas as modalidades que fazem seu corpo pulsar.
          </p>
        </div>

        {#if modalidades.length > 0}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-5xl">
            {#each modalidades as mod, i}
              {@const selected = selectedModalityIds.includes(mod.id)}
              <button
                type="button"
                onclick={() => toggleModalidade(mod.id)}
                in:fade={{ duration: 300, delay: i * 60 }}
                class="group relative overflow-hidden rounded-2xl aspect-[4/5] md:aspect-[3/4] text-left transition-all duration-500 border-[3px] {selected ? 'border-primary scale-[0.97] shadow-2xl' : 'border-transparent hover:-translate-y-1'}"
              >
                {#if mod.imagemUrl}
                  <img src={mod.imagemUrl} alt={mod.nome} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 {selected ? 'scale-110' : 'group-hover:scale-110'}" />
                {:else}
                  <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/60 flex items-center justify-center">
                    <span class="material-symbols-outlined text-7xl text-white/20">sports_martial_arts</span>
                  </div>
                {/if}

                <div class="absolute inset-0 bg-gradient-to-t {selected ? 'from-primary/80 via-primary/40' : 'from-black/80 via-black/20'} to-transparent transition-all duration-500"></div>

                {#if selected}
                  <div class="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xl" in:fly={{ y: -10, duration: 300 }}>
                    <span class="material-symbols-outlined text-primary font-bold text-[20px]">check</span>
                  </div>
                {/if}

                <div class="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
                  <h3 class="font-headline text-xl md:text-2xl text-white mb-1 italic leading-tight">{mod.nome}</h3>
                  <p class="text-white/75 text-[11px] leading-snug line-clamp-2">{mod.descricao}</p>
                </div>
              </button>
            {/each}
          </div>
        {:else}
          <p class="text-center text-on-surface-variant italic py-10">Nenhum módulo disponível.</p>
        {/if}

        <div class="flex items-center justify-between w-full max-w-5xl pt-2">
          <a href="/" class="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-xs font-label uppercase tracking-widest">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            Cancelar
          </a>
          <div class="flex items-center gap-3">
            <span class="text-xs text-on-surface-variant hidden sm:inline">
              {selectedModalityIds.length === 0 ? 'Nenhum selecionado' : `${selectedModalityIds.length} selecionado${selectedModalityIds.length > 1 ? 's' : ''}`}
            </span>
            <button
              type="button"
              onclick={next}
              disabled={selectedModalityIds.length === 0}
              class="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all editorial-shadow disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              Continuar
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- ─── STEP 2: CALENDÁRIO + NIVELAMENTO ─── -->
    {#if step === 2}
      <div in:slide class="w-full max-w-6xl flex flex-col items-center gap-3 md:gap-4">
        <div class="text-center max-w-2xl px-4">
          <span class="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-1 block">Passo 2 de 3</span>
          <h1 class="font-headline text-2xl md:text-4xl text-on-surface mb-1 leading-tight">
            Agende seu <span class="italic text-primary">nivelamento</span>
          </h1>
          <p class="text-on-surface-variant text-xs md:text-sm">
            Escolha um horário de nivelamento para cada módulo.
          </p>
        </div>

        <!-- Aviso compacto -->
        <div class="w-full max-w-4xl bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex gap-3 items-start">
          <span class="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">info</span>
          <p class="text-[11px] text-amber-900 leading-snug">
            Este é apenas seu <strong>nivelamento</strong> — o professor vai avaliar seu nível. Depois você pode ser alocado em uma turma com outro horário, e se não se adaptar tem direito a uma <strong>aula experimental gratuita</strong>.
          </p>
        </div>

        <!-- Chips dos módulos -->
        <div class="w-full max-w-5xl">
          <div class="flex flex-wrap gap-2 justify-center">
            {#each selectedModalidades as mod}
              {@const placed = !!selectedPlacements[mod.id]}
              <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all {placed ? 'bg-primary text-white border-primary' : 'bg-white border-stone-200 text-on-surface'}">
                {#if placed}
                  <span class="material-symbols-outlined text-[14px]">check_circle</span>
                {/if}
                <span class="text-[11px] font-medium">{mod.nome}</span>
                <button type="button" onclick={() => removeModalidade(mod.id)} class="hover:opacity-60" aria-label="Remover">
                  <span class="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            {/each}

            <details class="relative">
              <summary class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-dashed border-stone-300 text-stone-500 hover:border-primary hover:text-primary transition-colors cursor-pointer text-[11px] list-none">
                <span class="material-symbols-outlined text-[14px]">add</span>
                Adicionar
              </summary>
              <div class="absolute z-20 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 max-h-48 overflow-y-auto">
                {#each modalidades as mod}
                  {@const already = selectedModalityIds.includes(mod.id)}
                  <button
                    type="button"
                    onclick={() => toggleModalidade(mod.id)}
                    disabled={already}
                    class="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-stone-100 transition-colors flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>{mod.nome}</span>
                    {#if already}<span class="material-symbols-outlined text-[14px] text-primary">check</span>{/if}
                  </button>
                {/each}
              </div>
            </details>
          </div>
        </div>

        <!-- Calendário -->
        <div class="w-full max-w-5xl flex flex-col gap-3">
          <!-- Tabs dos dias -->
          <div class="flex flex-wrap justify-center gap-1.5">
            {#each dayKeys as day}
              {@const hasClasses = turmasFiltradas.some((t: { diaSemana: string }) => t.diaSemana === day.key)}
              <button
                type="button"
                onclick={() => activeDay = day.key}
                disabled={!hasClasses}
                class="px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all border-2 {activeDay === day.key ? 'bg-primary text-white border-primary' : hasClasses ? 'bg-white text-on-surface-variant border-stone-200 hover:border-primary/30' : 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed'}"
              >
                {day.label}
              </button>
            {/each}
          </div>

          <!-- Grade: linhas = horários, colunas = salas -->
          <div class="max-h-[45vh] overflow-y-auto pr-1">
            {#if gradeSemanal.length > 0}
              <!-- Header das salas -->
              <div class="grid grid-cols-[60px_1fr_1fr_1fr] md:grid-cols-[80px_1fr_1fr_1fr] gap-2 mb-2 sticky top-0 bg-background z-10 pb-1">
                <div></div>
                {#each SALAS as sala}
                  <div class="text-center">
                    <span class="font-label text-[10px] md:text-[11px] uppercase tracking-widest text-primary">{sala}</span>
                  </div>
                {/each}
              </div>

              <div class="space-y-2">
                {#each gradeSemanal as [horario, porSala] (horario)}
                  <div class="grid grid-cols-[60px_1fr_1fr_1fr] md:grid-cols-[80px_1fr_1fr_1fr] gap-2 items-stretch">
                    <div class="bg-primary/5 rounded-lg flex items-center justify-center border-l-2 border-primary/20 px-1">
                      <span class="font-headline text-[11px] md:text-sm text-primary text-center leading-tight">{horario}</span>
                    </div>
                    {#each SALAS as sala}
                      {@const turma = porSala[sala]}
                      {#if turma}
                        {@const isSelected = selectedPlacements[turma.modality.id] === turma.id}
                        {@const otherSelected = selectedPlacements[turma.modality.id] && !isSelected}
                        <button
                          type="button"
                          onclick={() => selectPlacement(turma.modality.id, turma.id)}
                          class="bg-white p-2.5 rounded-xl border-2 text-left transition-all duration-300 min-h-[60px] {isSelected ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg' : otherSelected ? 'border-stone-100 opacity-40' : 'border-stone-100 hover:border-primary/40 hover:-translate-y-0.5'}"
                        >
                          <div class="flex items-start justify-between gap-1.5">
                            <div class="flex-1 min-w-0">
                              <h4 class="font-headline text-[11px] md:text-xs text-primary leading-tight truncate">{turma.modality.nome}</h4>
                              <p class="text-[9px] text-on-surface-variant truncate leading-tight">{turma.nivel}</p>
                              <p class="text-[9px] text-stone-400 mt-0.5 truncate">{turma.professor.nome}</p>
                            </div>
                            {#if isSelected}
                              <div class="w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0" in:fly={{ y: -5, duration: 200 }}>
                                <span class="material-symbols-outlined text-white text-[12px]">check</span>
                              </div>
                            {/if}
                          </div>
                        </button>
                      {:else}
                        <div class="bg-white/30 rounded-xl border border-dashed border-stone-200 flex items-center justify-center min-h-[60px]">
                          <span class="text-[9px] text-stone-300 uppercase tracking-widest">—</span>
                        </div>
                      {/if}
                    {/each}
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-10 bg-white/50 rounded-2xl border-2 border-dashed border-stone-200">
                <span class="material-symbols-outlined text-3xl text-stone-300 block mb-2">event_busy</span>
                <p class="text-sm text-on-surface-variant">Nenhuma aula neste dia.</p>
              </div>
            {/if}
          </div>
        </div>

        <div class="flex items-center justify-between w-full max-w-5xl pt-1">
          <button
            type="button"
            onclick={back}
            class="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-xs font-label uppercase tracking-widest"
          >
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            Voltar
          </button>
          <div class="flex items-center gap-3">
            <span class="text-xs text-on-surface-variant hidden sm:inline">
              {Object.keys(selectedPlacements).length}/{selectedModalityIds.length} marcados
            </span>
            <button
              type="button"
              onclick={next}
              disabled={!allModalitiesPlaced}
              class="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all editorial-shadow disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              Continuar
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- ─── STEP 3: CRIAR CONTA ─── -->
    {#if step === 3}
      <div in:slide class="w-full max-w-5xl flex flex-col items-center gap-5">
        <div class="text-center max-w-xl px-4">
          <span class="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-2 block">Passo 3 de 3</span>
          <h1 class="font-headline text-3xl md:text-5xl text-on-surface mb-2 leading-tight">
            Crie sua <span class="italic text-primary">conta</span>
          </h1>
          <p class="text-on-surface-variant text-sm">
            Último passo — seus nivelamentos já estão reservados.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-5 w-full">
          <!-- Form -->
          <div class="lg:col-span-3">
            <form
              method="POST"
              action="?/signup"
              class="bg-white rounded-2xl p-6 editorial-shadow border border-stone-100 space-y-4"
              use:enhance={() => {
                submitting = true;
                return async ({ update }) => {
                  await update();
                  submitting = false;
                };
              }}
            >
              <input
                type="hidden"
                name="placements"
                value={JSON.stringify(Object.values(selectedPlacements).map(id => ({ classGroupId: id })))}
              />

              {#if form?.error}
                <div class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">
                  <span class="material-symbols-outlined text-[16px]">error</span>
                  <span>{form.error}</span>
                </div>
              {/if}

              <div>
                <label for="nome" class="text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1 block">Nome completo</label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  value={form?.nome ?? ''}
                  placeholder="Como podemos te chamar?"
                  class="w-full bg-stone-50 border-2 border-stone-100 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-stone-400 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label for="email" class="text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1 block">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form?.email ?? ''}
                  placeholder="voce@exemplo.com"
                  class="w-full bg-stone-50 border-2 border-stone-100 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-stone-400 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="password" class="text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1 block">Senha</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minlength="6"
                    placeholder="Mínimo 6 caracteres"
                    class="w-full bg-stone-50 border-2 border-stone-100 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-stone-400 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label for="passwordConfirm" class="text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1 block">Confirmar</label>
                  <input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    required
                    minlength="6"
                    placeholder="Repita a senha"
                    class="w-full bg-stone-50 border-2 border-stone-100 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-stone-400 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                class="w-full bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-all editorial-shadow disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
              >
                {#if submitting}
                  <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Criando sua conta...
                {:else}
                  Finalizar e agendar nivelamentos
                  <span class="material-symbols-outlined text-[18px]">check_circle</span>
                {/if}
              </button>

              <p class="text-center text-[11px] text-stone-500">
                Já tem conta?
                <a href="/login" class="text-primary hover:underline font-medium">Fazer login</a>
              </p>
            </form>
          </div>

          <!-- Resumo -->
          <aside class="lg:col-span-2 bg-primary/5 rounded-2xl p-5 border border-primary/10 h-fit">
            <h3 class="font-headline text-lg text-on-surface mb-3">Seu resumo</h3>
            <div class="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {#each placementsList as p}
                {@const mod = p.modalidade}
                {@const turma = p.turma}
                {#if mod && turma}
                  <div class="bg-white rounded-xl p-3 border border-stone-100">
                    <span class="text-[9px] uppercase tracking-widest text-stone-400 font-label block">Nivelamento</span>
                    <h4 class="font-headline text-sm text-primary">{mod.nome}</h4>
                    <div class="flex items-center gap-2 mt-1 text-[10px] text-on-surface-variant">
                      <div class="flex items-center gap-0.5">
                        <span class="material-symbols-outlined text-[12px]">event</span>
                        <span>{dayKeys.find(d => d.key === turma.diaSemana)?.label}</span>
                      </div>
                      <div class="flex items-center gap-0.5">
                        <span class="material-symbols-outlined text-[12px]">schedule</span>
                        <span>{turma.horarioInicio}</span>
                      </div>
                    </div>
                    <p class="text-[9px] text-stone-400 mt-0.5">{turma.professor.nome}</p>
                  </div>
                {/if}
              {/each}
            </div>
            <button
              type="button"
              onclick={back}
              class="w-full mt-3 text-[11px] text-stone-500 hover:text-primary transition-colors flex items-center justify-center gap-1"
            >
              <span class="material-symbols-outlined text-[14px]">edit</span>
              Editar seleção
            </button>
          </aside>
        </div>
      </div>
    {/if}

  </div>
</main>
