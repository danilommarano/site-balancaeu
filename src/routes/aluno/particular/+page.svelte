<!-- BalancaEu — Aulas Particulares -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let activeTab = $state<'agendar' | 'historico'>('agendar');
  let professorSelecionado = $state('');
  let modalidadeSelecionada = $state('');

  const diasLabels: Record<string, string> = {
    SEG: 'Segunda', TER: 'Terça', QUA: 'Quarta', QUI: 'Quinta',
    SEX: 'Sexta', SAB: 'Sábado', DOM: 'Domingo'
  };

  const statusLabels: Record<string, string> = {
    AGENDADA: 'Pendente',
    CONFIRMADA: 'Confirmada',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada'
  };

  let profAtual = $derived(
    data.professores.find(p => p.userId === professorSelecionado)
  );

  let modalidadesProf = $derived(profAtual?.modalidades ?? []);
  let disponibilidadesProf = $derived(profAtual?.disponibilidades ?? []);

  let disponibilidadesPorDia = $derived(
    Object.entries(diasLabels)
      .map(([key, label]) => ({
        dia: key,
        label,
        slots: disponibilidadesProf.filter(d => d.diaSemana === key)
      }))
      .filter(d => d.slots.length > 0)
  );

  let aulasAtivas = $derived(
    data.minhasAulas.filter(a => a.status === 'AGENDADA' || a.status === 'CONFIRMADA')
  );

  let aulasPassadas = $derived(
    data.minhasAulas.filter(a => a.status === 'CONCLUIDA' || a.status === 'CANCELADA')
  );

  function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function canCancel(aula: { status: string; dataHora: string }): boolean {
    if (aula.status === 'AGENDADA') return true;
    if (aula.status === 'CONFIRMADA') {
      const horas = (new Date(aula.dataHora).getTime() - Date.now()) / (1000 * 60 * 60);
      return horas >= 24;
    }
    return false;
  }
</script>

<svelte:head>
  <title>Aulas Particulares — Balança Eu</title>
</svelte:head>

<div class="page-head">
  <h1 class="page-title">Aulas <em>Particulares</em></h1>
  <p class="page-sub">Agende aulas particulares com seus professores.</p>
</div>

