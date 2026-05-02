<!-- BalancaEu — Admin: Eventos -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();
  let showCreateForm = $state(false);
  let editingId = $state<string | null>(null);
  let editTitulo = $state('');
  let editDescricao = $state('');
  let editData = $state('');
  let editHorario = $state('');
  let editLocal = $state('');
  let editPreco = $state('');

  function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatCurrency(value: number | string | null) {
    if (!value) return 'Gratuito';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function isPast(date: string | Date) {
    return new Date(date) < new Date();
  }

  function toDateInputValue(date: string | Date) {
    return new Date(date).toISOString().split('T')[0];
  }

  function startEdit(e: { id: string; titulo: string; descricao: string; data: string | Date; horario: string; local: string; preco: number | string | null }) {
    editingId = e.id;
    editTitulo = e.titulo;
    editDescricao = e.descricao;
    editData = toDateInputValue(e.data);
    editHorario = e.horario;
    editLocal = e.local;
    editPreco = e.preco ? String(e.preco) : '';
  }

  function cancelEdit() {
    editingId = null;
  }
</script>

<svelte:head>
  <title>Eventos — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Eventos</h1>
    <p class="page-sub">{data.eventos.length} evento(s)</p>
  </div>
  <button class="btn btn--primary" onclick={() => showCreateForm = !showCreateForm}>
    {#if showCreateForm}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>Cancelar
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>Novo Evento
    {/if}
  </button>
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
    <h3>Novo Evento</h3>
    <form method="POST" action="?/create" use:enhance={() => async ({ update }) => { await update(); showCreateForm = false; }}>
      <div class="form-grid">
        <div class="field"><label for="ce-titulo">Título</label><input id="ce-titulo" name="titulo" type="text" required placeholder="Nome do evento" /></div>
        <div class="field"><label for="ce-data">Data</label><input id="ce-data" name="data" type="date" required /></div>
        <div class="field"><label for="ce-horario">Horário</label><input id="ce-horario" name="horario" type="text" required value="19:00 - 22:00" /></div>
        <div class="field"><label for="ce-local">Local</label><input id="ce-local" name="local" type="text" required placeholder="Local do evento" /></div>
        <div class="field"><label for="ce-preco">Preço (R$) — vazio = gratuito</label><input id="ce-preco" name="preco" type="number" min="0" step="0.01" placeholder="0,00" /></div>
        <div class="field"><label for="ce-desc">Descrição</label><input id="ce-desc" name="descricao" type="text" required placeholder="Breve descrição" /></div>
      </div>
      <div style="margin-top: 16px;">
        <button type="submit" class="btn btn--primary">Criar Evento</button>
      </div>
    </form>
  </div>
{/if}

{#if data.eventos.length === 0}
  <div class="empty">
    <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></div>
    <p>Nenhum evento cadastrado.</p>
  </div>
{:else}
  <div class="cards-grid">
    {#each data.eventos as evento}
      <div class="card">
        {#if editingId === evento.id}
          <form method="POST" action="?/update" use:enhance={() => async ({ update }) => { await update(); editingId = null; }}>
            <input type="hidden" name="id" value={evento.id} />
            <div class="form-grid" style="grid-template-columns: 1fr; gap: 10px;">
              <div class="field"><label for="ee-{evento.id}-tit">Título</label><input id="ee-{evento.id}-tit" name="titulo" type="text" required bind:value={editTitulo} /></div>
              <div class="field"><label for="ee-{evento.id}-data">Data</label><input id="ee-{evento.id}-data" name="data" type="date" required bind:value={editData} /></div>
              <div class="field"><label for="ee-{evento.id}-hor">Horário</label><input id="ee-{evento.id}-hor" name="horario" type="text" required bind:value={editHorario} /></div>
              <div class="field"><label for="ee-{evento.id}-loc">Local</label><input id="ee-{evento.id}-loc" name="local" type="text" required bind:value={editLocal} /></div>
              <div class="field"><label for="ee-{evento.id}-preco">Preço</label><input id="ee-{evento.id}-preco" name="preco" type="number" min="0" step="0.01" bind:value={editPreco} /></div>
              <div class="field"><label for="ee-{evento.id}-desc">Descrição</label><textarea id="ee-{evento.id}-desc" name="descricao" required rows="2" bind:value={editDescricao}></textarea></div>
            </div>
            <div style="margin-top:12px; display:flex; gap:8px;">
              <button type="submit" class="btn btn--primary btn--sm" style="flex:1;">Salvar</button>
              <button type="button" class="btn btn--ghost btn--sm" style="flex:1;" onclick={cancelEdit}>Cancelar</button>
            </div>
          </form>
        {:else}
          <div class="card__head">
            <div class="card__title">{evento.titulo}</div>
            {#if isPast(evento.data)}
              <span class="badge">Passado</span>
            {:else}
              <span class="badge badge--active">Próximo</span>
            {/if}
          </div>
          <div style="font-size:12px; color:var(--text-mute); margin-bottom:8px;">
            {formatDate(evento.data)} · {evento.horario}
          </div>
          <p style="font-size:13px; color:var(--text); margin-bottom:10px; line-height:1.5;">{evento.descricao}</p>
          <div style="display:flex; gap:14px; font-size:12px; color:var(--text-mute); margin-bottom:14px;">
            <span>📍 {evento.local}</span>
            <span>💰 {formatCurrency(evento.preco)}</span>
          </div>
          <div style="display:flex; gap:8px; padding-top:10px; border-top:1px solid var(--line); align-items:center;">
            <form method="POST" action="?/toggleActive" use:enhance style="display:inline; margin-right:auto;">
              <input type="hidden" name="id" value={evento.id} />
              <input type="hidden" name="ativo" value={(!evento.ativo).toString()} />
              <button type="submit" class="btn btn--ghost btn--sm">{evento.ativo ? 'Desativar' : 'Ativar'}</button>
            </form>
            <button class="btn--icon" onclick={() => startEdit(evento)} aria-label="Editar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <form method="POST" action="?/delete" use:enhance style="display:inline;">
              <input type="hidden" name="id" value={evento.id} />
              <button type="submit" class="btn--icon is-danger" aria-label="Excluir"
                onclick={(e) => { if (!confirm('Excluir este evento?')) e.preventDefault(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
              </button>
            </form>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
