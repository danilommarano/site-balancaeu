<!-- BalancaEu — Minhas Turmas (calendário semanal) -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  type TurmaDisp = typeof data.turmasDisponiveis[number];
  type InscricaoItem = typeof data.inscricoes[number];

  // ─── Estado ────────────────────────────────────
  let filtro = $state<'minhas' | 'todas'>('todas');
  let activeDay = $state('SEG');

  const dayKeys = [
    { key: 'SEG', label: 'Seg' },
    { key: 'TER', label: 'Ter' },
    { key: 'QUA', label: 'Qua' },
    { key: 'QUI', label: 'Qui' },
    { key: 'SEX', label: 'Sex' },
    { key: 'SAB', label: 'Sáb' },
  ];

  const SALAS = ['Sala 1', 'Sala 2', 'Sala 3'];

  // Mapa: classGroupId → enrollmentId (para cancelar)
  const minhaInscricaoPorTurma = $derived.by(() => {
    const m = new Map<string, InscricaoItem>();
    for (const i of data.inscricoes) {
      if (i.status === 'ATIVA' || i.status === 'LISTA_ESPERA') {
        m.set(i.turma.id, i);
      }
    }
    return m;
  });

  // Lista exibida conforme filtro
  const turmasVisiveis = $derived.by(() => {
    if (filtro === 'todas') return data.turmasDisponiveis;
    return data.turmasDisponiveis.filter(t => minhaInscricaoPorTurma.has(t.id));
  });

  const turmasDoDia = $derived(
    turmasVisiveis.filter(t => t.diaSemana === activeDay)
  );

  const diasComAulas = $derived.by(() => {
    const dias = new Set<string>(turmasVisiveis.map(t => t.diaSemana));
    return dayKeys.filter(d => dias.has(d.key));
  });

  $effect(() => {
    const dias = diasComAulas;
    if (dias.length > 0 && !dias.find(d => d.key === activeDay)) {
      activeDay = dias[0].key;
    }
  });

  // Grade: linhas = horários, colunas = salas
  const gradeSemanal = $derived.by(() => {
    const slotMap = new Map<string, Record<string, TurmaDisp | null>>();
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
  <title>Minhas Turmas — BalancaEu</title>
</svelte:head>

<div>
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Minhas Turmas</h1>
    <p class="text-zinc-500 text-sm">Navegue pela grade semanal e gerencie suas inscrições</p>
  </div>

  <!-- Feedback -->
  {#if form?.error}
    <div class="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
      <span class="material-symbols-outlined text-[18px]">error</span>
      <span>{form.error}</span>
    </div>
  {/if}
  {#if form?.success}
    <div class="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 rounded-lg px-4 py-3 text-sm">
      <span class="material-symbols-outlined text-[18px]">check_circle</span>
      <span>{form.message ?? 'Operação realizada.'}</span>
    </div>
  {/if}

  <!-- Filtro + Stats -->
  <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
    <!-- Toggle -->
    <div class="inline-flex items-center bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-1 shadow-sm">
      <button
        type="button"
        onclick={() => filtro = 'todas'}
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
          {filtro === 'todas'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}"
      >
        <span class="material-symbols-outlined text-[16px]">grid_view</span>
        Todas as turmas
      </button>
      <button
        type="button"
        onclick={() => filtro = 'minhas'}
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
          {filtro === 'minhas'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}"
      >
        <span class="material-symbols-outlined text-[16px]">checklist</span>
        Apenas minhas
        <span class="text-[10px] bg-stone-200 dark:bg-zinc-800 {filtro === 'minhas' ? 'text-emerald-700' : 'text-zinc-500'} rounded-full px-2 py-0.5">
          {minhaInscricaoPorTurma.size}
        </span>
      </button>
    </div>

    <!-- Plan badge -->
    {#if data.temPlano}
      <div class="flex items-center gap-2 text-xs text-zinc-500">
        <span class="material-symbols-outlined text-[16px] text-emerald-500">bolt</span>
        <span>
          <strong class="text-zinc-900 dark:text-white">{data.inscricoesAtivas}</strong>/{data.maxAulasSemana} aulas ativas
        </span>
      </div>
    {:else}
      <a
        href="/aluno/plano"
        class="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
      >
        <span class="material-symbols-outlined text-[16px]">warning</span>
        Você precisa de um plano ativo para se inscrever
      </a>
    {/if}
  </div>

  <!-- Day tabs -->
  <div class="flex flex-wrap gap-2 mb-6">
    {#each dayKeys as day}
      {@const hasClasses = turmasVisiveis.some(t => t.diaSemana === day.key)}
      <button
        type="button"
        onclick={() => activeDay = day.key}
        disabled={!hasClasses}
        class="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all border-2
          {activeDay === day.key
            ? 'bg-emerald-600 text-white border-emerald-600'
            : hasClasses
              ? 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-800 hover:border-emerald-500/50'
              : 'bg-stone-50 dark:bg-zinc-900/30 text-stone-300 dark:text-zinc-700 border-stone-100 dark:border-zinc-800/50 cursor-not-allowed'}"
      >
        {day.label}
      </button>
    {/each}
  </div>

  <!-- Grade: linhas = horários, colunas = salas -->
  {#if gradeSemanal.length > 0}
    <div class="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6">
      <!-- Header das salas -->
      <div class="grid grid-cols-[80px_1fr_1fr_1fr] md:grid-cols-[100px_1fr_1fr_1fr] gap-3 mb-3">
        <div></div>
        {#each SALAS as sala}
          <div class="text-center">
            <span class="font-label text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400">{sala}</span>
          </div>
        {/each}
      </div>

      <!-- Linhas -->
      <div class="space-y-3">
        {#each gradeSemanal as [horario, porSala] (horario)}
          <div class="grid grid-cols-[80px_1fr_1fr_1fr] md:grid-cols-[100px_1fr_1fr_1fr] gap-3 items-stretch">
            <div class="bg-emerald-600/5 dark:bg-emerald-600/10 rounded-xl flex items-center justify-center border-l-2 border-emerald-600/30 px-2">
              <span class="font-headline text-sm md:text-base text-emerald-700 dark:text-emerald-400 text-center leading-tight">{horario}</span>
            </div>
            {#each SALAS as sala}
              {@const turma = porSala[sala]}
              {#if turma}
                {@const inscricao = minhaInscricaoPorTurma.get(turma.id)}
                {@const isEnrolled = !!inscricao}
                {@const isWaitlist = inscricao?.status === 'LISTA_ESPERA'}
                {@const isFull = turma.inscritos >= turma.maxAlunos}
                <div
                  class="p-3 md:p-4 rounded-xl border-2 transition-all
                    {isEnrolled
                      ? 'bg-emerald-50 dark:bg-emerald-600/10 border-emerald-500 dark:border-emerald-600/40'
                      : 'bg-stone-50 dark:bg-zinc-800/40 border-stone-200 dark:border-zinc-800 hover:border-emerald-500/40'}"
                >
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div class="min-w-0 flex-1">
                      <h4 class="font-headline text-sm md:text-base text-zinc-900 dark:text-white leading-tight truncate">{turma.modalidade}</h4>
                      <p class="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">{turma.nivel}</p>
                      <p class="text-[10px] text-zinc-500 truncate">Prof. {turma.professor}</p>
                    </div>
                    {#if isEnrolled}
                      <span class="shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-white text-[14px]">check</span>
                      </span>
                    {/if}
                  </div>

                  <!-- Capacity bar -->
                  <div class="flex items-center gap-2 text-[9px] mb-2">
                    <div class="flex-1 h-1 rounded-full bg-stone-200 dark:bg-zinc-700 overflow-hidden">
                      <div
                        class="h-full transition-all {isFull ? 'bg-amber-500' : 'bg-emerald-500'}"
                        style="width: {Math.min(100, (turma.inscritos / turma.maxAlunos) * 100)}%"
                      ></div>
                    </div>
                    <span class="text-zinc-500 tabular-nums">{turma.inscritos}/{turma.maxAlunos}</span>
                  </div>

                  {#if isEnrolled}
                    <div class="flex flex-col gap-1">
                      {#if isWaitlist}
                        <span class="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Lista de espera</span>
                      {/if}
                      <form method="POST" action="?/cancelar" use:enhance>
                        <input type="hidden" name="enrollmentId" value={inscricao!.id} />
                        <button
                          type="submit"
                          class="w-full text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-red-300 dark:border-red-600/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-600/10 transition-colors"
                        >
                          Cancelar
                        </button>
                      </form>
                    </div>
                  {:else if data.temPlano}
                    <form method="POST" action="?/inscrever" use:enhance>
                      <input type="hidden" name="classGroupId" value={turma.id} />
                      <button
                        type="submit"
                        class="w-full text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      >
                        {isFull ? 'Lista de espera' : 'Inscrever-se'}
                      </button>
                    </form>
                  {:else}
                    <div class="text-[9px] text-center text-zinc-500 py-1.5">Plano necessário</div>
                  {/if}
                </div>
              {:else}
                <div class="bg-stone-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-stone-200 dark:border-zinc-800 flex items-center justify-center min-h-[100px]">
                  <span class="text-[10px] text-stone-300 dark:text-zinc-700 uppercase tracking-widest">—</span>
                </div>
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="bg-white dark:bg-zinc-900 border-2 border-dashed border-stone-200 dark:border-zinc-800 rounded-2xl p-16 text-center">
      <span class="material-symbols-outlined text-5xl text-stone-300 dark:text-zinc-700 block mb-3">event_busy</span>
      {#if filtro === 'minhas'}
        <p class="font-headline text-xl italic text-zinc-500 mb-2">Você ainda não está inscrito em turmas</p>
        <button
          type="button"
          onclick={() => filtro = 'todas'}
          class="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Ver todas as turmas disponíveis →
        </button>
      {:else}
        <p class="font-headline text-xl italic text-zinc-500">Nenhuma turma cadastrada no momento.</p>
      {/if}
    </div>
  {/if}
</div>
