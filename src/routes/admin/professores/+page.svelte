<!-- BalancaEu — Admin: Professores -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import ImageUpload from '$lib/components/admin/ImageUpload.svelte';

  let { data, form } = $props();
  let showCreateForm = $state(false);
  let createImagemUrl = $state<string | null>(null);
  let editingId = $state<string | null>(null);
  let editNome = $state('');
  let editEmail = $state('');
  let editTelefone = $state('');
  let editBio = $state('');
  let editImagemUrl = $state<string | null>(null);
  let editModalidades = $state<string[]>([]);
  let editAtivo = $state(true);

  function startEdit(p: { id: string; nome: string; email: string; telefone: string | null; ativo: boolean; teacher: { bio: string | null; imagemUrl: string | null; especialidades: string[]; modalities: { id: string; nome: string }[] } | null }) {
    editingId = p.id;
    editNome = p.nome;
    editEmail = p.email;
    editTelefone = p.telefone ?? '';
    editBio = p.teacher?.bio ?? '';
    editImagemUrl = p.teacher?.imagemUrl ?? null;
    editModalidades = p.teacher?.modalities?.map(m => m.id) ?? [];
    editAtivo = p.ativo;
  }

  function toggleEditModalidade(id: string) {
    if (editModalidades.includes(id)) {
      editModalidades = editModalidades.filter(m => m !== id);
    } else {
      editModalidades = [...editModalidades, id];
    }
  }

  function cancelEdit() {
    editingId = null;
  }
</script>

<svelte:head>
  <title>Professores — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Professores</h1>
    <p class="page-sub">{data.professores.length} professor(es) cadastrado(s)</p>
  </div>
  <button class="btn btn--primary" onclick={() => showCreateForm = !showCreateForm}>
    {#if showCreateForm}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>Cancelar
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>Novo Professor
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
    <h3>Novo Professor</h3>
    <form method="POST" action="?/create" use:enhance={() => async ({ update }) => { await update(); showCreateForm = false; createImagemUrl = null; }}>
      <div class="form-grid">
        <div class="field"><label for="cp-nome">Nome completo</label><input id="cp-nome" name="nome" type="text" required placeholder="Nome do professor" /></div>
        <div class="field"><label for="cp-email">Email</label><input id="cp-email" name="email" type="email" required placeholder="email@escola.com" /></div>
        <div class="field"><label for="cp-senha">Senha inicial</label><input id="cp-senha" name="senha" type="text" required value="prof123" /></div>
        <div class="field"><label for="cp-tel">Telefone</label><input id="cp-tel" name="telefone" type="text" placeholder="(11) 99999-0000" /></div>
        <div class="field"><label for="cp-bio">Bio</label><input id="cp-bio" name="bio" type="text" placeholder="Breve biografia" /></div>
        <div class="field">
          <ImageUpload bind:value={createImagemUrl} name="imagemUrl" category="teacher" label="Foto do professor" />
        </div>
        <div class="field" style="grid-column: span 2;">
          <label for="cp-mods">Modalidades</label>
          {#if data.modalidades.length === 0}
            <p class="muted" style="font-size: 12px;">Nenhuma modalidade cadastrada.</p>
          {:else}
            <div id="cp-mods" style="display:flex; flex-wrap:wrap; gap:8px;">
              {#each data.modalidades as mod}
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:6px 10px; border:1px solid var(--line); border-radius:8px; font-size:12px; background:var(--surface);">
                  <input type="checkbox" name="modalityIds" value={mod.id} />
                  {mod.nome}
                </label>
              {/each}
            </div>
          {/if}
        </div>
      </div>
      <div style="margin-top: 16px;">
        <button type="submit" class="btn btn--primary">Criar Professor</button>
      </div>
    </form>
  </div>
{/if}

{#if data.professores.length === 0}
  <div class="empty">
    <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5L2 10z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg></div>
    <p>Nenhum professor cadastrado.</p>
  </div>
{:else}
  <div class="cards-grid">
    {#each data.professores as prof}
      <div class="prof-card">
        {#if editingId === prof.id}
          <form method="POST" action="?/update" use:enhance={() => async ({ update }) => { await update(); editingId = null; }}>
            <input type="hidden" name="id" value={prof.id} />
            <input type="hidden" name="ativo" value={editAtivo.toString()} />
            <div class="form-grid" style="grid-template-columns: 1fr; gap: 10px;">
              <div class="field"><label for="ep-{prof.id}-nome">Nome</label><input id="ep-{prof.id}-nome" name="nome" type="text" required bind:value={editNome} /></div>
              <div class="field"><label for="ep-{prof.id}-email">Email</label><input id="ep-{prof.id}-email" name="email" type="email" required bind:value={editEmail} /></div>
              <div class="field"><label for="ep-{prof.id}-tel">Telefone</label><input id="ep-{prof.id}-tel" name="telefone" type="text" bind:value={editTelefone} /></div>
              <div class="field"><label for="ep-{prof.id}-bio">Bio</label><textarea id="ep-{prof.id}-bio" name="bio" rows="2" bind:value={editBio}></textarea></div>
              <div class="field">
                <ImageUpload bind:value={editImagemUrl} name="imagemUrl" category="teacher" label="Foto do professor" />
              </div>
              <div class="field">
                <label for="ep-{prof.id}-mods">Modalidades</label>
                <div id="ep-{prof.id}-mods" style="display:flex; flex-wrap:wrap; gap:6px;">
                  {#each data.modalidades as mod}
                    <label style="display:flex; align-items:center; gap:4px; cursor:pointer; padding:4px 8px; border:1px solid var(--line); border-radius:6px; font-size:11px; background:var(--surface);">
                      <input type="checkbox" name="modalityIds" value={mod.id} checked={editModalidades.includes(mod.id)} onchange={() => toggleEditModalidade(mod.id)} />
                      {mod.nome}
                    </label>
                  {/each}
                </div>
              </div>
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
          <div class="prof-card__head">
            <div class="prof-card__avatar" style={prof.teacher?.imagemUrl ? `background-image:url(${prof.teacher.imagemUrl}); background-size:cover; background-position:center;` : ''}>
              {#if !prof.teacher?.imagemUrl}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5L2 10z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>
              {/if}
            </div>
            <div class="prof-card__info">
              <div class="prof-card__name">{prof.nome}</div>
              <div class="prof-card__email">{prof.email}</div>
            </div>
            <form method="POST" action="?/toggleActive" use:enhance>
              <input type="hidden" name="id" value={prof.id} />
              <input type="hidden" name="ativo" value={(!prof.ativo).toString()} />
              <button type="submit" class="toggle {prof.ativo ? 'is-on' : ''}" aria-label={prof.ativo ? 'Desativar' : 'Ativar'}></button>
            </form>
          </div>
          {#if prof.teacher?.bio}
            <div class="prof-card__bio">{prof.teacher.bio}</div>
          {/if}
          <div class="prof-card__foot">
            <div class="prof-card__tags">
              {#if prof.teacher?.modalities && prof.teacher.modalities.length > 0}
                {#each prof.teacher.modalities as mod}
                  <span class="badge badge--coral">{mod.nome}</span>
                {/each}
              {:else}
                <span class="muted" style="font-size:11px;">Sem modalidades</span>
              {/if}
            </div>
            <div style="display:flex; gap:10px; align-items:center; color:var(--text-mute); font-size:11.5px;">
              <button class="btn--icon" onclick={() => startEdit(prof)} aria-label="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              {prof._count.professorClasses} turmas
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
