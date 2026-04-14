<!-- BalancaEu — Admin: Financeiro (Fase 14) -->
<script lang="ts">
  import { goto } from '$app/navigation';

  let { data } = $props();

  let filtroPerido = $state(data.filtros.periodo);
  let filtroTipo = $state(data.filtros.tipo);
  let filtroStatus = $state(data.filtros.status);

  const tipoLabels: Record<string, string> = {
    MENSALIDADE: 'Mensalidade',
    PARTICULAR: 'Particular',
    EVENTO: 'Evento',
    OUTRO: 'Outro'
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    PAGO: { label: 'Pago', color: 'text-emerald-400 bg-emerald-400/10' },
    PENDENTE: { label: 'Pendente', color: 'text-amber-400 bg-amber-400/10' },
    CANCELADO: { label: 'Cancelado', color: 'text-red-400 bg-red-400/10' }
  };

  function aplicarFiltros() {
    const params = new URLSearchParams();
    if (filtroPerido) params.set('periodo', filtroPerido);
    if (filtroTipo) params.set('tipo', filtroTipo);
    if (filtroStatus) params.set('status', filtroStatus);
    const qs = params.toString();
    goto(`/admin/financeiro${qs ? '?' + qs : ''}`, { invalidateAll: true });
  }

  function limparFiltros() {
    filtroPerido = '';
    filtroTipo = '';
    filtroStatus = '';
    goto('/admin/financeiro', { invalidateAll: true });
  }

  function exportarCsv() {
    const params = new URLSearchParams();
    if (filtroPerido) params.set('periodo', filtroPerido);
    if (filtroTipo) params.set('tipo', filtroTipo);
    if (filtroStatus) params.set('status', filtroStatus);
    params.set('export', 'csv');
    // Trigger download via fetch
    fetch(`/admin/financeiro?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.csvData) {
          const blob = new Blob([d.csvData], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `financeiro-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatDate(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function revenueMax(items: { valor: number }[]): number {
    return Math.max(...items.map(i => i.valor), 1);
  }
</script>

<svelte:head>
  <title>Financeiro — Admin — BalancaEu</title>
</svelte:head>

<div>
  <div class="flex items-start justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Financeiro</h1>
      <p class="text-zinc-500 text-sm">Relatório de transações e receitas</p>
    </div>
    <button
      onclick={exportarCsv}
      class="flex items-center gap-2 bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
    >
      <span class="material-symbols-outlined text-[16px]">download</span>
      Exportar CSV
    </button>
  </div>

  <!-- Summary cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Receita Paga</span>
      <p class="text-2xl font-bold text-emerald-400 mt-2">{formatCurrency(data.resumo.totalPago)}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Pendente</span>
      <p class="text-2xl font-bold text-amber-400 mt-2">{formatCurrency(data.resumo.totalPendente)}</p>
    </div>
    {#each Object.entries(data.resumo.porTipo) as [tipo, valor]}
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <span class="text-[10px] text-zinc-500 uppercase tracking-wider">{tipoLabels[tipo] ?? tipo}</span>
        <p class="text-lg font-bold text-white mt-2">{formatCurrency(valor as number)}</p>
      </div>
    {/each}
  </div>

  <!-- Revenue chart -->
  {#if data.receitaPorMes && data.receitaPorMes.length > 0}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
      <div class="p-5 border-b border-zinc-800 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-blue-400">bar_chart</span>
        <h2 class="text-sm font-semibold text-white">Receita por Mês</h2>
      </div>
      <div class="p-5">
        <div class="flex items-end gap-3 h-36">
          {#each data.receitaPorMes as item}
            {@const maxVal = revenueMax(data.receitaPorMes)}
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
  {/if}

  <!-- Filters -->
  <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
    <div class="flex items-center gap-2 mb-3">
      <span class="material-symbols-outlined text-[18px] text-zinc-400">filter_list</span>
      <span class="text-xs font-medium text-zinc-400">Filtros</span>
      {#if filtroPerido || filtroTipo || filtroStatus}
        <button onclick={limparFiltros} class="ml-auto text-[11px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">close</span>
          Limpar
        </button>
      {/if}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label for="f-periodo" class="block text-[10px] text-zinc-500 mb-1">Período</label>
        <select id="f-periodo" bind:value={filtroPerido} onchange={aplicarFiltros}
          class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
          <option value="">Todo período</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
          <option value="12m">Último ano</option>
        </select>
      </div>
      <div>
        <label for="f-tipo" class="block text-[10px] text-zinc-500 mb-1">Tipo</label>
        <select id="f-tipo" bind:value={filtroTipo} onchange={aplicarFiltros}
          class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
          <option value="">Todos</option>
          <option value="MENSALIDADE">Mensalidade</option>
          <option value="PARTICULAR">Particular</option>
          <option value="EVENTO">Evento</option>
          <option value="OUTRO">Outro</option>
        </select>
      </div>
      <div>
        <label for="f-status" class="block text-[10px] text-zinc-500 mb-1">Status</label>
        <select id="f-status" bind:value={filtroStatus} onchange={aplicarFiltros}
          class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
          <option value="">Todos</option>
          <option value="PAGO">Pago</option>
          <option value="PENDENTE">Pendente</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Transactions table -->
  <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
    <div class="p-5 border-b border-zinc-800 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-blue-400">receipt_long</span>
        Transações
      </h2>
      <span class="text-[10px] text-zinc-500">{data.transacoes.length} registro(s)</span>
    </div>
    {#if data.transacoes.length === 0}
      <div class="p-12 text-center">
        <span class="material-symbols-outlined text-5xl text-zinc-700 mb-3">receipt_long</span>
        <h3 class="text-lg font-semibold text-white mb-1">Nenhuma transação</h3>
        <p class="text-zinc-500 text-sm">Não há transações para os filtros selecionados.</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-[11px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
              <th class="px-5 py-3">Data</th>
              <th class="px-5 py-3">Aluno</th>
              <th class="px-5 py-3">Tipo</th>
              <th class="px-5 py-3">Descrição</th>
              <th class="px-5 py-3 text-right">Valor</th>
              <th class="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/50">
            {#each data.transacoes as t}
              {@const st = statusLabels[t.status] ?? statusLabels.PENDENTE}
              <tr class="hover:bg-zinc-800/30 transition-colors">
                <td class="px-5 py-3 text-xs text-zinc-400 whitespace-nowrap">{formatDate(t.data)}</td>
                <td class="px-5 py-3">
                  <p class="text-xs text-white">{t.aluno}</p>
                  <p class="text-[10px] text-zinc-600">{t.email}</p>
                </td>
                <td class="px-5 py-3 text-xs text-zinc-400">{tipoLabels[t.tipo] ?? t.tipo}</td>
                <td class="px-5 py-3 text-xs text-zinc-400 max-w-[200px] truncate">{t.descricao}</td>
                <td class="px-5 py-3 text-xs text-white font-medium text-right whitespace-nowrap">{formatCurrency(t.valor)}</td>
                <td class="px-5 py-3">
                  <span class="text-[10px] font-medium px-2 py-0.5 rounded-full {st.color}">{st.label}</span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
