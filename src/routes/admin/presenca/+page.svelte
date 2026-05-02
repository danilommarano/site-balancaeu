<!-- BalancaEu — Admin: Controle de Presença -->
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
  <title>Presença — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Controle de Presença</h1>
    <p class="page-sub">Visão geral da frequência dos alunos (últimos 30 dias)</p>
  </div>
</div>

<div class="stat-grid stat-grid--4">
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Presenças</div>
      <div class="stat-card__icon is-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
    </div>
    <div class="stat-card__value is-success">{data.resumo.totalPresencas}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Faltas</div>
      <div class="stat-card__icon" style="background:rgba(226,90,76,0.12); color:var(--danger);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></div>
    </div>
    <div class="stat-card__value is-danger">{data.resumo.totalFaltas}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Taxa de presença</div>
      <div class="stat-card__icon is-ocre"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 010 18"/></svg></div>
    </div>
    <div class="stat-card__value">{data.resumo.taxaPresenca}%</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Registros</div>
      <div class="stat-card__icon is-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14v16H5z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></div>
    </div>
    <div class="stat-card__value">{data.registros.length}</div>
  </div>
</div>

<div class="filters-bar" style="margin-top:18px; grid-template-columns:auto 1fr 1fr;">
  <div class="filters-bar__title">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>Filtros
    {#if filtroTurma || filtroAluno}
      <button onclick={limparFiltros} class="btn btn--ghost btn--sm" style="margin-left:auto;">Limpar</button>
    {/if}
  </div>
  <div class="field">
    <label for="f-turma">Turma</label>
    <select id="f-turma" bind:value={filtroTurma} onchange={aplicarFiltros}>
      <option value="">Todas</option>
      {#each data.turmas as turma}
        <option value={turma.id}>{turma.label}</option>
      {/each}
    </select>
  </div>
  <div class="field">
    <label for="f-aluno">Aluno</label>
    <select id="f-aluno" bind:value={filtroAluno} onchange={aplicarFiltros}>
      <option value="">Todos</option>
      {#each data.alunosList as aluno}
        <option value={aluno.id}>{aluno.nome}</option>
      {/each}
    </select>
  </div>
</div>

<div class="two-col" style="margin-top:0;">
  <div class="card">
    <div class="card__head">
      <div class="card__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:var(--warning);"><path d="M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>
        Alunos com Faltas
      </div>
    </div>
    {#if data.alunosComFaltas.length === 0}
      <div class="empty" style="background:transparent; border:0; padding:30px 20px;">
        <p style="font-family:var(--sans); font-style:normal; font-size:13px;">Nenhum registro de faltas.</p>
      </div>
    {:else}
      <div class="bar-list">
        {#each data.alunosComFaltas as aluno}
          <div class="bar-list__row">
            <div class="bar-list__label">{aluno.nome}</div>
            <div class="bar-list__track"><div class="bar-list__fill" style="--fill: {aluno.taxa}%"></div></div>
            <div class="bar-list__value">{aluno.faltas} falta(s) / {aluno.total} aulas</div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  <div class="card">
    <div class="card__head">
      <div class="card__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="coral"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
        Registros de Presença
      </div>
    </div>
    {#if data.registros.length === 0}
      <div class="empty" style="background:transparent; border:0; padding:40px 20px;">
        <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14v16H5z"/><path d="M9 8h6M9 12h6"/></svg></div>
        <p>Nenhum registro de presença encontrado.</p>
      </div>
    {:else}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Data</th><th>Aluno</th><th>Turma</th><th>Status</th></tr></thead>
          <tbody>
            {#each data.registros as r}
              <tr>
                <td class="muted">{formatDate(r.data)}</td>
                <td>{r.aluno}</td>
                <td>
                  {r.turma}
                  <div class="muted" style="font-size:11px;">{diasLabels[r.dia]} {r.horario}</div>
                </td>
                <td>
                  {#if r.presente}
                    <span class="badge badge--active">Presente</span>
                  {:else}
                    <span class="badge badge--danger">Ausente</span>
                  {/if}
                  {#if r.observacao}
                    <div class="muted" style="font-size:11px; margin-top:2px;">{r.observacao}</div>
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
