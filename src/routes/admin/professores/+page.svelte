<!-- BalancaEu — Admin: Professores -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import FormFeedback from '$lib/components/admin/FormFeedback.svelte';

  let { data, form } = $props();
  let showCreateForm = $state(false);
  let editingId = $state<string | null>(null);
  let editNome = $state('');
  let editEmail = $state('');
  let editTelefone = $state('');
  let editBio = $state('');
  let editModalidades = $state<string[]>([]);
  let editAtivo = $state(true);

  function startEdit(p: { id: string; nome: string; email: string; telefone: string | null; ativo: boolean; teacher: { bio: string | null; especialidades: string[]; modalities: { id: string; nome: string }[] } | null }) {
    editingId = p.id;
    editNome = p.nome;
    editEmail = p.email;
    editTelefone = p.telefone ?? '';
    editBio = p.teacher?.bio ?? '';
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
  <title>Professores — Admin — BalancaEu</title>
</svelte:head>

<div>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Professores</h1>
      <p class="text-zinc-500 text-sm">{data.professores.length} professor(es) cadastrado(s)</p>
    </div>
    <button
      onclick={() => showCreateForm = !showCreateForm}
      class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
    >
      <span class="material-symbols-outlined text-[18px]">{showCreateForm ? 'close' : 'add'}</span>
      {showCreateForm ? 'Cancelar' : 'Novo Professor'}
    </button>
  </div>

  <FormFeedback {form} />

  {#if showCreateForm}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <h2 class="text-sm font-semibold text-white mb-4">Novo Professor</h2>
      <form method="POST" action="?/create" use:enhance={() => { return async ({ update }) => { await update(); showCreateForm = false; }; }}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label for="c-nome" class="block text-xs text-zinc-400 mb-1.5">Nome completo</label>
            <input id="c-nome" name="nome" type="text" required placeholder="Nome do professor"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-email" class="block text-xs text-zinc-400 mb-1.5">Email</label>
            <input id="c-email" name="email" type="email" required placeholder="email@escola.com"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-senha" class="block text-xs text-zinc-400 mb-1.5">Senha inicial</label>
            <input id="c-senha" name="senha" type="text" required value="prof123"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-tel" class="block text-xs text-zinc-400 mb-1.5">Telefone</label>
            <input id="c-tel" name="telefone" type="text" placeholder="(11) 99999-0000"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-bio" class="block text-xs text-zinc-400 mb-1.5">Bio</label>
            <input id="c-bio" name="bio" type="text" placeholder="Breve biografia"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <span class="block text-xs text-zinc-400 mb-1.5">Modalidades</span>
            {#if data.modalidades.length === 0}
              <p class="text-xs text-zinc-600">Nenhuma modalidade cadastrada.</p>
            {:else}
              <div class="flex flex-wrap gap-2">
                {#each data.modalidades as mod}
                  <label class="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-300 cursor-pointer hover:border-zinc-600 has-[:checked]:border-primary has-[:checked]:text-white transition-colors">
                    <input type="checkbox" name="modalityIds" value={mod.id} class="accent-emerald-500 w-3.5 h-3.5" />
                    {mod.nome}
                  </label>
                {/each}
              </div>
            {/if}
          </div>
        </div>
        <button type="submit" class="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Criar Professor</button>
      </form>
    </div>
  {/if}

  <!-- Cards -->
  {#if data.professores.length === 0}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
      <span class="material-symbols-outlined text-4xl text-zinc-700 mb-3 block">school</span>
      <p class="text-zinc-500 text-sm">Nenhum professor cadastrado.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each data.professores as prof}
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors {!prof.ativo ? 'opacity-50' : ''}">
          {#if editingId === prof.id}
            <!-- Inline Edit Form -->
            <form method="POST" action="?/update" use:enhance={() => { return async ({ update }) => { await update(); editingId = null; }; }} class="p-5">
              <input type="hidden" name="id" value={prof.id} />
              <input type="hidden" name="ativo" value={editAtivo.toString()} />
              <div class="space-y-3 mb-4">
                <div>
                  <label for="edit-nome" class="block text-[10px] text-zinc-500 mb-1">Nome</label>
                  <input id="edit-nome" name="nome" type="text" required bind:value={editNome}
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label for="edit-email" class="block text-[10px] text-zinc-500 mb-1">Email</label>
                  <input id="edit-email" name="email" type="email" required bind:value={editEmail}
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label for="edit-telefone" class="block text-[10px] text-zinc-500 mb-1">Telefone</label>
                  <input id="edit-telefone" name="telefone" type="text" bind:value={editTelefone}
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label for="edit-bio" class="block text-[10px] text-zinc-500 mb-1">Bio</label>
                  <textarea id="edit-bio" name="bio" rows="2" bind:value={editBio}
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary resize-none"></textarea>
                </div>
                <div>
                  <span class="block text-[10px] text-zinc-500 mb-1">Modalidades</span>
                  {#if data.modalidades.length === 0}
                    <p class="text-[10px] text-zinc-600">Nenhuma modalidade cadastrada.</p>
                  {:else}
                    <div class="flex flex-wrap gap-1.5">
                      {#each data.modalidades as mod}
                        <label class="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-300 cursor-pointer hover:border-zinc-600 has-[:checked]:border-primary has-[:checked]:text-white transition-colors">
                          <input type="checkbox" name="modalityIds" value={mod.id} checked={editModalidades.includes(mod.id)} onchange={() => toggleEditModalidade(mod.id)} class="accent-emerald-500 w-3 h-3" />
                          {mod.nome}
                        </label>
                      {/each}
                    </div>
                  {/if}
                </div>
                <label class="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input type="checkbox" bind:checked={editAtivo} class="accent-emerald-500" />
                  Ativo
                </label>
              </div>
              <div class="flex gap-2">
                <button type="submit" class="flex-1 bg-primary text-white py-1.5 rounded-lg text-xs font-medium hover:opacity-90">Salvar</button>
                <button type="button" onclick={cancelEdit} class="flex-1 bg-zinc-800 text-zinc-400 py-1.5 rounded-lg text-xs hover:bg-zinc-700">Cancelar</button>
              </div>
            </form>
          {:else}
            <!-- Display Card -->
            <div class="p-5">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                    <span class="material-symbols-outlined text-amber-400">school</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">{prof.nome}</p>
                    <p class="text-xs text-zinc-500">{prof.email}</p>
                  </div>
                </div>
                <form method="POST" action="?/toggleActive" use:enhance>
                  <input type="hidden" name="id" value={prof.id} />
                  <input type="hidden" name="ativo" value={(!prof.ativo).toString()} />
                  <button type="submit" class="p-1 rounded text-xs {prof.ativo ? 'text-emerald-400 hover:text-red-400' : 'text-zinc-500 hover:text-emerald-400'}" title={prof.ativo ? 'Desativar' : 'Ativar'}>
                    <span class="material-symbols-outlined text-[18px]">{prof.ativo ? 'toggle_on' : 'toggle_off'}</span>
                  </button>
                </form>
              </div>

              {#if prof.telefone}
                <div class="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                  <span class="material-symbols-outlined text-[14px]">phone</span>
                  {prof.telefone}
                </div>
              {/if}

              {#if prof.teacher?.bio}
                <p class="text-xs text-zinc-400 mb-3 line-clamp-2">{prof.teacher.bio}</p>
              {/if}

              <div class="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800">
                {#if prof.teacher?.modalities && prof.teacher.modalities.length > 0}
                  <div class="flex flex-wrap gap-1">
                    {#each prof.teacher.modalities.slice(0, 3) as mod}
                      <span class="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[10px]">{mod.nome}</span>
                    {/each}
                    {#if prof.teacher.modalities.length > 3}
                      <span class="text-zinc-600 text-[10px]">+{prof.teacher.modalities.length - 3}</span>
                    {/if}
                  </div>
                {:else}
                  <span class="text-[10px] text-zinc-600">Sem modalidades</span>
                {/if}
                <div class="flex items-center gap-1">
                  <button onclick={() => startEdit(prof)} class="p-1 rounded text-zinc-500 hover:text-blue-400 transition-colors" title="Editar">
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <span class="text-[10px] text-zinc-600">{prof._count.professorClasses} turma(s)</span>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
