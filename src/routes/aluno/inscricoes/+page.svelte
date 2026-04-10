<!-- Pulso — Inscrições em Turmas (Fase 8) -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let activeTab = $state<'minhas' | 'disponiveis'>('minhas');
  let filtroModalidade = $state('');
  let filtroDia = $state('');
  let filtroNivel = $state('');

  const diasLabels: Record<string, string> = {
    SEG: 'Segunda', TER: 'Terça', QUA: 'Quarta', QUI: 'Quinta',
    SEX: 'Sexta', SAB: 'Sábado', DOM: 'Domingo'
  };

  const diasOptions = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

  const statusLabels: Record<string, { label: string; color: string }> = {
    ATIVA: { label: 'Ativa', color: 'text-emerald-400 bg-emerald-400/10' },
    CANCELADA: { label: 'Cancelada', color: 'text-red-400 bg-red-400/10' },
    LISTA_ESPERA: { label: 'Lista de espera', color: 'text-amber-400 bg-amber-400/10' }
  };

  let niveisDisponiveis = $derived(
    [...new Set(data.turmasDisponiveis.map(t => t.nivel))].sort()
  );

  let turmasFiltradas = $derived(
    data.turmasDisponiveis.filter(t => {
      if (filtroModalidade && t.modalidadeId !== filtroModalidade) return false;
      if (filtroDia && t.diaSemana !== filtroDia) return false;
      if (filtroNivel && t.nivel !== filtroNivel) return false;
      return true;
    })
  );

  let inscricoesVisiveis = $derived(
    data.inscricoes.filter(i => i.status !== 'CANCELADA')
  );

  let inscricoesCanceladas = $derived(
    data.inscricoes.filter(i => i.status === 'CANCELADA')
  );

  let temFiltrosAtivos = $derived(
    filtroModalidade !== '' || filtroDia !== '' || filtroNivel !== ''
  );
</script>

<svelte:head>
  <title>Minhas Turmas — Pulso</title>
</svelte:head>

