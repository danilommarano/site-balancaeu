<!-- BalancaEu — Professor: Chamada -->
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
      p[a.id] = a.presente ?? true;
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
  <title>Chamada — Professor · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Chamada</h1>
    <p class="page-sub">Registre a presença dos alunos nas suas turmas</p>
  </div>
</div>

{#if form?.success}
  <div class="alert alert--success">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>
    {form.message}
  </div>
{/if}
{#if form?.error}
  <div class="alert">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
    {form.error}
  </div>
{/if}

<div class="weekday-nav">
  <button class="weekday-nav__btn" onclick={() => navegarData(-1)} aria-label="Dia anterior">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><path d="M15 18l-6-6 6-6"/></svg>
  </button>
  <div class="weekday-nav__center">
    <div class="weekday-nav__day">{diasLabels[data.diaStr] ?? data.diaStr}</div>
    <div class="weekday-nav__date">{formatDateBr(data.dataSelecionada)}</div>
  </div>
  <button class="weekday-nav__btn" onclick={() => navegarData(1)} aria-label="Próximo dia">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><path d="M9 18l6-6-6-6"/></svg>
  </button>
</div>

{#if data.turmasDoDia.length === 0}
  <div class="card" style="margin-top:18px;">
    <div class="empty">
      <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></div>
      <p>Sem aulas neste dia. Você não tem turmas programadas para {(diasLabels[data.diaStr] ?? '').toLowerCase()}.</p>
    </div>
  </div>
{:else}
  <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
    {#each data.turmasDoDia as turma}
      {@const isSelected = data.turmaId === turma.id}
      <button
        type="button"
        onclick={() => selecionarTurma(turma.id)}
        class="turma-row {isSelected ? 'is-selected' : ''}"
        style="text-align:left; cursor:pointer; font: inherit; color: inherit; width: 100%;"
      >
        <div>
          <div class="turma-row__name">{turma.modalidade}</div>
          <div class="turma-row__meta"><strong>{turma.nivel}</strong> · {turma.horarioInicio} — {turma.horarioFim} · Sala {turma.sala}</div>
        </div>
        <div class="turma-row__count">{turma.totalAlunos} aluno{turma.totalAlunos !== 1 ? 's' : ''}</div>
      </button>
    {/each}
  </div>

  {#if data.turmaId && data.alunos.length > 0}
    <div class="two-col" style="grid-template-columns: 2fr 1fr; margin-top:18px;">
      <form method="POST" action="?/salvar" use:enhance>
        <input type="hidden" name="turmaId" value={data.turmaId} />
        <input type="hidden" name="data" value={data.dataSelecionada} />

        <div class="card">
          <div class="card__head">
            <div class="card__title blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              Lista de Presença
              {#if chamadaJaFeita}
                <span class="tag" style="margin-left:8px;">Chamada feita</span>
              {/if}
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn--ghost btn--sm" onclick={() => marcarTodos(true)}>Todos presentes</button>
              <button type="button" class="btn btn--ghost btn--sm" onclick={() => marcarTodos(false)}>Todos ausentes</button>
            </div>
          </div>

          <div style="display:flex; flex-direction:column;">
            {#each data.alunos as aluno}
              <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--line);">
                <input type="hidden" name="alunoId" value={aluno.id} />
                {#if presencaState[aluno.id]}
                  <input type="hidden" name="presente" value={aluno.id} />
                {/if}
                <button
                  type="button"
                  onclick={() => togglePresenca(aluno.id)}
                  style="width:36px; height:36px; border-radius:50%; border:0; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; background: {presencaState[aluno.id] ? 'rgba(91,168,107,0.18)' : 'rgba(240,132,120,0.18)'}; color: {presencaState[aluno.id] ? 'var(--success)' : 'var(--coral)'};"
                  aria-label={presencaState[aluno.id] ? 'Marcar como ausente' : 'Marcar como presente'}
                >
                  {#if presencaState[aluno.id]}
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                  {:else}
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                  {/if}
                </button>
                <div style="flex:1; min-width:0;">
                  <div style="font-size:13.5px; font-weight:600; color:var(--text);">{aluno.nome}</div>
                  <div style="font-size:11px; color:var(--text-mute);">{aluno.email}</div>
                </div>
                <span style="font-size:11px; color: {presencaState[aluno.id] ? 'var(--success)' : 'var(--coral)'};">
                  {presencaState[aluno.id] ? 'Presente' : 'Ausente'}
                </span>
              </div>
            {/each}
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:14px;">
            <div style="display:flex; gap:14px; font-size:12px;">
              <span style="color:var(--success);">{totalPresentes} presente{totalPresentes !== 1 ? 's' : ''}</span>
              <span style="color:var(--coral);">{totalAusentes} ausente{totalAusentes !== 1 ? 's' : ''}</span>
              <span style="color:var(--text-mute);">{data.alunos.length} total</span>
            </div>
            <button type="submit" class="btn btn--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
              Salvar Chamada
            </button>
          </div>
        </div>
      </form>

      <div class="card">
        <div class="card__head">
          <div class="card__title plum">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            Histórico
          </div>
        </div>
        {#if data.historico.length === 0}
          <div class="empty">
            <p>Nenhum histórico de chamada.</p>
          </div>
        {:else}
          {#each data.historico as h}
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line);">
              <div>
                <div style="font-size:12.5px; color:var(--text);">{formatDateShort(h.data)}</div>
                <div style="font-size:11px; color:var(--text-mute);">{h.total} aluno{h.total !== 1 ? 's' : ''}</div>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:11px; color:var(--success);">{h.presentes}P</span>
                <span style="font-size:11px; color:var(--coral);">{h.ausentes}F</span>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {:else if data.turmaId && data.alunos.length === 0}
    <div class="card" style="margin-top:18px;">
      <div class="empty">
        <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg></div>
        <p>Nenhum aluno inscrito nesta turma.</p>
      </div>
    </div>
  {:else}
    <div class="card" style="margin-top:18px;">
      <div class="empty">
        <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg></div>
        <p>Selecione uma turma acima para fazer a chamada.</p>
      </div>
    </div>
  {/if}
{/if}
