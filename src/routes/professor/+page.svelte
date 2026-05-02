<!-- BalancaEu — Dashboard do Professor -->
<script lang="ts">
  let { data } = $props();

  function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
      ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDateShort(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  let primeiroNome = $derived(data.user?.nome?.split(' ')[0] ?? 'Professor');
</script>

<svelte:head>
  <title>Painel — Professor · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Olá, <em>{primeiroNome}!</em></h1>
    <p class="page-sub">{data.diaLabel} — Painel do professor</p>
  </div>
</div>

<div class="stat-grid">
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Turmas Ativas</div>
      <div class="stat-card__icon is-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/></svg></div>
    </div>
    <div class="stat-card__value">{data.stats.totalTurmas}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Aulas Hoje</div>
      <div class="stat-card__icon is-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></div>
    </div>
    <div class="stat-card__value">{data.stats.aulasHoje}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Particulares Pendentes</div>
      <div class="stat-card__icon is-ocre"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6-7 6 7M6 15l6 7 6-7"/></svg></div>
    </div>
    <div class="stat-card__value">{data.stats.particularesPendentes}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__label">Confirmadas</div>
      <div class="stat-card__icon is-plum"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg></div>
    </div>
    <div class="stat-card__value">{data.stats.particularesConfirmadas}</div>
  </div>
</div>

<div class="two-col" style="grid-template-columns: 2fr 1fr;">
  <div style="display:flex; flex-direction:column; gap:16px;">
    <div class="card">
      <div class="card__head">
        <div class="card__title blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          Turmas de Hoje
        </div>
        <span style="font-size:11px; color:var(--text-mute);">{data.turmasHoje.length} turma{data.turmasHoje.length !== 1 ? 's' : ''}</span>
      </div>
      {#if data.turmasHoje.length === 0}
        <div class="empty">
          <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></div>
          <p>Nenhuma aula programada para hoje.</p>
        </div>
      {:else}
        {#each data.turmasHoje as turma}
          <div class="turma-row">
            <div>
              <div class="turma-row__name">{turma.modalidade}</div>
              <div class="turma-row__meta"><strong>{turma.nivel}</strong> · {turma.horarioInicio} — {turma.horarioFim} · Sala {turma.sala}</div>
            </div>
            {#if turma.chamadaFeita}
              <span class="turma-row__count">Chamada feita</span>
            {:else}
              <a href="/professor/chamada?data={new Date().toISOString().split('T')[0]}&turma={turma.id}" class="btn btn--primary btn--sm" style="margin-left:auto;">Chamada</a>
            {/if}
          </div>
        {/each}
      {/if}
    </div>

    <div class="card">
      <div class="card__head">
        <div class="card__title plum">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          Últimas Chamadas
        </div>
      </div>
      {#if data.ultimasChamadas.length === 0}
        <div class="empty">
          <p>Nenhuma chamada registrada ainda.</p>
        </div>
      {:else}
        {#each data.ultimasChamadas as chamada}
          {@const total = chamada.presentes + chamada.ausentes}
          <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line);">
            <div>
              <div style="font-size:13px; font-weight:600; color:var(--text);">{chamada.turma}</div>
              <div style="font-size:11px; color:var(--text-mute);">{formatDateShort(chamada.data)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:11px; color:var(--success);">{chamada.presentes}P</span>
              <span style="font-size:11px; color:var(--coral);">{chamada.ausentes}F</span>
              <span style="font-size:11px; color:var(--text-mute);">/ {total}</span>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <div style="display:flex; flex-direction:column; gap:16px;">
    <div class="card">
      <div class="card__head">
        <div class="card__title coral">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
          Próximas Particulares
        </div>
        <a href="/professor/particulares">Ver todas</a>
      </div>
      {#if data.proximasParticulares.length === 0}
        <div class="empty" style="padding:30px 12px;">
          <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg></div>
          <p style="font-size:13px;">Nenhuma particular agendada.</p>
        </div>
      {:else}
        {#each data.proximasParticulares as aula}
          <div style="padding:12px 0; border-bottom:1px solid var(--line);">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
              <span style="font-size:13px; font-weight:600; color:var(--text);">{aula.modalidade}</span>
              <span style="font-size:10px; color:var(--text-mute); text-transform:uppercase; letter-spacing:.04em;">
                {aula.status === 'CONFIRMADA' ? 'Confirmada' : 'Pendente'}
              </span>
            </div>
            <div style="font-size:11px; color:var(--text-mute);">Aluno: {aula.aluno}</div>
            <div style="font-size:11px; color:var(--text-mute);">{formatDateTime(aula.dataHora)} · {aula.duracao}min</div>
          </div>
        {/each}
      {/if}
    </div>

    <div class="quick-actions">
      <div class="quick-actions__title">Ações Rápidas</div>
      <a class="quick-action" href="/professor/chamada">
        <div class="quick-action__ico is-coral"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div>
        <div class="quick-action__text">
          <div class="quick-action__name">Chamada</div>
          <div class="quick-action__hint">Registrar presença</div>
        </div>
      </a>
      <a class="quick-action" href="/professor/agenda">
        <div class="quick-action__ico is-plum"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></div>
        <div class="quick-action__text">
          <div class="quick-action__name">Agenda</div>
          <div class="quick-action__hint">Ver semana completa</div>
        </div>
      </a>
      <a class="quick-action" href="/professor/disponibilidade">
        <div class="quick-action__ico is-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div>
        <div class="quick-action__text">
          <div class="quick-action__name">Disponibilidade</div>
          <div class="quick-action__hint">Configurar horários</div>
        </div>
      </a>
    </div>
  </div>
</div>
