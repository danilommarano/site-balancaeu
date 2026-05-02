<!-- BalancaEu — Admin: Modalidades -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import ImageUpload from '$lib/components/admin/ImageUpload.svelte';

  let { data, form } = $props();

  let showCreateForm = $state(false);
  let createImagemUrl = $state<string | null>(null);
  let editingId = $state<string | null>(null);
  let editNome = $state('');
  let editDescricao = $state('');
  let editAtivo = $state(true);
  let editImagemUrl = $state<string | null>(null);

  function startEdit(m: { id: string; nome: string; descricao: string; ativo: boolean; imagemUrl: string | null }) {
    editingId = m.id;
    editNome = m.nome;
    editDescricao = m.descricao;
    editAtivo = m.ativo;
    editImagemUrl = m.imagemUrl;
  }

  function cancelEdit() {
    editingId = null;
  }
</script>

<svelte:head>
  <title>Modalidades — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Modalidades</h1>
    <p class="page-sub">{data.modalidades.length} modalidade(s) cadastrada(s)</p>
  </div>
  <button class="btn btn--primary" onclick={() => showCreateForm = !showCreateForm}>
    {#if showCreateForm}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>Cancelar
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>Nova Modalidade
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
    <h3>Nova Modalidade</h3>
    <form method="POST" action="?/create" use:enhance={() => async ({ update }) => { await update(); showCreateForm = false; createImagemUrl = null; }}>
      <div class="form-grid">
        <div class="field">
          <label for="create-nome">Nome</label>
          <input id="create-nome" name="nome" type="text" required placeholder="Ex: Forró Roots" />
        </div>
        <div class="field">
          <label for="create-descricao">Descrição</label>
          <input id="create-descricao" name="descricao" type="text" required placeholder="Breve descrição da modalidade" />
        </div>
        <div class="field">
          <ImageUpload bind:value={createImagemUrl} name="imagemUrl" category="modality" label="Imagem do card" />
        </div>
      </div>
      <div style="margin-top: 16px;">
        <button type="submit" class="btn btn--primary">Criar Modalidade</button>
      </div>
    </form>
  </div>
{/if}

{#if data.modalidades.length === 0}
  <div class="empty">
    <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v6M8 13h8M8 13l-3 8M16 13l3 8"/></svg></div>
    <p>Nenhuma modalidade cadastrada.</p>
  </div>
{:else}
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th style="width:64px;">Imagem</th>
          <th>Nome</th>
          <th>Descrição</th>
          <th style="width:90px;">Turmas</th>
          <th style="width:90px;">Status</th>
          <th style="width:90px; text-align:right;">Ações</th>
        </tr>
      </thead>
      <tbody>
        {#each data.modalidades as modalidade}
          {#if editingId === modalidade.id}
            <tr>
              <td colspan="6">
                <form method="POST" action="?/update" use:enhance={() => async ({ update }) => { await update(); editingId = null; }}>
                  <input type="hidden" name="id" value={modalidade.id} />
                  <input type="hidden" name="ativo" value={editAtivo.toString()} />
                  <div class="form-grid">
                    <div class="field"><label for="edit-mod-nome">Nome</label><input id="edit-mod-nome" name="nome" type="text" required bind:value={editNome} /></div>
                    <div class="field"><label for="edit-mod-desc">Descrição</label><input id="edit-mod-desc" name="descricao" type="text" required bind:value={editDescricao} /></div>
                    <div class="field" style="display:flex; align-items:center; gap:8px; padding-top:18px;">
                      <label style="display:flex; align-items:center; gap:6px; cursor:pointer; margin:0;">
                        <input type="checkbox" bind:checked={editAtivo} /> Ativo
                      </label>
                    </div>
                    <div class="field" style="grid-column: 1 / -1;">
                      <ImageUpload bind:value={editImagemUrl} name="imagemUrl" category="modality" label="Imagem do card" />
                    </div>
                  </div>
                  <div style="margin-top:12px; display:flex; gap:8px;">
                    <button type="submit" class="btn btn--primary btn--sm">Salvar</button>
                    <button type="button" class="btn btn--ghost btn--sm" onclick={cancelEdit}>Cancelar</button>
                  </div>
                </form>
              </td>
            </tr>
          {:else}
            <tr>
              <td>
                {#if modalidade.imagemUrl}
                  <img src={modalidade.imagemUrl} alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px;display:block;" />
                {:else}
                  <div style="width:48px;height:48px;border-radius:8px;background:var(--surface-2);display:grid;place-items:center;color:var(--text-mute);font-size:10px;">—</div>
                {/if}
              </td>
              <td style="color: var(--text); font-weight: 600;">{modalidade.nome}</td>
              <td class="muted">{modalidade.descricao}</td>
              <td>{modalidade._count.classGroups}</td>
              <td>
                {#if modalidade.ativo}
                  <span class="badge badge--active">Ativo</span>
                {:else}
                  <span class="badge">Inativo</span>
                {/if}
              </td>
              <td>
                <div class="actions">
                  <button class="btn--icon" onclick={() => startEdit(modalidade)} aria-label="Editar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                  <form method="POST" action="?/delete" use:enhance style="display:inline;">
                    <input type="hidden" name="id" value={modalidade.id} />
                    <button type="submit" class="btn--icon is-danger" aria-label="Excluir"
                      onclick={(e) => { if (!confirm('Excluir esta modalidade?')) e.preventDefault(); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
{/if}
