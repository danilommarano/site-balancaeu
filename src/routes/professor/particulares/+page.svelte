<!-- BalancaEu — Professor: Aulas Particulares -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let filtroStatus = $state<'' | 'AGENDADA' | 'CONFIRMADA' | 'CONCLUIDA' | 'CANCELADA'>('');

  const statusLabels: Record<string, string> = {
    AGENDADA: 'Pendente',
    CONFIRMADA: 'Confirmada',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada'
  };

  const tabs: { key: '' | 'AGENDADA' | 'CONFIRMADA' | 'CONCLUIDA' | 'CANCELADA'; label: string }[] = [
    { key: '', label: 'Todas' },
    { key: 'AGENDADA', label: 'Pendente' },
    { key: 'CONFIRMADA', label: 'Confirmada' },
    { key: 'CONCLUIDA', label: 'Concluída' },
    { key: 'CANCELADA', label: 'Cancelada' }
  ];

  let aulasFiltradas = $derived(
    filtroStatus ? data.aulas.filter(a => a.status === filtroStatus) : data.aulas
  );

  let pendentes = $derived(data.aulas.filter(a => a.status === 'AGENDADA').length);

  function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
</script>

<svelte:head>
  <title>Particulares — Professor · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Aulas <em>Particulares</em></h1>
    <p class="page-sub">Gerencie solicitações de aulas particulares{#if pendentes > 0} · {pendentes} pendente{pendentes !== 1 ? 's' : ''}{/if}</p>
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

<div class="tabs" style="margin-bottom:18px;">
  {#each tabs as tab}
    <button class="tab {filtroStatus === tab.key ? 'is-active' : ''}" onclick={() => filtroStatus = tab.key}>
      {tab.label}
    </button>
  {/each}
</div>

{#if aulasFiltradas.length === 0}
  <div class="card">
    <div class="empty">
      <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg></div>
      <p>Nenhuma aula encontrada</p>
      <div style="font-size:12px; color:var(--text-mute); font-style:normal; font-family:var(--sans); margin-top:6px;">
        {#if filtroStatus}Tente outro filtro.{:else}Ainda não há solicitações de aulas particulares.{/if}
      </div>
    </div>
  </div>
{:else}
  <div style="display:flex; flex-direction:column; gap:12px;">
    {#each aulasFiltradas as aula}
      <div class="card">
        <div class="card__head">
          <div class="card__title coral">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
            {aula.modalidade}
          </div>
          <span class="tag {aula.status === 'CANCELADA' ? 'tag--coral' : ''}" style="text-transform:uppercase; letter-spacing:.04em;">
            {statusLabels[aula.status] ?? aula.status}
          </span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; font-size:12.5px; color:var(--text-mute); margin-bottom:14px;">
          <div>
            <div style="color:var(--text-mute); font-size:11px;">Aluno</div>
            <div style="color:var(--text);">{aula.aluno.nome}</div>
          </div>
          <div>
            <div style="color:var(--text-mute); font-size:11px;">Quando</div>
            <div style="color:var(--text);">{formatDateTime(aula.dataHora)}</div>
          </div>
          <div>
            <div style="color:var(--text-mute); font-size:11px;">Duração</div>
            <div style="color:var(--text);">{aula.duracao} min</div>
          </div>
          <div>
            <div style="color:var(--text-mute); font-size:11px;">Email</div>
            <div style="color:var(--text);">{aula.aluno.email}</div>
          </div>
          {#if aula.observacao}
            <div style="grid-column:1/-1;">
              <div style="color:var(--text-mute); font-size:11px;">Observação</div>
              <div style="color:var(--text);">{aula.observacao}</div>
            </div>
          {/if}
        </div>

        <div style="display:flex; gap:8px;">
          {#if aula.status === 'AGENDADA'}
            <form method="POST" action="?/confirmar" use:enhance>
              <input type="hidden" name="id" value={aula.id} />
              <button type="submit" class="btn btn--primary btn--sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                Confirmar
              </button>
            </form>
            <form method="POST" action="?/recusar" use:enhance>
              <input type="hidden" name="id" value={aula.id} />
              <button type="submit" class="btn btn--ghost btn--sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                Recusar
              </button>
            </form>
          {/if}
          {#if aula.status === 'CONFIRMADA'}
            <form method="POST" action="?/concluir" use:enhance>
              <input type="hidden" name="id" value={aula.id} />
              <button type="submit" class="btn btn--primary btn--sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>
                Marcar Concluída
              </button>
            </form>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
