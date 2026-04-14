<!-- BalancaEu — Admin: Controle de Presença (Fase 13) -->
<script lang="ts">
  import { goto } from '$app/navigation';

  let { data } = $props();

  let filtroTurma = $state(data.filtros.turmaId);
  let filtroAluno = $state(data.filtros.alunoId);

  const diasLabels: Record<string, string> = {
    SEG: 'Seg', TER: 'Ter', QUA: 'Qua', QUI: 'Qui',
    SEX: 'Sex', SAB: 'Sáb', DOM: 'Dom'
  };

  function aplicarFiltros() {
    const params = new URLSearchParams();
    if (filtroTurma) params.set('turma', filtroTurma);
    if (filtroAluno) params.set('aluno', filtroAluno);
    const qs = params.toString();
    goto(`/admin/presenca${qs ? '?' + qs : ''}`, { invalidateAll: true });
  }

  function limparFiltros() {
    filtroTurma = '';
    filtroAluno = '';
    goto('/admin/presenca', { invalidateAll: true });
  }

  function formatDate(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
</script>

<svelte:head>
  <title>Presença — Admin — BalancaEu</title>
</svelte:head>

<div>
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-white mb-1">Controle de Presença</h1>
    <p class="text-zinc-500 text-sm">Visão geral da frequência dos alunos (últimos 30 dias)</p>
  </div>

  <!-- Summary cards -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Presenças</span>
      <p class="text-lg font-bold text-emerald-400 mt-1">{data.resumo.totalPresencas}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Faltas</span>
      <p class="text-lg font-bold text-red-400 mt-1">{data.resumo.totalFaltas}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Taxa de Presença</span>
      <p class="text-lg font-bold text-white mt-1">{data.resumo.taxaPresenca}%</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Registros</span>
      <p class="text-lg font-bold text-white mt-1">{data.registros.length}</p>
    </div>
  </div>

  <!-- Filters -->
  <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
    <div class="flex items-center gap-2 mb-3">
      <span class="material-symbols-outlined text-[18px] text-zinc-400">filter_list</span>
      <span class="text-xs font-medium text-zinc-400">Filtros</span>
      {#if filtroTurma || filtroAluno}
        <button onclick={limparFiltros} class="ml-auto text-[11px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">close</span>
          Limpar
        </button>
      {/if}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label for="f-turma" class="block text-[10px] text-zinc-500 mb-1">Turma</label>
        <select id="f-turma" bind:value={filtroTurma} onchange={aplicarFiltros}
          class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
          <option value="">Todas</option>
          {#each data.turmas as turma}
            <option value={turma.id}>{turma.label}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="f-aluno" class="block text-[10px] text-zinc-500 mb-1">Aluno</label>
        <select id="f-aluno" bind:value={filtroAluno} onchange={aplicarFiltros}
          class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
          <option value="">Todos</option>
          {#each data.alunosList as aluno}
            <option value={aluno.id}>{aluno.nome}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Alunos com mais faltas -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="p-4 border-b border-zinc-800">
        <h2 class="text-sm font-semibold text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-amber-400">warning</span>
          Alunos com Faltas
        </h2>
      </div>
      {#if data.alunosComFaltas.length === 0}
        <div class="p-6 text-center">
          <p class="text-zinc-500 text-xs">Nenhum registro de faltas.</p>
        </div>
      {:else}
        <div class="divide-y divide-zinc-800/50 max-h-[400px] overflow-y-auto">
          {#each data.alunosComFaltas as aluno}
            <div class="px-4 py-3 flex items-center justify-between">
              <div class="min-w-0">
                <p class="text-sm text-white truncate">{aluno.nome}</p>
                <p class="text-[10px] text-zinc-500">{aluno.total} aula(s) registrada(s)</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                {#if aluno.faltas >= 3}
                  <span class="material-symbols-outlined text-[14px] text-amber-400" title="3+ faltas">warning</span>
                {/if}
                <div class="text-right">
                  <span class="text-xs font-medium {aluno.faltas > 0 ? 'text-red-400' : 'text-emerald-400'}">{aluno.faltas} falta(s)</span>
                  <div class="w-14 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                    <div class="h-full bg-emerald-500 rounded-full" style="width: {aluno.taxa}%"></div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Registros detalhados -->
    <div class="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="p-4 border-b border-zinc-800">
        <h2 class="text-sm font-semibold text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-blue-400">list_alt</span>
          Registros de Presença
        </h2>
      </div>
      {#if data.registros.length === 0}
        <div class="p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-zinc-700 mb-2">fact_check</span>
          <p class="text-zinc-500 text-sm">Nenhum registro de presença encontrado.</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                <th class="px-4 py-3">Data</th>
                <th class="px-4 py-3">Aluno</th>
                <th class="px-4 py-3">Turma</th>
                <th class="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/50">
              {#each data.registros as r}
                <tr class="hover:bg-zinc-800/30 transition-colors">
                  <td class="px-4 py-2.5 text-zinc-400 whitespace-nowrap text-xs">
                    {formatDate(r.data)}
                  </td>
                  <td class="px-4 py-2.5">
                    <p class="text-xs text-white">{r.aluno}</p>
                  </td>
                  <td class="px-4 py-2.5">
                    <p class="text-xs text-zinc-400">{r.turma}</p>
                    <p class="text-[10px] text-zinc-600">{diasLabels[r.dia]} {r.horario}</p>
                  </td>
                  <td class="px-4 py-2.5">
                    <span class="text-[10px] font-medium px-2 py-0.5 rounded-full
                      {r.presente ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}">
                      {r.presente ? 'Presente' : 'Ausente'}
                    </span>
                    {#if r.observacao}
                      <p class="text-[10px] text-zinc-600 mt-0.5">{r.observacao}</p>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</div>