<div>
  <div class="flex items-start justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Turmas</h1>
      <p class="text-zinc-500 text-sm">Gerencie suas inscrições em turmas regulares</p>
    </div>
    {#if data.temPlano}
      <div class="text-right">
        <p class="text-xs text-zinc-500">Inscrições ativas</p>
        <p class="text-lg font-bold {data.inscricoesAtivas >= data.maxAulasSemana ? 'text-amber-400' : 'text-emerald-400'}">
          {data.inscricoesAtivas}/{data.maxAulasSemana}
        </p>
      </div>
    {/if}
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

  <!-- No plan warning -->
  {#if !data.temPlano}
    <div class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-6 flex items-start gap-3">
      <span class="material-symbols-outlined text-amber-400 text-[22px] mt-0.5">warning</span>
      <div>
        <p class="text-sm font-medium text-amber-300">Sem plano ativo</p>
        <p class="text-xs text-amber-400/70 mt-1">Você precisa de um plano ativo para se inscrever em turmas. <a href="/aluno/plano" class="underline hover:text-amber-300">Ver planos</a></p>
      </div>
    </div>
  {/if}

  <!-- Tabs -->
  <div class="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
    <button
      onclick={() => activeTab = 'minhas'}
      class="px-4 py-2 rounded-md text-sm font-medium transition-all {activeTab === 'minhas' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}"
    >
      Minhas Turmas
      {#if inscricoesVisiveis.length > 0}
        <span class="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{inscricoesVisiveis.length}</span>
      {/if}
    </button>
    <button
      onclick={() => activeTab = 'disponiveis'}
      class="px-4 py-2 rounded-md text-sm font-medium transition-all {activeTab === 'disponiveis' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}"
    >
      Turmas Disponíveis
      <span class="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{data.turmasDisponiveis.length}</span>
    </button>
  </div>

  <!-- TAB: Minhas Turmas -->
  {#if activeTab === 'minhas'}
    {#if inscricoesVisiveis.length === 0}
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
        <span class="material-symbols-outlined text-5xl text-zinc-700 mb-3">groups</span>
        <h2 class="text-lg font-semibold text-white mb-1">Nenhuma inscrição ativa</h2>
        <p class="text-zinc-500 text-sm mb-4">Explore as turmas disponíveis e inscreva-se.</p>
        <button onclick={() => activeTab = 'disponiveis'} class="text-emerald-400 text-sm hover:underline">
          Ver turmas disponíveis
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each inscricoesVisiveis as inscricao}
          {@const turma = inscricao.turma}
          {@const st = statusLabels[inscricao.status] ?? statusLabels.ATIVA}
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
            <div class="p-5">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-base font-semibold text-white">{turma.modalidade}</h3>
                  <p class="text-xs text-zinc-500">{turma.nivel} — Prof. {turma.professor}</p>
                </div>
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-full {st.color}">{st.label}</span>
              </div>

              <div class="grid grid-cols-2 gap-3 text-sm mb-4">
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                  {diasLabels[turma.diaSemana] ?? turma.diaSemana}
                </div>
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">schedule</span>
                  {turma.horarioInicio}–{turma.horarioFim}
                </div>
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">room</span>
                  {turma.sala}
                </div>
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">group</span>
                  {turma.inscritos}/{turma.maxAlunos} alunos
                </div>
              </div>

              <form method="POST" action="?/cancelar" use:enhance>
                <input type="hidden" name="enrollmentId" value={inscricao.id} />
                <button
                  type="submit"
                  class="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors"
                >
                  <span class="material-symbols-outlined text-[14px]">cancel</span>
                  Cancelar inscrição
                </button>
              </form>
            </div>
            <div class="px-5 py-3 bg-zinc-800/30 border-t border-zinc-800 text-[11px] text-zinc-500">
              Inscrito em {new Date(inscricao.dataInscricao).toLocaleDateString('pt-BR')}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Histórico (canceladas) -->
    {#if inscricoesCanceladas.length > 0}
      <details class="mt-6">
        <summary class="text-xs text-zinc-500 cursor-pointer hover:text-zinc-400 transition-colors">
          Histórico de inscrições canceladas ({inscricoesCanceladas.length})
        </summary>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {#each inscricoesCanceladas as inscricao}
            {@const turma = inscricao.turma}
            <div class="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 opacity-60">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h3 class="text-sm font-medium text-zinc-400">{turma.modalidade}</h3>
                  <p class="text-[11px] text-zinc-600">{turma.nivel} — Prof. {turma.professor}</p>
                </div>
                <span class="text-[10px] font-medium px-2 py-0.5 rounded-full text-red-400 bg-red-400/10">Cancelada</span>
              </div>
              <p class="text-[11px] text-zinc-600">
                {diasLabels[turma.diaSemana] ?? turma.diaSemana} · {turma.horarioInicio}–{turma.horarioFim}
              </p>
            </div>
          {/each}
        </div>
      </details>
    {/if}

  <!-- TAB: Turmas Disponíveis -->
  {:else}
    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <div>
        <label for="filtro-modalidade" class="sr-only">Modalidade</label>
        <select
          id="filtro-modalidade"
          bind:value={filtroModalidade}
          class="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Todas as modalidades</option>
          {#each data.modalidades as mod}
            <option value={mod.id}>{mod.nome}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="filtro-dia" class="sr-only">Dia da semana</label>
        <select
          id="filtro-dia"
          bind:value={filtroDia}
          class="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Todos os dias</option>
          {#each diasOptions as dia}
            <option value={dia}>{diasLabels[dia]}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="filtro-nivel" class="sr-only">Nível</label>
        <select
          id="filtro-nivel"
          bind:value={filtroNivel}
          class="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Todos os níveis</option>
          {#each niveisDisponiveis as nivel}
            <option value={nivel}>{nivel}</option>
          {/each}
        </select>
      </div>
      {#if temFiltrosAtivos}
        <button
          onclick={() => { filtroModalidade = ''; filtroDia = ''; filtroNivel = ''; }}
          class="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors px-2"
        >
          <span class="material-symbols-outlined text-[14px]">close</span>
          Limpar filtros
        </button>
      {/if}
    </div>

    {#if turmasFiltradas.length === 0}
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
        <span class="material-symbols-outlined text-5xl text-zinc-700 mb-3">search_off</span>
        <h2 class="text-lg font-semibold text-white mb-1">Nenhuma turma encontrada</h2>
        <p class="text-zinc-500 text-sm">
          {#if temFiltrosAtivos}
            Tente ajustar os filtros.
          {:else}
            Não há turmas disponíveis no momento.
          {/if}
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each turmasFiltradas as turma}
          {@const lotada = turma.inscritos >= turma.maxAlunos}
          {@const vagasRestantes = turma.maxAlunos - turma.inscritos}
          <div class="bg-zinc-900 border rounded-xl overflow-hidden transition-colors {turma.jaInscrito ? 'border-emerald-600/30' : lotada ? 'border-amber-600/20' : 'border-zinc-800 hover:border-zinc-700'}">
            <div class="p-5">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-base font-semibold text-white">{turma.modalidade}</h3>
                  <p class="text-xs text-zinc-500">{turma.nivel} — Prof. {turma.professor}</p>
                </div>
                {#if turma.jaInscrito}
                  <span class="text-[11px] font-medium px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-400/10">Inscrito</span>
                {:else if lotada}
                  <span class="text-[11px] font-medium px-2 py-0.5 rounded-full text-amber-400 bg-amber-400/10">Lotada</span>
                {:else}
                  <span class="text-[11px] font-medium px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-400/10">{vagasRestantes} vaga{vagasRestantes !== 1 ? 's' : ''}</span>
                {/if}
              </div>

              <div class="grid grid-cols-2 gap-3 text-sm mb-4">
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                  {diasLabels[turma.diaSemana] ?? turma.diaSemana}
                </div>
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">schedule</span>
                  {turma.horarioInicio}–{turma.horarioFim}
                </div>
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">room</span>
                  {turma.sala}
                </div>
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">group</span>
                  {turma.inscritos}/{turma.maxAlunos} alunos
                </div>
              </div>

              <!-- Capacity bar -->
              <div class="w-full bg-zinc-800 rounded-full h-1.5 mb-4">
                <div
                  class="h-1.5 rounded-full transition-all {lotada ? 'bg-amber-500' : 'bg-emerald-500'}"
                  style="width: {Math.min((turma.inscritos / turma.maxAlunos) * 100, 100)}%"
                ></div>
              </div>

              {#if turma.jaInscrito}
                <p class="text-xs text-emerald-400/70 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">check</span>
                  Você já está inscrito nesta turma
                </p>
              {:else if data.temPlano}
                <form method="POST" action="?/inscrever" use:enhance>
                  <input type="hidden" name="classGroupId" value={turma.id} />
                  <button
                    type="submit"
                    class="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors {lotada ? 'bg-amber-600/15 text-amber-400 hover:bg-amber-600/25' : 'bg-emerald-600 text-white hover:bg-emerald-700'}"
                  >
                    <span class="material-symbols-outlined text-[16px]">{lotada ? 'hourglass_top' : 'add_circle'}</span>
                    {lotada ? 'Entrar na lista de espera' : 'Inscrever-se'}
                  </button>
                </form>
              {:else}
                <a href="/aluno/plano" class="flex items-center gap-2 text-xs text-amber-400 hover:underline">
                  <span class="material-symbols-outlined text-[14px]">lock</span>
                  Assine um plano para se inscrever
                </a>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
