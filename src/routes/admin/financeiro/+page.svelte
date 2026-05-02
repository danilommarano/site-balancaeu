<!-- BalancaEu — Admin: Financeiro -->
<script lang="ts">
  import { goto } from '$app/navigation';

  let { data } = $props();

  let filtroPeriodo = $state(data.filtros.periodo);
  let filtroTipo = $state(data.filtros.tipo);
  let filtroStatus = $state(data.filtros.status);

  const tipoLabels: Record<string, string> = {
    MENSALIDADE: 'Mensalidade',
    PARTICULAR: 'Particular',
    EVENTO: 'Evento',
    OUTRO: 'Outro'
  };

  function aplicarFiltros() {
    const params = new URLSearchParams();
    if (filtroPeriodo) params.set('periodo', filtroPeriodo);
    if (filtroTipo) params.set('tipo', filtroTipo);
    if (filtroStatus) params.set('status', filtroStatus);
    const qs = params.toString();
    goto(`/admin/financeiro${qs ? '?' + qs : ''}`, { invalidateAll: true });
  }

  function limparFiltros() {
    filtroPeriodo = '';
    filtroTipo = '';
    filtroStatus = '';
    goto('/admin/financeiro', { invalidateAll: true });
  }

  function exportarCsv() {
    const params = new URLSearchParams();
    if (filtroPeriodo) params.set('periodo', filtroPeriodo);
    if (filtroTipo) params.set('tipo', filtroTipo);
    if (filtroStatus) params.set('status', filtroStatus);
    params.set('export', 'csv');
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
  <title>Financeiro — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Financeiro</h1>
    <p class="page-sub">Relatório de transações e receitas</p>
  </div>
  <button class="btn btn--ghost" onclick={exportarCsv}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
    Exportar CSV
  </button>
</div>

<div class="stat-grid stat-grid--2">
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Receita Paga</div>
      <div class="stat-card__icon is-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
    </div>
    <div class="stat-card__value is-success">{formatCurrency(data.resumo.totalPago)}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Pendente</div>
      <div class="stat-card__icon is-ocre"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div>
    </div>
    <div class="stat-card__value is-warning">{formatCurrency(data.resumo.totalPendente)}</div>
  </div>
</div>

{#if Object.keys(data.resumo.porTipo).length > 0}
  <div class="stat-grid stat-grid--4" style="margin-top: 14px;">
    {#each Object.entries(data.resumo.porTipo) as [tipo, valor]}
      <div class="stat-card">
        <div class="stat-card__head"><div class="stat-card__label">{tipoLabels[tipo] ?? tipo}</div></div>
        <div class="stat-card__value is-sm">{formatCurrency(valor as number)}</div>
      </div>
    {/each}
  </div>
{/if}

{#if data.receitaPorMes && data.receitaPorMes.length > 0}
  <div class="card" style="margin-top: 18px;">
    <div class="card__head">
      <div class="card__title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="coral"><rect x="3" y="12" width="4" height="8"/><rect x="10" y="8" width="4" height="12"/><rect x="17" y="4" width="4" height="16"/></svg>Receita por Mês</div>
    </div>
    <div class="chart">
      {#each data.receitaPorMes as item}
        {@const maxVal = revenueMax(data.receitaPorMes)}
        {@const height = maxVal > 0 ? (item.valor / maxVal) * 100 : 0}
        <div class="chart__bar">
          <div class="chart__bar-value">{formatCurrency(item.valor)}</div>
          <div class="chart__bar-fill" style="height: {Math.max(height, 2)}%"></div>
          <div class="chart__bar-label">{item.mes}</div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<div class="filters-bar" style="margin-top:18px;">
  <div class="filters-bar__title">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>Filtros
    {#if filtroPeriodo || filtroTipo || filtroStatus}
      <button onclick={limparFiltros} class="btn btn--ghost btn--sm" style="margin-left:auto;">Limpar</button>
    {/if}
  </div>
  <div class="field">
    <label for="f-periodo">Período</label>
    <select id="f-periodo" bind:value={filtroPeriodo} onchange={aplicarFiltros}>
      <option value="">Todo período</option>
      <option value="7d">Últimos 7 dias</option>
      <option value="30d">Últimos 30 dias</option>
      <option value="90d">Últimos 90 dias</option>
      <option value="12m">Último ano</option>
    </select>
  </div>
  <div class="field">
    <label for="f-tipo">Tipo</label>
    <select id="f-tipo" bind:value={filtroTipo} onchange={aplicarFiltros}>
      <option value="">Todos</option>
      <option value="MENSALIDADE">Mensalidade</option>
      <option value="PARTICULAR">Particular</option>
      <option value="EVENTO">Evento</option>
      <option value="OUTRO">Outro</option>
    </select>
  </div>
  <div class="field">
    <label for="f-status">Status</label>
    <select id="f-status" bind:value={filtroStatus} onchange={aplicarFiltros}>
      <option value="">Todos</option>
      <option value="PAGO">Pago</option>
      <option value="PENDENTE">Pendente</option>
      <option value="CANCELADO">Cancelado</option>
    </select>
  </div>
</div>

<div class="card">
  <div class="card__head">
    <div class="card__title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="blue"><path d="M5 4h11l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M8 12h8M8 16h6"/></svg>
      Transações
    </div>
    <div style="font-size:11px; color:var(--text-mute);">{data.transacoes.length} registro(s)</div>
  </div>
  {#if data.transacoes.length === 0}
    <div class="empty">
      <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14v16H5z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></div>
      <p>Não há transações para os filtros selecionados.</p>
    </div>
  {:else}
    <table class="table" style="border:0;">
      <thead><tr><th>Data</th><th>Aluno</th><th>Tipo</th><th>Descrição</th><th>Valor</th><th>Status</th></tr></thead>
      <tbody>
        {#each data.transacoes as t}
          <tr>
            <td>{formatDate(t.data)}</td>
            <td>
              <div class="name">
                <div class="dot">{t.aluno[0]}</div>
                <div>{t.aluno}<div style="font-size:11px; color:var(--text-mute); font-weight:400;">{t.email}</div></div>
              </div>
            </td>
            <td>{tipoLabels[t.tipo] ?? t.tipo}</td>
            <td class="muted">{t.descricao}</td>
            <td>{formatCurrency(t.valor)}</td>
            <td>
              {#if t.status === 'PAGO'}
                <span class="badge badge--active">Pago</span>
              {:else if t.status === 'PENDENTE'}
                <span class="badge badge--pending">Pendente</span>
              {:else}
                <span class="badge badge--danger">Cancelado</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
