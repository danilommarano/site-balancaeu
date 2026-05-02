<!-- BalancaEu — Admin: Turmas (Calendário Semanal + Lista) -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let view = $state<'calendar' | 'list'>('calendar');
  let showCreateForm = $state(false);
  let editingId = $state<string | null>(null);
  let editModalityId = $state('');
  let editProfessorId = $state('');
  let editNivel = $state('');
  let editDiaSemana = $state('');
  let editHorarioInicio = $state('');
  let editHorarioFim = $state('');
  let editSala = $state('');
  let editMaxAlunos = $state('');
  let editAtivo = $state(true);

  const dias: { key: string; label: string; short: string }[] = [
    { key: 'SEG', label: 'Segunda', short: 'Seg' },
    { key: 'TER', label: 'Terça', short: 'Ter' },
    { key: 'QUA', label: 'Quarta', short: 'Qua' },
    { key: 'QUI', label: 'Quinta', short: 'Qui' },
    { key: 'SEX', label: 'Sexta', short: 'Sex' },
    { key: 'SAB', label: 'Sábado', short: 'Sáb' },
    { key: 'DOM', label: 'Domingo', short: 'Dom' }
  ];
  const diasLabels = Object.fromEntries(dias.map(d => [d.key, d.label]));

  type Turma = typeof data.turmas[number];

  // Agrupa turmas por dia da semana, ordenadas por horário
  const turmasPorDia = $derived.by(() => {
    const map: Record<string, Turma[]> = {};
    for (const dia of dias) map[dia.key] = [];
    for (const t of data.turmas) {
      if (map[t.diaSemana]) map[t.diaSemana].push(t);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
    }
    return map;
  });

  function startEdit(t: Turma) {
    editingId = t.id;
    editModalityId = t.modalityId;
    editProfessorId = t.professorId;
    editNivel = t.nivel;
    editDiaSemana = t.diaSemana;
    editHorarioInicio = t.horarioInicio;
    editHorarioFim = t.horarioFim;
    editSala = t.sala;
    editMaxAlunos = String(t.maxAlunos);
    editAtivo = t.ativo;
    showCreateForm = false;
  }

  function cancelEdit() { editingId = null; }

  // Cor por modalidade — hash simples baseado no id
  function modColor(id: string): string {
    const palette = ['var(--coral)', 'var(--ocre)', 'var(--plum)', 'var(--blue)', 'var(--success)', 'var(--terracota)'];
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
  }
</script>

