<!-- Pulso — Dashboard Admin (Fase 14) -->
<script lang="ts">
  let { data } = $props();

  let stats = $derived(data.stats);
  let charts = $derived(data.charts);

  let cards = $derived([
    { label: 'Alunos ativos', value: stats?.alunosAtivos ?? 0, icon: 'person', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Turmas', value: stats?.totalTurmas ?? 0, icon: 'groups', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Professores', value: stats?.totalProfessores ?? 0, icon: 'school', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Check-ins hoje', value: stats?.checkInsHoje ?? 0, icon: 'check_circle', color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { label: 'Ocupação', value: `${stats?.taxaOcupacao ?? 0}%`, icon: 'groups_3', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ]);

  // Bar chart helpers
  function barMaxValue(items: { total: number }[]): number {
    return Math.max(...items.map(i => i.total), 1);
  }

  function revenueMax(items: { valor: number }[]): number {
    return Math.max(...items.map(i => i.valor), 1);
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  }
</script>

<svelte:head>
  <title>Dashboard — Admin — Pulso</title>
</svelte:head>

<div>
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white mb-1">Dashboard</h1>
    <p class="text-zinc-500 text-sm">Visão geral — {data.tenant?.nome ?? 'Escola'}</p>
  </div>

  <!-- Stats cards -->
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
    {#each cards as card}
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
        <div class="flex items-center justify-between mb-3">
          <span class="text-zinc-500 text-xs uppercase tracking-wider">{card.label}</span>
          <div class="w-8 h-8 {card.bg} rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-[18px] {card.color}">{card.icon}</span>
          </div>
        </div>
        <p class="text-3xl font-bold text-white">{card.value}</p>
      </div>
    {/each}
  </div>

  <!-- Revenue + Subscriptions row -->
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <span class="text-zinc-500 text-xs uppercase tracking-wider">Receita total</span>
      <p class="text-2xl font-bold text-emerald-400 mt-2">{formatCurrency(stats?.receitaTotal ?? 0)}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <span class="text-zinc-500 text-xs uppercase tracking-wider">Assinaturas ativas</span>
      <p class="text-2xl font-bold text-blue-400 mt-2">{stats?.assinaturasAtivas ?? 0}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <span class="text-zinc-500 text-xs uppercase tracking-wider">Canceladas</span>
      <p class="text-2xl font-bold text-red-400 mt-2">{stats?.assinaturasCanceladas ?? 0}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <span class="text-zinc-500 text-xs uppercase tracking-wider">Modalidades</span>
      <p class="text-2xl font-bold text-purple-400 mt-2">{stats?.modalidades ?? 0}</p>
    </div>
  </div>

  <!-- Charts -->
  {#if charts}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Alunos por mês -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-emerald-400">trending_up</span>
          <h2 class="text-sm font-semibold text-white">Alunos Ativos (6 meses)</h2>
        </div>
        <div class="p-5">
          <div class="flex items-end gap-2 h-40">
            {#each charts.alunosPorMes as item}
              {@const maxVal = barMaxValue(charts.alunosPorMes)}
              {@const height = maxVal > 0 ? (item.total / maxVal) * 100 : 0}
              <div class="flex-1 flex flex-col items-center gap-1">
                <span class="text-[10px] text-zinc-400 font-medium">{item.total}</span>
                <div class="w-full rounded-t-md bg-emerald-500/20 relative overflow-hidden transition-all" style="height: {Math.max(height, 4)}%">
                  <div class="absolute inset-0 bg-gradient-to-t from-emerald-500 to-emerald-400/60 rounded-t-md"></div>
                </div>
                <span class="text-[9px] text-zinc-600 uppercase">{item.mes}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Receita por mês -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-blue-400">payments</span>
          <h2 class="text-sm font-semibold text-white">Receita Mensal (6 meses)</h2>
        </div>
        <div class="p-5">
          <div class="flex items-end gap-2 h-40">
            {#each charts.receitaPorMes as item}
              {@const maxVal = revenueMax(charts.receitaPorMes)}
              {@const height = maxVal > 0 ? (item.valor / maxVal) * 100 : 0}
              <div class="flex-1 flex flex-col items-center gap-1">
                <span class="text-[10px] text-zinc-400 font-medium">{formatCurrency(item.valor)}</span>
                <div class="w-full rounded-t-md bg-blue-500/20 relative overflow-hidden transition-all" style="height: {Math.max(height, 4)}%">
                  <div class="absolute inset-0 bg-gradient-to-t from-blue-500 to-blue-400/60 rounded-t-md"></div>
                </div>
                <span class="text-[9px] text-zinc-600 uppercase">{item.mes}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Check-ins por dia -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-teal-400">qr_code_scanner</span>
          <h2 class="text-sm font-semibold text-white">Check-ins (7 dias)</h2>
        </div>
        <div class="p-5">
          <div class="flex items-end gap-2 h-32">
            {#each charts.checkInsPorDia as item}
              {@const maxVal = barMaxValue(charts.checkInsPorDia)}
              {@const height = maxVal > 0 ? (item.total / maxVal) * 100 : 0}
              <div class="flex-1 flex flex-col items-center gap-1">
                <span class="text-[10px] text-zinc-400 font-medium">{item.total}</span>
                <div class="w-full rounded-t-md bg-teal-500/20 relative overflow-hidden transition-all" style="height: {Math.max(height, 4)}%">
                  <div class="absolute inset-0 bg-gradient-to-t from-teal-500 to-teal-400/60 rounded-t-md"></div>
                </div>
                <span class="text-[9px] text-zinc-600 capitalize">{item.dia}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Ocupação por sala -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-purple-400">meeting_room</span>
          <h2 class="text-sm font-semibold text-white">Ocupação por Sala</h2>
        </div>
        <div class="p-5 space-y-3">
          {#if charts.ocupacaoPorSala.length === 0}
            <p class="text-zinc-500 text-xs">Nenhuma sala configurada.</p>
          {:else}
            {#each charts.ocupacaoPorSala as sala}
              {@const pct = sala.capacidade > 0 ? Math.round((sala.ocupacao / sala.capacidade) * 100) : 0}
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-white font-medium">{sala.sala}</span>
                  <span class="text-[10px] text-zinc-400">{sala.ocupacao}/{sala.capacidade} ({pct}%)</span>
                </div>
                <div class="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all {pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-purple-500'}"
                    style="width: {pct}%"
                  ></div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Alerts -->
  {#if data.alertas && data.alertas.length > 0}
    <div class="bg-zinc-900 border border-amber-500/30 rounded-xl overflow-hidden mb-8">
      <div class="p-5 border-b border-zinc-800 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-amber-400">warning</span>
        <h2 class="text-sm font-semibold text-white">Alertas — Faltas Excessivas</h2>
        <span class="ml-auto text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">{data.alertas.length} aluno(s)</span>
      </div>
      <div class="divide-y divide-zinc-800/50">
        {#each data.alertas as alerta}
          <div class="px-5 py-3 flex items-center gap-4 hover:bg-zinc-800/30 transition-colors">
            <div class="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-amber-400 text-[16px]">person_alert</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-white font-medium truncate">{alerta.nome}</p>
              <p class="text-[10px] text-zinc-500">{alerta.email} · {alerta.turma}</p>
            </div>
            <span class="text-xs text-red-400 font-medium shrink-0">{alerta.faltasConsecutivas} faltas</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Quick actions + recent students -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Quick actions -->
    <div class="space-y-3">
      <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Ações Rápidas</h2>
      <a href="/admin/alunos" class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-primary/40 transition-all flex items-center gap-4 group">
        <div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <span class="material-symbols-outlined text-emerald-400">person_add</span>
        </div>
        <div>
          <p class="text-sm font-medium text-white group-hover:text-primary transition-colors">Gerenciar Alunos</p>
          <p class="text-xs text-zinc-500">Ver lista completa</p>
        </div>
      </a>
      <a href="/admin/financeiro" class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-primary/40 transition-all flex items-center gap-4 group">
        <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <span class="material-symbols-outlined text-blue-400">account_balance</span>
        </div>
        <div>
          <p class="text-sm font-medium text-white group-hover:text-primary transition-colors">Financeiro</p>
          <p class="text-xs text-zinc-500">Relatórios e transações</p>
        </div>
      </a>
      <a href="/admin/turmas" class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-primary/40 transition-all flex items-center gap-4 group">
        <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <span class="material-symbols-outlined text-purple-400">edit_calendar</span>
        </div>
        <div>
          <p class="text-sm font-medium text-white group-hover:text-primary transition-colors">Gerenciar Turmas</p>
          <p class="text-xs text-zinc-500">Horários e inscrições</p>
        </div>
      </a>
    </div>

    <!-- Recent students -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="p-5 border-b border-zinc-800 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-white">Últimos alunos cadastrados</h2>
        <a href="/admin/alunos" class="text-xs text-primary hover:underline">Ver todos</a>
      </div>
      {#if data.ultimosAlunos && data.ultimosAlunos.length > 0}
        <div class="divide-y divide-zinc-800">
          {#each data.ultimosAlunos as aluno}
            <div class="flex items-center gap-4 px-5 py-3 hover:bg-zinc-800/50 transition-colors">
              <div class="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                <span class="material-symbols-outlined text-zinc-400 text-sm">person</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-white truncate">{aluno.nome}</p>
                <p class="text-xs text-zinc-500 truncate">{aluno.email}</p>
              </div>
              <span class="text-[10px] text-zinc-600">{new Date(aluno.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-zinc-500 text-sm p-5">Nenhum aluno cadastrado ainda.</p>
      {/if}
    </div>
  </div>
</div>
