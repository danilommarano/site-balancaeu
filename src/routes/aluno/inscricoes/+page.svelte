<!-- BalancaEu — Minhas Turmas (calendário semanal) -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  type TurmaDisp = typeof data.turmasDisponiveis[number];
  type InscricaoItem = typeof data.inscricoes[number];

  let filtro = $state<'minhas' | 'todas'>('todas');
  let activeDay = $state('SEG');

  const dayKeys = [
    { key: 'SEG', label: 'Seg' },
    { key: 'TER', label: 'Ter' },
    { key: 'QUA', label: 'Qua' },
    { key: 'QUI', label: 'Qui' },
    { key: 'SEX', label: 'Sex' },
    { key: 'SAB', label: 'Sáb' }
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

  const turmasVisiveis = $derived.by(() => {
    if (filtro === 'todas') return data.turmasDisponiveis;
    return data.turmasDisponiveis.filter(t => minhaInscricaoPorTurma.has(t.id));
  });

  const turmasDoDia = $derived(
    turmasVisiveis.filter(t => t.diaSemana === activeDay)
  );

  $effect(() => {
    const dias = new Set<string>(turmasVisiveis.map(t => t.diaSemana));
    if (dias.size > 0 && !dias.has(activeDay)) {
      activeDay = [...dias][0];
    }
  });

  // Grade: linhas = horários, colunas = salas
  const gradeSemanal = $derived.by(() => {
    const slotMap = new Map<string, Record<string, TurmaDisp | null>>();
    for (const t of turmasDoDia) {
      const key = `${t.horarioInicio}\n${t.horarioFim}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, { 'Sala 1': null, 'Sala 2': null, 'Sala 3': null });
      }
      slotMap.get(key)![t.sala] = t;
    }
    return Array.from(slotMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  });
</script>

<svelte:head>
  <title>Minhas Turmas — Balança Eu</title>
</svelte:head>

<div class="page-head" style="display:flex; align-items:flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
  <div>
    <h1 class="page-title">Minhas <em>Turmas</em></h1>
    <p class="page-sub">Navegue pela grade semanal e gerencie suas inscrições.</p>
  </div>
  {#if !data.temPlano}
    <div class="alert--inline">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z"/></svg>
      Você precisa de um plano ativo para se inscrever
    </div>
  {:else}
    <div class="alert--inline" style="background: var(--creme-warm); color: var(--ink-soft); border-color: var(--line);">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
      <strong>{data.inscricoesAtivas}</strong>/{data.maxAulasSemana} aulas ativas
    </div>
  {/if}
</div>

{#if form?.error}
  <div class="alert" style="margin-bottom: 16px;">
    <div class="alert__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
    </div>
    <div class="alert__body">
      <strong>Erro</strong>
      <p>{form.error}</p>
    </div>
  </div>
{/if}
{#if form?.success}
  <div class="alert" style="margin-bottom: 16px;">
    <div class="alert__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
    </div>
    <div class="alert__body">
      <strong>Pronto!</strong>
      <p>{form.message ?? 'Operação realizada.'}</p>
    </div>
  </div>
{/if}

<div style="display:flex; gap:10px; align-items:center; justify-content: space-between; margin-bottom: 6px;">
  <div class="tabs">
    <button type="button" class="tab {filtro === 'todas' ? 'is-active' : ''}" onclick={() => filtro = 'todas'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      Todas as turmas
    </button>
    <button type="button" class="tab {filtro === 'minhas' ? 'is-active' : ''}" onclick={() => filtro = 'minhas'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      Apenas minhas
      <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background: currentColor; margin-left:4px; opacity:0.5;"></span>
    </button>
  </div>
</div>

<div class="day-row">
  {#each dayKeys as day}
    {@const hasClasses = turmasVisiveis.some(t => t.diaSemana === day.key)}
    <button
      type="button"
      class="day-pill {activeDay === day.key ? 'is-active' : ''} {hasClasses ? '' : 'is-disabled'}"
      onclick={() => { if (hasClasses) activeDay = day.key; }}
    >{day.label}</button>
  {/each}
</div>

{#if filtro === 'minhas' && minhaInscricaoPorTurma.size === 0}
  <div class="empty-state" style="margin-top:32px;">
    <div class="empty-state__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/></svg>
    </div>
    <p>Você ainda não está inscrito em turmas.</p>
    <button type="button" onclick={() => filtro = 'todas'} style="background: none; border: none; cursor: pointer; color: var(--terracota); font-weight: 600;">Ver todas as turmas disponíveis →</button>
  </div>
{:else if gradeSemanal.length === 0}
  <div class="empty-state" style="margin-top:32px;">
    <div class="empty-state__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
    </div>
    <p>Nenhuma turma cadastrada para este dia.</p>
  </div>
{:else}
  <div class="grade-table-student">
    <div class="grade-header">
      <div></div>
      {#each SALAS as sala}
        <div class="sala-label">{sala}</div>
      {/each}
    </div>

    {#each gradeSemanal as [horario, porSala] (horario)}
      {@const [hi, hf] = horario.split('\n')}
      <div class="grade-row">
        <div class="grade-time-cell">{hi}<br>{hf}</div>
        {#each SALAS as sala}
          {@const turma = porSala[sala]}
          {#if turma}
            {@const inscricao = minhaInscricaoPorTurma.get(turma.id)}
            {@const isEnrolled = !!inscricao}
            {@const isWaitlist = inscricao?.status === 'LISTA_ESPERA'}
            {@const isFull = turma.inscritos >= turma.maxAlunos}
            {@const fillPct = Math.min(100, Math.round((turma.inscritos / turma.maxAlunos) * 100))}
            <div class="grade-slot is-filled {isEnrolled ? 'is-enrolled' : ''}">
              <div>
                <div class="grade-slot__title">{turma.modalidade}</div>
                <div class="grade-slot__level">{turma.nivel}</div>
                <div class="grade-slot__prof">Prof. {turma.professor}</div>
              </div>
              <div class="grade-slot__foot">
                <div class="grade-slot__bar" style="--fill: {fillPct}%;"></div>
                <div class="grade-slot__cap">{turma.inscritos}/{turma.maxAlunos}</div>
              </div>
              <div style="margin-top: 10px;">
                {#if isEnrolled}
                  {#if isWaitlist}
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--warning); margin-bottom: 6px;">Lista de espera</div>
                  {/if}
                  <form method="POST" action="?/cancelar" use:enhance>
                    <input type="hidden" name="enrollmentId" value={inscricao!.id} />
                    <button type="submit" class="btn btn--ghost btn--full btn--sm" style="border-color: var(--danger); color: var(--danger);">
                      Cancelar
                    </button>
                  </form>
                {:else if data.temPlano}
                  <form method="POST" action="?/inscrever" use:enhance>
                    <input type="hidden" name="classGroupId" value={turma.id} />
                    <button type="submit" class="btn btn--coral btn--full btn--sm">
                      {isFull ? 'Lista de espera' : 'Inscrever-se'}
                    </button>
                  </form>
                {:else}
                  <div style="text-align: center; font-size: 10px; color: var(--ink-mute); padding: 6px 0;">Plano necessário</div>
                {/if}
              </div>
            </div>
          {:else}
            <div class="grade-slot"><span>—</span></div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>
{/if}
