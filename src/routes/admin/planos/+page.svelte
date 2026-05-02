<!-- BalancaEu — Admin: Planos -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();
  let showCreateForm = $state(false);
  let editingId = $state<string | null>(null);
  let editNome = $state('');
  let editDescricao = $state('');
  let editPreco = $state('');
  let editMaxAulas = $state('');
  let editPermiteParticular = $state(false);
  let editAtivo = $state(true);

  function formatCurrency(value: number | string) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function startEdit(p: { id: string; nome: string; descricao: string; preco: number | string; maxAulasSemana: number; permiteParticular: boolean; ativo: boolean }) {
    editingId = p.id;
    editNome = p.nome;
    editDescricao = p.descricao;
    editPreco = String(p.preco);
    editMaxAulas = String(p.maxAulasSemana);
    editPermiteParticular = p.permiteParticular;
    editAtivo = p.ativo;
  }

  function cancelEdit() {
    editingId = null;
  }
</script>

<svelte:head>
  <title>Planos — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Planos</h1>
    <p class="page-sub">{data.planos.length} plano(s) cadastrado(s)</p>
  </div>
  <button class="btn btn--primary" onclick={() => showCreateForm = !showCreateForm}>
    {#if showCreateForm}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>Cancelar
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>Novo Plano
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
    <h3>Novo Plano</h3>
    <form method="POST" action="?/create" use:enhance={() => async ({ update }) => { await update(); showCreateForm = false; }}>
      <div class="form-grid">
        <div class="field"><label for="cpl-nome">Nome</label><input id="cpl-nome" name="nome" type="text" required placeholder="Ex: Plano Básico" /></div>
        <div class="field"><label for="cpl-desc">Descrição</label><input id="cpl-desc" name="descricao" type="text" required placeholder="Breve descrição" /></div>
        <div class="field"><label for="cpl-preco">Preço (R$)</label><input id="cpl-preco" name="preco" type="number" required min="0" step="0.01" placeholder="150.00" /></div>
        <div class="field"><label for="cpl-max">Máx. aulas/semana</label><input id="cpl-max" name="maxAulasSemana" type="number" required min="1" value="2" /></div>
        <div class="field" style="display:flex; align-items:center; gap:8px; padding-top:18px;">
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer; margin:0;">
            <input type="checkbox" name="permiteParticular" /> Permite aula particular
          </label>
        </div>
      </div>
      <div style="margin-top: 16px;">
        <button type="submit" class="btn btn--primary">Criar Plano</button>
      </div>
    </form>
  </div>
{/if}

{#if data.planos.length === 0}
  <div class="empty">
    <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg></div>
    <p>Nenhum plano cadastrado.</p>
  </div>
{:else}
  <div class="cards-grid">
    {#each data.planos as plano}
      <div class="plan-admin">
        {#if editingId === plano.id}
          <form method="POST" action="?/update" use:enhance={() => async ({ update }) => { await update(); editingId = null; }}>
            <input type="hidden" name="id" value={plano.id} />
            <input type="hidden" name="ativo" value={editAtivo.toString()} />
            <div class="form-grid" style="grid-template-columns: 1fr; gap: 10px;">
              <div class="field"><label for="ep-{plano.id}-nome">Nome</label><input id="ep-{plano.id}-nome" name="nome" type="text" required bind:value={editNome} /></div>
              <div class="field"><label for="ep-{plano.id}-desc">Descrição</label><input id="ep-{plano.id}-desc" name="descricao" type="text" required bind:value={editDescricao} /></div>
              <div class="field"><label for="ep-{plano.id}-preco">Preço</label><input id="ep-{plano.id}-preco" name="preco" type="number" required min="0" step="0.01" bind:value={editPreco} /></div>
              <div class="field"><label for="ep-{plano.id}-max">Máx. aulas/sem</label><input id="ep-{plano.id}-max" name="maxAulasSemana" type="number" required min="1" bind:value={editMaxAulas} /></div>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12px;">
                <input type="checkbox" name="permiteParticular" bind:checked={editPermiteParticular} /> Permite particular
              </label>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12px;">
                <input type="checkbox" bind:checked={editAtivo} /> Ativo
              </label>
            </div>
            <div style="margin-top:12px; display:flex; gap:8px;">
              <button type="submit" class="btn btn--primary btn--sm" style="flex:1;">Salvar</button>
              <button type="button" class="btn btn--ghost btn--sm" style="flex:1;" onclick={cancelEdit}>Cancelar</button>
            </div>
          </form>
        {:else}
          <div class="plan-admin__head">
            <div>
              <div class="plan-admin__name">{plano.nome}</div>
              <div class="plan-admin__tag">{plano.descricao}</div>
            </div>
            {#if plano.ativo}
              <span class="badge badge--active">Ativo</span>
            {:else}
              <span class="badge">Inativo</span>
            {/if}
          </div>
          <div class="plan-admin__price">{formatCurrency(plano.preco)}<span class="per">/mês</span></div>
          <ul class="plan-admin__list">
            <li class="on">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              {plano.maxAulasSemana >= 99 ? 'Aulas ilimitadas' : `${plano.maxAulasSemana} aulas/semana`}
            </li>
            <li class={plano.permiteParticular ? 'on' : ''}>
              {#if plano.permiteParticular}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Permite aula particular
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>Sem aula particular
              {/if}
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
              {plano._count.subscriptions} assinante(s)
            </li>
          </ul>
          <div class="plan-admin__foot">
            <button class="btn--icon" onclick={() => startEdit(plano)} aria-label="Editar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <form method="POST" action="?/delete" use:enhance style="display:inline;">
              <input type="hidden" name="id" value={plano.id} />
              <button type="submit" class="btn--icon is-danger" aria-label="Excluir"
                onclick={(e) => { if (!confirm('Excluir este plano?')) e.preventDefault(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
              </button>
            </form>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