{#if !data.temPlano}
  <div class="alert" style="margin-bottom: 20px;">
    <div class="alert__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>
    </div>
    <div class="alert__body">
      <strong>Sem plano ativo</strong>
      <p>Você precisa de um plano para agendar aulas. <a href="/aluno/plano">Ver planos</a></p>
    </div>
  </div>
{:else if !data.permiteParticular}
  <div class="alert" style="margin-bottom: 20px;">
    <div class="alert__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
    </div>
    <div class="alert__body">
      <strong>Plano não inclui particulares</strong>
      <p>Faça upgrade para um plano que inclua aulas particulares. <a href="/aluno/plano">Ver planos</a></p>
    </div>
  </div>
{/if}

{#if form?.success}
  <div class="alert" style="margin-bottom: 20px;">
    <div class="alert__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
    </div>
    <div class="alert__body">
      <strong>Sucesso</strong>
      <p>{form.message}</p>
    </div>
  </div>
{/if}
{#if form?.error}
  <div class="alert" style="margin-bottom: 20px;">
    <div class="alert__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
    </div>
    <div class="alert__body">
      <strong>Erro</strong>
      <p>{form.error}</p>
    </div>
  </div>
{/if}

<div class="tabs" style="margin-bottom: 20px;">
  <button type="button" class="tab {activeTab === 'agendar' ? 'is-active' : ''}" onclick={() => activeTab = 'agendar'}>Agendar</button>
  <button type="button" class="tab {activeTab === 'historico' ? 'is-active' : ''}" onclick={() => activeTab = 'historico'}>
    Minhas Aulas
    {#if aulasAtivas.length > 0}
      <span style="display:inline-block; min-width:18px; padding:0 6px; height:18px; line-height:18px; border-radius:9px; background: currentColor; color: var(--creme); font-size:10px; font-weight:700; margin-left:6px;">
        <span style="color: var(--ink); mix-blend-mode: difference;">{aulasAtivas.length}</span>
      </span>
    {/if}
  </button>
</div>

{#if activeTab === 'agendar'}
  {#if data.professores.length === 0}
    <div class="placeholder-card">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/><path d="M2 2l20 20" opacity=".4"/></svg>
      <h3>Nenhum professor disponível</h3>
      <p>Nenhum professor configurou horários para aulas particulares no momento.</p>
    </div>
  {:else}
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px;">
      <div class="card">
        <div class="card__head">
          <div class="card__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
            Nova Aula
          </div>
        </div>

        <form method="POST" action="?/agendar" use:enhance>
          <div class="field">
            <label for="part-professor">Professor</label>
            <select id="part-professor" name="professorId" required bind:value={professorSelecionado} onchange={() => modalidadeSelecionada = ''}>
              <option value="">Selecione...</option>
              {#each data.professores as prof}
                <option value={prof.userId}>{prof.nome}</option>
              {/each}
            </select>
          </div>

          {#if profAtual}
            <div class="field">
              <label for="part-modalidade">Modalidade</label>
              <select id="part-modalidade" name="modalityId" required bind:value={modalidadeSelecionada}>
                <option value="">Selecione...</option>
                {#each modalidadesProf as mod}
                  <option value={mod.id}>{mod.nome}</option>
                {/each}
              </select>
            </div>
          {/if}

          <div class="field">
            <label for="part-data">Data</label>
            <input id="part-data" name="data" type="date" required min={new Date().toISOString().split('T')[0]} />
          </div>

          <div class="field">
            <label for="part-horario">Horário</label>
            <input id="part-horario" name="horario" type="time" required />
          </div>

          <div class="field">
            <label for="part-duracao">Duração</label>
            <select id="part-duracao" name="duracao">
              <option value="30">30 minutos</option>
              <option value="60" selected>60 minutos</option>
              <option value="90">90 minutos</option>
            </select>
          </div>

          <div class="field">
            <label for="part-obs">Observação (opcional)</label>
            <textarea id="part-obs" name="observacao" rows="2" placeholder="Ex: Quero focar em giros..."></textarea>
          </div>

          <button type="submit" class="btn btn--primary btn--full" disabled={!data.permiteParticular}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            Solicitar Agendamento
          </button>
        </form>
      </div>

      <div>
        {#if !profAtual}
          <div class="placeholder-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
            <h3>Selecione um professor</h3>
            <p>Escolha um professor para ver os horários disponíveis.</p>
          </div>
        {:else}
          <div class="card" style="margin-bottom: 14px;">
            <div class="card__head">
              <div class="card__title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                Disponibilidade de {profAtual.nome}
              </div>
            </div>
            <p style="font-size: 12px; color: var(--ink-mute); margin-top: -10px; margin-bottom: 14px;">Agende sua aula em um dos horários disponíveis abaixo.</p>

            {#if disponibilidadesPorDia.length === 0}
              <div class="empty-state">
                <p>Este professor não tem horários configurados.</p>
              </div>
            {:else}
              {#each disponibilidadesPorDia as grupo}
                <div style="display: flex; align-items: center; gap: 16px; padding: 10px 0; border-top: 1px solid var(--line);">
                  <div style="width: 90px; flex-shrink: 0; font-size: 13px; font-weight: 600; color: var(--terracota);">{grupo.label}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    {#each grupo.slots as slot}
                      <span style="font-size: 12px; background: var(--creme); color: var(--ink-soft); padding: 4px 10px; border-radius: 8px; border: 1px solid var(--line);">
                        {slot.horarioInicio} – {slot.horarioFim}
                      </span>
                    {/each}
                  </div>
                </div>
              {/each}
            {/if}
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
            <span style="font-size: 11px; color: var(--ink-mute); margin-right: 6px;">Modalidades:</span>
            {#each profAtual.modalidades as mod}
              <span style="font-size: 11px; background: var(--creme); color: var(--ink-soft); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--line);">{mod.nome}</span>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

{:else}
  {#if data.minhasAulas.length === 0}
    <div class="placeholder-card">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
      <h3>Nenhuma aula</h3>
      <p>Você ainda não agendou nenhuma aula particular.</p>
      <button type="button" class="btn btn--coral" style="margin-top: 14px;" onclick={() => activeTab = 'agendar'}>Agendar uma aula</button>
    </div>
  {:else}
    {#if aulasAtivas.length > 0}
      <div class="card" style="margin-bottom: 18px;">
        <div class="card__head">
          <div class="card__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
            Aulas Agendadas
          </div>
        </div>

        <div class="upcoming__list">
          {#each aulasAtivas as aula}
            <div class="upcoming-row" style="flex-direction: column; align-items: stretch; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                <div>
                  <h4 style="font-size: 16px; font-weight: 600; color: var(--ink); margin: 0;">{aula.modalidade}</h4>
                  <p style="font-size: 12px; color: var(--ink-mute); margin: 2px 0 0;">Prof. {aula.professor}</p>
                </div>
                <span style="font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: var(--creme-warm); color: var(--ink-soft); border: 1px solid var(--line);">
                  {statusLabels[aula.status] ?? aula.status}
                </span>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 14px; font-size: 13px; color: var(--ink-soft);">
                <span>{formatDateTime(aula.dataHora)}</span>
                <span>{aula.duracao} min</span>
                {#if aula.observacao}
                  <span>· {aula.observacao}</span>
                {/if}
              </div>
              {#if canCancel(aula)}
                <form method="POST" action="?/cancelar" use:enhance>
                  <input type="hidden" name="id" value={aula.id} />
                  <button type="submit" class="btn btn--ghost btn--sm" style="border-color: var(--danger); color: var(--danger);">
                    Cancelar aula
                  </button>
                </form>
              {:else if aula.status === 'CONFIRMADA'}
                <p style="font-size: 11px; color: var(--ink-mute); margin: 0;">Cancelamento indisponível (menos de 24h).</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if aulasPassadas.length > 0}
      <details>
        <summary style="font-size: 12px; color: var(--ink-mute); cursor: pointer; padding: 8px 0;">
          Histórico ({aulasPassadas.length})
        </summary>
        <div class="card" style="margin-top: 8px;">
          <div class="upcoming__list">
            {#each aulasPassadas as aula}
              <div class="upcoming-row" style="opacity: 0.7;">
                <div class="upcoming-info">
                  <h4>{aula.modalidade} — Prof. {aula.professor}</h4>
                  <p>{formatDateTime(aula.dataHora)} · {aula.duracao} min</p>
                </div>
                <div class="upcoming-time">
                  {statusLabels[aula.status] ?? aula.status}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </details>
    {/if}
  {/if}
{/if}
