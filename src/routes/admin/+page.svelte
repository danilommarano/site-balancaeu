<!-- BalancaEu — Dashboard Admin -->
<script lang="ts">
  import Chart from '$lib/components/Chart.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';

  let { data } = $props();

  let stats = $derived(data.stats);
  let charts = $derived(data.charts);
  let isDark = $derived(themeStore.value === 'dark');

  function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  }

  // Paleta da marca
  const CORAL = '#F08478';
  const TERRACOTA = '#A83A2E';
  const OCRE = '#D9A84A';
  const BLUE = '#5B7FCF';

  // Cores dependentes do tema
  let colors = $derived(isDark
    ? { text: '#C8B8A5', textMute: '#7A6B5E', grid: 'rgba(200, 184, 165, 0.08)', tooltipBg: '#1F1812' }
    : { text: '#4A3E35', textMute: '#9A8A78', grid: 'rgba(74, 62, 53, 0.08)', tooltipBg: '#FFFFFF' }
  );

  // Gráfico 1 — Área: Alunos Ativos (6 meses)
  let alunosOptions = $derived({
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: colors.text,
      animations: { enabled: true, easing: 'easeinout', speed: 800, animateGradually: { enabled: true, delay: 80 } },
      fontFamily: 'inherit',
      background: 'transparent'
    },
    series: [{ name: 'Alunos ativos', data: charts?.alunosPorMes?.map(p => p.total) ?? [] }],
    xaxis: {
      categories: charts?.alunosPorMes?.map(p => p.mes) ?? [],
      labels: { style: { colors: colors.textMute, fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: colors.textMute, fontSize: '11px' }, formatter: (v: number) => Math.round(v).toString() }
    },
    grid: { borderColor: colors.grid, strokeDashArray: 4 },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 100] }
    },
    colors: [CORAL],
    dataLabels: { enabled: false },
    tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: (v: number) => `${v} aluno${v === 1 ? '' : 's'}` } }
  });

  // Gráfico 2 — Barra: Receita Mensal (6 meses)
  let receitaOptions = $derived({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      foreColor: colors.text,
      animations: { enabled: true, easing: 'easeinout', speed: 800, animateGradually: { enabled: true, delay: 80 } },
      fontFamily: 'inherit',
      background: 'transparent'
    },
    series: [{ name: 'Receita', data: charts?.receitaPorMes?.map(p => Number(p.valor)) ?? [] }],
    xaxis: {
      categories: charts?.receitaPorMes?.map(p => p.mes) ?? [],
      labels: { style: { colors: colors.textMute, fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: colors.textMute, fontSize: '11px' }, formatter: (v: number) => `R$ ${Math.round(v / 1000)}k` }
    },
    grid: { borderColor: colors.grid, strokeDashArray: 4 },
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: '55%', distributed: false }
    },
    fill: {
      type: 'gradient',
      gradient: { type: 'vertical', gradientToColors: [TERRACOTA], shadeIntensity: 1, opacityFrom: 1, opacityTo: 1, stops: [0, 100] }
    },
    colors: [CORAL],
    dataLabels: { enabled: false },
    tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: formatCurrency } }
  });

  // Gráfico 3 — Barra: Check-ins (7 dias)
  let checkInsOptions = $derived({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      foreColor: colors.text,
      animations: { enabled: true, easing: 'easeinout', speed: 800, animateGradually: { enabled: true, delay: 60 } },
      fontFamily: 'inherit',
      background: 'transparent'
    },
    series: [{ name: 'Check-ins', data: charts?.checkInsPorDia?.map(p => p.total) ?? [] }],
    xaxis: {
      categories: charts?.checkInsPorDia?.map(p => p.dia) ?? [],
      labels: { style: { colors: colors.textMute, fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: colors.textMute, fontSize: '11px' }, formatter: (v: number) => Math.round(v).toString() }
    },
    grid: { borderColor: colors.grid, strokeDashArray: 4 },
    plotOptions: {
      bar: { borderRadius: 5, columnWidth: '50%' }
    },
    fill: {
      type: 'gradient',
      gradient: { type: 'vertical', gradientToColors: ['#B0832F'], shadeIntensity: 1, opacityFrom: 1, opacityTo: 1, stops: [0, 100] }
    },
    colors: [OCRE],
    dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 600, colors: [colors.text] }, offsetY: -22 },
    tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: (v: number) => `${v} check-in${v === 1 ? '' : 's'}` } }
  });
</script>

<svelte:head>
  <title>Dashboard — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Dashboard</h1>
    <p class="page-sub">Visão geral — {data.tenant?.nome ?? 'Balança Eu'}</p>
  </div>
</div>

