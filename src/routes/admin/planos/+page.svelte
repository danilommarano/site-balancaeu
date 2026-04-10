<!-- Pulso — Admin: Planos -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import FormFeedback from '$lib/components/admin/FormFeedback.svelte';

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
  <title>Planos — Admin — Pulso</title>
</svelte:head>

<div>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Planos</h1>
      <p class="text-zinc-500 text-sm">{data.planos.length} plano(s) cadastrado(s)</p>
    </div>
    <button
      onclick={() => showCreateForm = !showCreateForm}
      class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
    >
      <span class="material-symbols-outlined text-[18px]">{showCreateForm ? 'close' : 'add'}</span>
      {showCreateForm ? 'Cancelar' : 'Novo Plano'}
    </button>
  </div>

  <FormFeedback {form} />

  {#if showCreateForm}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <h2 class="text-sm font-semibold text-white mb-4">Novo Plano</h2>
      <form method="POST" action="?/create" use:enhance={() => { return async ({ update }) => { await update(); showCreateForm = false; }; }}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label for="c-nome" class="block text-xs text-zinc-400 mb-1.5">Nome</label>
            <input id="c-nome" name="nome" type="text" required placeholder="Ex: Plano Básico"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-desc" class="block text-xs text-zinc-400 mb-1.5">Descrição</label>
            <input id="c-desc" name="descricao" type="text" required placeholder="Breve descrição"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-preco" class="block text-xs text-zinc-400 mb-1.5">Preço (R$)</label>
            <input id="c-preco" name="preco" type="number" required min="0" step="0.01" placeholder="150.00"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-max" class="block text-xs text-zinc-400 mb-1.5">Máx. aulas/semana</label>
            <input id="c-max" name="maxAulasSemana" type="number" required min="1" value="2"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
          </div>
          <div class="flex items-end">
            <label class="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer pb-2">
              <input type="checkbox" name="permiteParticular" class="accent-primary" />
              Permite aula particular
            </label>
          </div>
        </div>
        <button type="submit" class="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Criar Plano</button>
      </form>
    </div>
  {/if}

  <!-- Cards -->
  {#if data.planos.length === 0}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
      <span class="material-symbols-outlined text-4xl text-zinc-700 mb-3 block">credit_card</span>
      <p class="text-zinc-500 text-sm">Nenhum plano cadastrado.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each data.planos as plano}
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors {!plano.ativo ? 'opacity-50' : ''}">
          {#if editingId === plano.id}
            <!-- Inline Edit Form -->
            <form method="POST" action="?/update" use:enhance={() => { return async ({ update }) => { await update(); editingId = null; }; }} class="p-6">
              <input type="hidden" name="id" value={plano.id} />
              <input type="hidden" name="ativo" value={editAtivo.toString()} />
              <div class="space-y-3 mb-4">
                <div>
                  <label for="edit-plan-nome" class="block text-[10px] text-zinc-500 mb-1">Nome</label>
                  <input id="edit-plan-nome" name="nome" type="text" required bind:value={editNome}
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label for="edit-plan-descricao" class="block text-[10px] text-zinc-500 mb-1">Descrição</label>
                  <input id="edit-plan-descricao" name="descricao" type="text" required bind:value={editDescricao}
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label for="edit-plan-preco" class="block text-[10px] text-zinc-500 mb-1">Preço (R$)</label>
                    <input id="edit-plan-preco" name="preco" type="number" required min="0" step="0.01" bind:value={editPreco}
                      class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label for="edit-plan-maxaulas" class="block text-[10px] text-zinc-500 mb-1">Máx. aulas/sem</label>
                    <input id="edit-plan-maxaulas" name="maxAulasSemana" type="number" required min="1" bind:value={editMaxAulas}
                      class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input type="checkbox" name="permiteParticular" bind:checked={editPermiteParticular} class="accent-primary" />
                    Permite particular
                  </label>
                  <label class="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input type="checkbox" bind:checked={editAtivo} class="accent-emerald-500" />
                    Ativo
                  </label>
                </div>
              </div>
              <div class="flex gap-2">
                <button type="submit" class="flex-1 bg-primary text-white py-1.5 rounded-lg text-xs font-medium hover:opacity-90">Salvar</button>
                <button type="button" onclick={cancelEdit} class="flex-1 bg-zinc-800 text-zinc-400 py-1.5 rounded-lg text-xs hover:bg-zinc-700">Cancelar</button>
              </div>
            </form>
          {:else}
            <!-- Display Card -->
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-bold text-white">{plano.nome}</h3>
                  <p class="text-xs text-zinc-500 mt-1">{plano.descricao}</p>
                </div>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider {plano.ativo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}">
                  {plano.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div class="mb-4">
                <span class="text-3xl font-bold text-white">{formatCurrency(plano.preco)}</span>
                <span class="text-zinc-500 text-sm">/mês</span>
              </div>

              <div class="space-y-2 mb-6 text-sm">
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">event_repeat</span>
                  {plano.maxAulasSemana >= 99 ? 'Aulas ilimitadas' : `${plano.maxAulasSemana} aulas/semana`}
                </div>
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">{plano.permiteParticular ? 'check_circle' : 'cancel'}</span>
                  {plano.permiteParticular ? 'Permite aula particular' : 'Sem aula particular'}
                </div>
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">group</span>
                  {plano._count.subscriptions} assinante(s)
                </div>
              </div>

              <div class="flex items-center gap-2 pt-3 border-t border-zinc-800">
                <button onclick={() => startEdit(plano)} class="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Editar">
                  <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <form method="POST" action="?/delete" use:enhance class="ml-auto">
                  <input type="hidden" name="id" value={plano.id} />
                  <button type="submit" class="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Excluir"
                    onclick={(e) => { if (!confirm('Excluir este plano?')) e.preventDefault(); }}>
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </form>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