<svelte:head>
  <title>Turmas — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Turmas</h1>
    <p class="page-sub">{data.turmas.length} turma(s) cadastrada(s)</p>
  </div>
  <div style="display:flex; gap:10px; align-items:center;">
    <div class="tabs">
      <button class="tab {view === 'calendar' ? 'is-active' : ''}" onclick={() => view = 'calendar'}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
        Calendário
      </button>
      <button class="tab {view === 'list' ? 'is-active' : ''}" onclick={() => view = 'list'}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        Lista
      </button>
    </div>
    <button class="btn btn--primary" onclick={() => { showCreateForm = !showCreateForm; editingId = null; }}>
      {#if showCreateForm}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>Cancelar
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>Nova Turma
      {/if}
    </button>
  </div>
</div>

{#if form?.error}
  <div class="card" style="border-color: var(--danger); margin-bottom: 16px;">
    <p style="color: var(--danger); font-size: 13px;">{form.error}</p>
  </div>
{/if}
{#if form?.success}
  <div class="card" style="border-color: var(--success); margin-bottom: 16px;">
    <p style="color: var(--success); font-size: 13px;">Operação realizada com sucesso!</p>
  </div>
{/if}

{#if showCreateForm}
  <div class="form-card" style="margin-bottom: 18px;">
    <h3>Nova Turma</h3>
    <form method="POST" action="?/create" use:enhance={() => async ({ update }) => { await update(); showCreateForm = false; }}>
      <div class="form-grid">
        <div class="field"><label for="c-mod">Modalidade</label>
          <select id="c-mod" name="modalityId" required>
            <option value="">Selecione...</option>
            {#each data.modalidades as m}<option value={m.id}>{m.nome}</option>{/each}
          </select>
        </div>
        <div class="field"><label for="c-prof">Professor</label>
          <select id="c-prof" name="professorId" required>
            <option value="">Selecione...</option>
            {#each data.professores as p}<option value={p.id}>{p.nome}</option>{/each}
          </select>
        </div>
        <div class="field"><label for="c-nivel">Nível</label>
          <input id="c-nivel" name="nivel" type="text" required placeholder="Iniciante" />
        </div>
        <div class="field"><label for="c-dia">Dia da Semana</label>
          <select id="c-dia" name="diaSemana" required>
            {#each dias as d}<option value={d.key}>{d.label}</option>{/each}
          </select>
        </div>
        <div class="field"><label for="c-inicio">Início</label>
          <input id="c-inicio" name="horarioInicio" type="time" required />
        </div>
        <div class="field"><label for="c-fim">Fim</label>
          <input id="c-fim" name="horarioFim" type="time" required />
        </div>
        <div class="field"><label for="c-sala">Sala</label>
          <input id="c-sala" name="sala" type="text" required placeholder="Sala 1" />
        </div>
        <div class="field"><label for="c-max">Máx. Alunos</label>
          <input id="c-max" name="maxAlunos" type="number" required min="1" value="20" />
        </div>
      </div>
      <div style="margin-top: 16px;">
        <button type="submit" class="btn btn--primary">Criar Turma</button>
      </div>
    </form>
  </div>
{/if}

{#if editingId}
  {@const turma = data.turmas.find(t => t.id === editingId)}
  {#if turma}
    <div class="form-card" style="margin-bottom: 18px;">
      <h3>Editar turma — {turma.modality.nome} ({diasLabels[turma.diaSemana]})</h3>
      <form method="POST" action="?/update" use:enhance={() => async ({ update }) => { await update(); editingId = null; }}>
        <input type="hidden" name="id" value={editingId} />
        <input type="hidden" name="ativo" value={editAtivo.toString()} />
        <div class="form-grid">
          <div class="field"><label for="et-mod">Modalidade</label>
            <select id="et-mod" name="modalityId" required bind:value={editModalityId}>
              {#each data.modalidades as m}<option value={m.id}>{m.nome}</option>{/each}
            </select>
          </div>
          <div class="field"><label for="et-prof">Professor</label>
            <select id="et-prof" name="professorId" required bind:value={editProfessorId}>
              {#each data.professores as p}<option value={p.id}>{p.nome}</option>{/each}
            </select>
          </div>
          <div class="field"><label for="et-nivel">Nível</label>
            <input id="et-nivel" name="nivel" type="text" required bind:value={editNivel} />
          </div>
          <div class="field"><label for="et-dia">Dia</label>
            <select id="et-dia" name="diaSemana" required bind:value={editDiaSemana}>
              {#each dias as d}<option value={d.key}>{d.label}</option>{/each}
            </select>
          </div>
          <div class="field"><label for="et-inicio">Início</label>
            <input id="et-inicio" name="horarioInicio" type="time" required bind:value={editHorarioInicio} />
          </div>
          <div class="field"><label for="et-fim">Fim</label>
            <input id="et-fim" name="horarioFim" type="time" required bind:value={editHorarioFim} />
          </div>
          <div class="field"><label for="et-sala">Sala</label>
            <input id="et-sala" name="sala" type="text" required bind:value={editSala} />
          </div>
          <div class="field"><label for="et-max">Máx. Alunos</label>
            <input id="et-max" name="maxAlunos" type="number" required min="1" bind:value={editMaxAlunos} />
          </div>
          <div class="field" style="display:flex; align-items:center; gap:8px; padding-top:18px;">
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer; margin:0;">
              <input type="checkbox" bind:checked={editAtivo} /> Ativa
            </label>
          </div>
        </div>
        <div style="margin-top:12px; display:flex; gap:8px; justify-content:space-between;">
          <div style="display:flex; gap:8px;">
            <button type="submit" class="btn btn--primary btn--sm">Salvar</button>
            <button type="button" class="btn btn--ghost btn--sm" onclick={cancelEdit}>Cancelar</button>
          </div>
          <button
            type="submit"
            formaction="?/delete"
            formnovalidate
            class="btn btn--danger-ghost btn--sm"
            onclick={(e) => { if (!confirm('Excluir esta turma?')) e.preventDefault(); }}
          >
            Excluir
          </button>
        </div>
      </form>
    </div>
  {/if}
{/if}

{#if data.turmas.length === 0}
  <div class="empty">
    <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/></svg></div>
    <p>Nenhuma turma cadastrada.</p>
  </div>
{:else if view === 'calendar'}
  <div class="turmas-week">
    {#each dias as dia}
      <div class="week-col {turmasPorDia[dia.key].length === 0 ? 'is-empty' : ''}">
        <div class="week-col__head">
          <span class="week-col__day">{dia.short}</span>
          <span class="week-col__count">{turmasPorDia[dia.key].length}</span>
        </div>
        <div class="week-col__body">
          {#each turmasPorDia[dia.key] as t}
            <button class="cls-card" onclick={() => startEdit(t)} style="--mod-color: {modColor(t.modalityId)};">
              <div class="cls-card__time">{t.horarioInicio}<span>– {t.horarioFim}</span></div>
              <div class="cls-card__title">{t.modality.nome}</div>
              <div class="cls-card__meta">
                <span>{t.nivel}</span>
                <span>·</span>
                <span>{t.sala}</span>
              </div>
              <div class="cls-card__foot">
                <span class="cls-card__prof">{t.professor.nome}</span>
                <span class="cls-card__cap">{t._count.enrollments}/{t.maxAlunos}</span>
              </div>
              {#if !t.ativo}
                <span class="cls-card__off">inativa</span>
              {/if}
            </button>
          {/each}
          {#if turmasPorDia[dia.key].length === 0}
            <div class="week-col__empty">—</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{:else}
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>Modalidade</th>
          <th>Nível</th>
          <th>Dia</th>
          <th>Horário</th>
          <th>Professor</th>
          <th>Sala</th>
          <th>Alunos</th>
          <th>Status</th>
          <th style="text-align:right;">Ações</th>
        </tr>
      </thead>
      <tbody>
        {#each data.turmas as turma}
          <tr>
            <td style="color: var(--text); font-weight: 600;">{turma.modality.nome}</td>
            <td>{turma.nivel}</td>
            <td>{diasLabels[turma.diaSemana] ?? turma.diaSemana}</td>
            <td class="muted">{turma.horarioInicio} - {turma.horarioFim}</td>
            <td>{turma.professor.nome}</td>
            <td>{turma.sala}</td>
            <td>{turma._count.enrollments}/{turma.maxAlunos}</td>
            <td>
              {#if turma.ativo}<span class="badge badge--active">Ativa</span>{:else}<span class="badge">Inativa</span>{/if}
            </td>
            <td>
              <div class="actions">
                <button class="btn--icon" onclick={() => startEdit(turma)} aria-label="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .turmas-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
  }
  .week-col {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 240px;
  }
  .week-col.is-empty { opacity: 0.7; }
  .week-col__head {
    padding: 10px 14px;
    background: var(--surface-2);
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-soft);
  }
  .week-col__count {
    font-size: 10px;
    padding: 1px 7px;
    background: var(--surface-3);
    border-radius: 999px;
    color: var(--text-mute);
    font-weight: 700;
    letter-spacing: 0;
  }
  .week-col__body {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }
  .week-col__empty {
    margin: auto;
    color: var(--text-mute);
    font-size: 14px;
    opacity: 0.5;
  }
  .cls-card {
    text-align: left;
    background: var(--surface-2);
    border: 1px solid var(--line);
    border-left: 3px solid var(--mod-color, var(--coral));
    border-radius: 8px;
    padding: 8px 10px;
    cursor: pointer;
    transition: background .2s, transform .2s, border-color .2s;
    color: inherit;
    font-family: inherit;
    position: relative;
  }
  .cls-card:hover {
    background: var(--surface-3);
    transform: translateY(-1px);
    border-color: var(--mod-color);
  }
  .cls-card__time {
    font-family: var(--serif);
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
    letter-spacing: -0.01em;
  }
  .cls-card__time span {
    font-size: 11px;
    color: var(--text-mute);
    margin-left: 4px;
    font-family: var(--sans);
    font-weight: 400;
  }
  .cls-card__title {
    font-size: 12px;
    font-weight: 600;
    color: var(--mod-color, var(--text));
    margin-top: 3px;
  }
  .cls-card__meta {
    font-size: 10.5px;
    color: var(--text-mute);
    margin-top: 4px;
    display: flex;
    gap: 4px;
  }
  .cls-card__foot {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px dashed var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10.5px;
  }
  .cls-card__prof {
    color: var(--text-soft);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 70%;
  }
  .cls-card__cap {
    color: var(--text-mute);
    font-family: monospace;
  }
  .cls-card__off {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background: rgba(226, 90, 76, 0.16);
    color: var(--danger);
    padding: 1px 6px;
    border-radius: 999px;
    font-weight: 700;
  }
  @media (max-width: 1100px) {
    .turmas-week {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  @media (max-width: 700px) {
    .turmas-week {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
