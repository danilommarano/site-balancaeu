<!-- BalancaEu — Professor: Chamada (Fase 13) -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  let { data, form } = $props();

  const diasLabels: Record<string, string> = {
    SEG: 'Segunda-feira', TER: 'Terça-feira', QUA: 'Quarta-feira', QUI: 'Quinta-feira',
    SEX: 'Sexta-feira', SAB: 'Sábado', DOM: 'Domingo'
  };

  // Reactive state for presence toggles
  let presencaState = $state<Record<string, boolean>>({});
  let obsState = $state<Record<string, string>>({});

  // Initialize state from loaded data
  $effect(() => {
    const p: Record<string, boolean> = {};
    const o: Record<string, string> = {};
    for (const a of data.alunos) {
      p[a.id] = a.presente ?? true; // default to present
      o[a.id] = a.observacao ?? '';
    }
    presencaState = p;
    obsState = o;
  });

  function togglePresenca(alunoId: string) {
    presencaState[alunoId] = !presencaState[alunoId];
  }

  function marcarTodos(presente: boolean) {
    for (const a of data.alunos) {
      presencaState[a.id] = presente;
    }
  }

  function navegarData(offset: number) {
    const d = new Date(data.dataSelecionada + 'T12:00:00');
    d.setDate(d.getDate() + offset);
    const novaData = d.toISOString().split('T')[0];
    const params = new URLSearchParams();
    params.set('data', novaData);
    if (data.turmaId) params.set('turma', data.turmaId);
    goto(`/professor/chamada?${params.toString()}`);
  }

  function selecionarTurma(turmaId: string) {
    const params = new URLSearchParams();
    params.set('data', data.dataSelecionada);
    params.set('turma', turmaId);
    goto(`/professor/chamada?${params.toString()}`);
  }

  let totalPresentes = $derived(Object.values(presencaState).filter(v => v).length);
  let totalAusentes = $derived(Object.values(presencaState).filter(v => !v).length);

  let chamadaJaFeita = $derived(data.alunos.some(a => a.presente !== null));

  function formatDateBr(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function formatDateShort(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
</script>

<svelte:head>
  <title>Chamada — Professor — BalancaEu</title>
</svelte:head>

<div>
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-white mb-1">Chamada</h1>
    <p class="text-zinc-500 text-sm">Registre a presença dos alunos nas suas turmas</p>
  </div>

  <!-- Feedback -->
  {#if form?.success}
    <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-4 py-3 mb-6 text-sm">
      <span class="material-symbols-outlined text-[18px]">check_circle</span>
      {form.message}
    </div>
  {/if}
  {#if form?.error}
    <div class="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
      <span class="material-symbols-outlined text-[18px]">error</span>
      {form.error}
    </div>
  {/if}

  <!-- Date navigation -->
  <div class="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 mb-6">
    <button onclick={() => navegarData(-1)} class="p-1 text-zinc-400 hover:text-white transition-colors">
      <span class="material-symbols-outlined">chevron_left</span>
    </button>
    <div class="text-center">
      <p class="text-sm font-semibold text-white">{diasLabels[data.diaStr] ?? data.diaStr}</p>
      <p class="text-xs text-zinc-500">{formatDateBr(data.dataSelecionada)}</p>
    </div>
    <button onclick={() => navegarData(1)} class="p-1 text-zinc-400 hover:text-white transition-colors">
      <span class="material-symbols-outlined">chevron_right</span>
    </button>
  </div>

  <!-- Classes for this day -->
  {#if data.turmasDoDia.length === 0}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
      <span class="material-symbols-outlined text-5xl text-zinc-700 mb-3">event_busy</span>
      <h2 class="text-lg font-semibold text-white mb-1">Sem aulas neste dia</h2>
      <p class="text-zinc-500 text-sm">Você não tem turmas programadas para {diasLabels[data.diaStr]?.toLowerCase() ?? 'este dia'}.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {#each data.turmasDoDia as turma}
        {@const isSelected = data.turmaId === turma.id}
        <button
          onclick={() => selecionarTurma(turma.id)}
          class="text-left bg-zinc-900 border rounded-xl p-4 transition-all {isSelected ? 'border-blue-500 bg-blue-600/5' : 'border-zinc-800 hover:border-zinc-700'}"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-white">{turma.modalidade}</span>
            <span class="text-[10px] text-zinc-500">{turma.totalAlunos} aluno(s)</span>
          </div>
          <p class="text-xs text-zinc-400">{turma.nivel} · {turma.horarioInicio}–{turma.horarioFim}</p>
          <p class="text-[10px] text-zinc-600 mt-1">Sala {turma.sala}</p>
        </button>
      {/each}
    </div>

    <!-- Attendance form -->
    {#if data.turmaId && data.alunos.length > 0}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <form method="POST" action="?/salvar" use:enhance>
            <input type="hidden" name="turmaId" value={data.turmaId} />
            <input type="hidden" name="data" value={data.dataSelecionada} />

            <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div class="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px] text-blue-400">fact_check</span>
                  <span class="text-sm font-semibold text-white">Lista de Presença</span>
                  {#if chamadaJaFeita}
                    <span class="text-[10px] bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded-full">Chamada feita</span>
                  {/if}
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" onclick={() => marcarTodos(true)}
                    class="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 rounded bg-emerald-400/10 hover:bg-emerald-400/15">
                    Todos presentes
                  </button>
                  <button type="button" onclick={() => marcarTodos(false)}
                    class="text-[10px] text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded bg-red-400/10 hover:bg-red-400/15">
                    Todos ausentes
                  </button>
                </div>
              </div>

              <div class="divide-y divide-zinc-800/50">
                {#each data.alunos as aluno}
                  <div class="px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/20 transition-colors">
                    <input type="hidden" name="alunoId" value={aluno.id} />
                    {#if presencaState[aluno.id]}
                      <input type="hidden" name="presente" value={aluno.id} />
                    {/if}

                    <!-- Toggle button -->
                    <button
                      type="button"
                      onclick={() => togglePresenca(aluno.id)}
                      class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all
                        {presencaState[aluno.id]
                          ? 'bg-emerald-600/20 text-emerald-400'
                          : 'bg-red-600/20 text-red-400'}"
                    >
                      <span class="material-symbols-outlined text-[20px]">
                        {presencaState[aluno.id] ? 'check' : 'close'}
                      </span>
                    </button>

                    <!-- Student info -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-white truncate">{aluno.nome}</p>
                      <p class="text-[10px] text-zinc-500 truncate">{aluno.email}</p>
                    </div>

                    <!-- Status label -->
                    <span class="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0
                      {presencaState[aluno.id]
                        ? 'text-emerald-400 bg-emerald-400/10'
                        : 'text-red-400 bg-red-400/10'}">
                      {presencaState[aluno.id] ? 'Presente' : 'Ausente'}
                    </span>
                  </div>
                {/each}
              </div>

              <!-- Summary + Save -->
              <div class="p-4 border-t border-zinc-800 flex items-center justify-between">
                <div class="flex items-center gap-4 text-xs">
                  <span class="text-emerald-400">{totalPresentes} presente(s)</span>
                  <span class="text-red-400">{totalAusentes} ausente(s)</span>
                  <span class="text-zinc-500">{data.alunos.length} total</span>
                </div>
                <button
                  type="submit"
                  class="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <span class="material-symbols-outlined text-[16px]">save</span>
                  Salvar Chamada
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Attendance history -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div class="p-4 border-b border-zinc-800">
            <h3 class="text-sm font-semibold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-purple-400">history</span>
              Histórico
            </h3>
          </div>
          {#if data.historico.length === 0}
            <div class="p-6 text-center">
              <p class="text-zinc-500 text-xs">Nenhum histórico de chamada.</p>
            </div>
          {:else}
            <div class="divide-y divide-zinc-800/50">
              {#each data.historico as h}
                <div class="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p class="text-xs text-white">{formatDateShort(h.data)}</p>
                    <p class="text-[10px] text-zinc-500">{h.total} aluno(s)</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-emerald-400">{h.presentes}P</span>
                    <span class="text-[10px] text-red-400">{h.ausentes}F</span>
                    <div class="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-emerald-500 rounded-full"
                        style="width: {h.total > 0 ? (h.presentes / h.total * 100) : 0}%"
                      ></div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

    {:else if data.turmaId && data.alunos.length === 0}
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-zinc-700 mb-2">group_off</span>
        <p class="text-zinc-500 text-sm">Nenhum aluno inscrito nesta turma.</p>
      </div>
    {:else}
      <div class="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-zinc-700 mb-2">touch_app</span>
        <p class="text-zinc-500 text-sm">Selecione uma turma acima para fazer a chamada.</p>
      </div>
    {/if}
  {/if}
</div>