<div class="stat-grid">
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Alunos Ativos</div>
      <div class="stat-card__icon is-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg></div>
    </div>
    <div class="stat-card__value">{stats?.alunosAtivos ?? 0}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Turmas</div>
      <div class="stat-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/></svg></div>
    </div>
    <div class="stat-card__value">{stats?.totalTurmas ?? 0}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Professores</div>
      <div class="stat-card__icon is-ocre"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5L2 10z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg></div>
    </div>
    <div class="stat-card__value">{stats?.totalProfessores ?? 0}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Check-ins Hoje</div>
      <div class="stat-card__icon is-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg></div>
    </div>
    <div class="stat-card__value">{stats?.checkInsHoje ?? 0}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Ocupação</div>
      <div class="stat-card__icon is-plum"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 010 18"/></svg></div>
    </div>
    <div class="stat-card__value">{stats?.taxaOcupacao ?? 0}%</div>
  </div>
</div>

<div class="stat-grid stat-grid--4" style="margin-top: 14px;">
  <div class="stat-card"><div class="stat-card__head"><div class="stat-card__label">Receita Total</div></div><div class="stat-card__value is-success is-sm">{formatCurrency(stats?.receitaTotal ?? 0)}</div></div>
  <div class="stat-card"><div class="stat-card__head"><div class="stat-card__label">Assinaturas Ativas</div></div><div class="stat-card__value is-sm">{stats?.assinaturasAtivas ?? 0}</div></div>
  <div class="stat-card"><div class="stat-card__head"><div class="stat-card__label">Canceladas</div></div><div class="stat-card__value is-danger is-sm">{stats?.assinaturasCanceladas ?? 0}</div></div>
  <div class="stat-card"><div class="stat-card__head"><div class="stat-card__label">Modalidades</div></div><div class="stat-card__value is-sm">{stats?.modalidades ?? 0}</div></div>
</div>

{#if charts}
  <div class="two-col">
    <div class="card">
      <div class="card__head"><div class="card__title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="coral"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>Alunos Ativos (6 meses)</div></div>
      <Chart options={alunosOptions} height={260} />
    </div>

    <div class="card">
      <div class="card__head"><div class="card__title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="blue"><rect x="3" y="12" width="4" height="8"/><rect x="10" y="8" width="4" height="12"/><rect x="17" y="4" width="4" height="16"/></svg>Receita Mensal (6 meses)</div></div>
      <Chart options={receitaOptions} height={260} />
    </div>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card__head"><div class="card__title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ocre"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h7v7h-7z"/></svg>Check-ins (7 dias)</div></div>
      <Chart options={checkInsOptions} height={260} />
    </div>

    <div class="card">
      <div class="card__head"><div class="card__title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="plum"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Ocupação por Sala</div></div>
      {#if charts.ocupacaoPorSala.length === 0}
        <div class="empty">
          <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg></div>
          <p>Nenhuma sala configurada.</p>
        </div>
      {:else}
        <div class="bar-list">
          {#each charts.ocupacaoPorSala as sala}
            {@const pct = sala.capacidade > 0 ? Math.round((sala.ocupacao / sala.capacidade) * 100) : 0}
            <div class="bar-list__row">
              <div class="bar-list__label">{sala.sala}</div>
              <div class="bar-list__track"><div class="bar-list__fill" style="--fill: {pct}%"></div></div>
              <div class="bar-list__value">{sala.ocupacao}/{sala.capacidade} ({pct}%)</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if data.alertas && data.alertas.length > 0}
  <div class="card" style="margin-top: 18px;">
    <div class="card__head">
      <div class="card__title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ocre"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Alertas — Faltas Excessivas</div>
      <span class="badge badge--pending">{data.alertas.length} aluno(s)</span>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Aluno</th><th>Turma</th><th>Faltas</th></tr></thead>
        <tbody>
          {#each data.alertas as alerta}
            <tr>
              <td><div class="name"><div class="dot">{alerta.nome[0]}</div>{alerta.nome}</div></td>
              <td class="muted">{alerta.turma}</td>
              <td><span class="badge badge--danger">{alerta.faltasConsecutivas} faltas</span></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

{#if data.ultimosAlunos && data.ultimosAlunos.length > 0}
  <div class="card" style="margin-top: 18px;">
    <div class="card__head">
      <div class="card__title">Últimos alunos cadastrados</div>
      <a href="/admin/alunos" class="btn btn--ghost btn--sm">Ver todos</a>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Aluno</th><th>Cadastro</th></tr></thead>
        <tbody>
          {#each data.ultimosAlunos as aluno}
            <tr>
              <td><div class="name"><div class="dot">{aluno.nome[0]}</div>{aluno.nome}</div></td>
              <td class="muted">{new Date(aluno.createdAt).toLocaleDateString('pt-BR')}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}
