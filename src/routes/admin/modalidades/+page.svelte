<!-- Pulso — Admin: Modalidades -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import FormFeedback from '$lib/components/admin/FormFeedback.svelte';

  let { data, form } = $props();

  let showCreateForm = $state(false);
  let editingId = $state<string | null>(null);
  let editNome = $state('');
  let editDescricao = $state('');
  let editAtivo = $state(true);

  function startEdit(m: { id: string; nome: string; descricao: string; ativo: boolean }) {
    editingId = m.id;
    editNome = m.nome;
    editDescricao = m.descricao;
    editAtivo = m.ativo;
  }

  function cancelEdit() {
    editingId = null;
  }
</script>

<svelte:head>
  <title>Modalidades — Admin — Pulso</title>
</svelte:head>

<div>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Modalidades</h1>
      <p class="text-zinc-500 text-sm">{data.modalidades.length} modalidade(s) cadastrada(s)</p>
    </div>
    <button
      onclick={() => showCreateForm = !showCreateForm}
      class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
    >
      <span class="material-symbols-outlined text-[18px]">{showCreateForm ? 'close' : 'add'}</span>
      {showCreateForm ? 'Cancelar' : 'Nova Modalidade'}
    </button>
  </div>

  <FormFeedback {form} />

  <!-- Create form -->
  {#if showCreateForm}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <h2 class="text-sm font-semibold text-white mb-4">Nova Modalidade</h2>
      <form method="POST" action="?/create" use:enhance={() => { return async ({ update }) => { await update(); showCreateForm = false; }; }}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="create-nome" class="block text-xs text-zinc-400 mb-1.5">Nome</label>
            <input id="create-nome" name="nome" type="text" required placeholder="Ex: Forró Roots"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="create-descricao" class="block text-xs text-zinc-400 mb-1.5">Descrição</label>
            <input id="create-descricao" name="descricao" type="text" required placeholder="Breve descrição da modalidade"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
        </div>
        <button type="submit" class="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          Criar Modalidade
        </button>
      </form>
    </div>
  {/if}

  <!-- Table -->
  <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
    {#if data.modalidades.length === 0}
      <div class="p-10 text-center">
        <span class="material-symbols-outlined text-4xl text-zinc-700 mb-3 block">sports_martial_arts</span>
        <p class="text-zinc-500 text-sm">Nenhuma modalidade cadastrada.</p>
        <p class="text-zinc-600 text-xs mt-1">Clique em "Nova Modalidade" para começar.</p>
      </div>
    {:else}
      <table class="w-full">
        <thead>
          <tr class="border-b border-zinc-800">
            <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Nome</th>
            <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium hidden md:table-cell">Descrição</th>
            <th class="text-center text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Turmas</th>
            <th class="text-center text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Status</th>
            <th class="text-right text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800">
          {#each data.modalidades as modalidade}
            {#if editingId === modalidade.id}
              <tr class="bg-zinc-800/50">
                <td colspan="5" class="px-5 py-4">
                  <form method="POST" action="?/update" use:enhance={() => { return async ({ update }) => { await update(); editingId = null; }; }}>
                    <input type="hidden" name="id" value={modalidade.id} />
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <input name="nome" type="text" required bind:value={editNome}
                        class="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                      <input name="descricao" type="text" required bind:value={editDescricao}
                        class="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                      <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                          <input type="checkbox" bind:checked={editAtivo} class="accent-primary" />
                          Ativo
                        </label>
                        <input type="hidden" name="ativo" value={editAtivo.toString()} />
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button type="submit" class="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:opacity-90">Salvar</button>
                      <button type="button" onclick={cancelEdit} class="bg-zinc-700 text-zinc-300 px-4 py-1.5 rounded-lg text-xs hover:bg-zinc-600">Cancelar</button>
                    </div>
                  </form>
                </td>
              </tr>
            {:else}
              <tr class="hover:bg-zinc-800/30 transition-colors">
                <td class="px-5 py-3">
                  <span class="text-sm text-white font-medium">{modalidade.nome}</span>
                </td>
                <td class="px-5 py-3 hidden md:table-cell">
                  <span class="text-sm text-zinc-400 line-clamp-1">{modalidade.descricao}</span>
                </td>
                <td class="px-5 py-3 text-center">
                  <span class="text-sm text-zinc-300">{modalidade._count.classGroups}</span>
                </td>
                <td class="px-5 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider {modalidade.ativo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}">
                    {modalidade.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td class="px-5 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button onclick={() => startEdit(modalidade)} class="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors" title="Editar">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <form method="POST" action="?/delete" use:enhance={() => { return async ({ update }) => { await update(); }; }}>
                      <input type="hidden" name="id" value={modalidade.id} />
                      <button type="submit" class="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Excluir"
                        onclick={(e) => { if (!confirm('Excluir esta modalidade?')) e.preventDefault(); }}>
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
