<!-- BalancaEu — Admin: Eventos -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import FormFeedback from '$lib/components/admin/FormFeedback.svelte';

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
  <title>Eventos — Admin — BalancaEu</title>
</svelte:head>

<div>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Eventos</h1>
      <p class="text-zinc-500 text-sm">{data.eventos.length} evento(s)</p>
    </div>
    <button
      onclick={() => showCreateForm = !showCreateForm}
      class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
    >
      <span class="material-symbols-outlined text-[18px]">{showCreateForm ? 'close' : 'add'}</span>
      {showCreateForm ? 'Cancelar' : 'Novo Evento'}
    </button>
  </div>

  <FormFeedback {form} />

  {#if showCreateForm}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <h2 class="text-sm font-semibold text-white mb-4">Novo Evento</h2>
      <form method="POST" action="?/create" use:enhance={() => { return async ({ update }) => { await update(); showCreateForm = false; }; }}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label for="c-titulo" class="block text-xs text-zinc-400 mb-1.5">Título</label>
            <input id="c-titulo" name="titulo" type="text" required placeholder="Nome do evento"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-data" class="block text-xs text-zinc-400 mb-1.5">Data</label>
            <input id="c-data" name="data" type="date" required
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-horario" class="block text-xs text-zinc-400 mb-1.5">Horário</label>
            <input id="c-horario" name="horario" type="text" required placeholder="19:00 - 22:00"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-local" class="block text-xs text-zinc-400 mb-1.5">Local</label>
            <input id="c-local" name="local" type="text" required placeholder="Local do evento"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-preco" class="block text-xs text-zinc-400 mb-1.5">Preço (R$) — vazio = gratuito</label>
            <input id="c-preco" name="preco" type="number" min="0" step="0.01" placeholder="0.00"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div class="md:col-span-2 lg:col-span-1">
            <label for="c-desc" class="block text-xs text-zinc-400 mb-1.5">Descrição</label>
            <input id="c-desc" name="descricao" type="text" required placeholder="Breve descrição"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
        </div>
        <button type="submit" class="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Criar Evento</button>
      </form>
    </div>
  {/if}

  <!-- Cards -->
  {#if data.eventos.length === 0}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
      <span class="material-symbols-outlined text-4xl text-zinc-700 mb-3 block">event</span>
      <p class="text-zinc-500 text-sm">Nenhum evento cadastrado.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each data.eventos as evento}
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors {!evento.ativo ? 'opacity-50' : ''}">
          {#if editingId === evento.id}
            <!-- Inline Edit Form -->
            <form method="POST" action="?/update" use:enhance={() => { return async ({ update }) => { await update(); editingId = null; }; }} class="p-5">
              <input type="hidden" name="id" value={evento.id} />
              <div class="space-y-3 mb-4">
                <div>
                  <label for="edit-titulo" class="block text-[10px] text-zinc-500 mb-1">Título</label>
                  <input id="edit-titulo" name="titulo" type="text" required bind:value={editTitulo}
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label for="edit-data" class="block text-[10px] text-zinc-500 mb-1">Data</label>
                    <input id="edit-data" name="data" type="date" required bind:value={editData}
                      class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label for="edit-horario" class="block text-[10px] text-zinc-500 mb-1">Horário</label>
                    <input id="edit-horario" name="horario" type="text" required bind:value={editHorario}
                      class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label for="edit-local" class="block text-[10px] text-zinc-500 mb-1">Local</label>
                  <input id="edit-local" name="local" type="text" required bind:value={editLocal}
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label for="edit-preco" class="block text-[10px] text-zinc-500 mb-1">Preço (R$)</label>
                  <input id="edit-preco" name="preco" type="number" min="0" step="0.01" bind:value={editPreco}
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label for="edit-descricao" class="block text-[10px] text-zinc-500 mb-1">Descrição</label>
                  <textarea id="edit-descricao" name="descricao" required rows="2" bind:value={editDescricao}
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary resize-none"></textarea>
                </div>
              </div>
              <div class="flex gap-2">
                <button type="submit" class="flex-1 bg-primary text-white py-1.5 rounded-lg text-xs font-medium hover:opacity-90">Salvar</button>
                <button type="button" onclick={cancelEdit} class="flex-1 bg-zinc-800 text-zinc-400 py-1.5 rounded-lg text-xs hover:bg-zinc-700">Cancelar</button>
              </div>
            </form>
          {:else}
            <!-- Display Card -->
            <div class="p-5">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="bg-primary/10 rounded-xl p-3 text-center min-w-[56px]">
                    <span class="text-lg font-bold text-primary block leading-none">{new Date(evento.data).getDate()}</span>
                    <span class="text-[10px] uppercase text-primary/70">{new Date(evento.data).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-white">{evento.titulo}</h3>
                    <p class="text-xs text-zinc-500">{evento.horario}</p>
                  </div>
                </div>
                {#if isPast(evento.data)}
                  <span class="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">Passado</span>
                {:else}
                  <span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Próximo</span>
                {/if}
              </div>

              <p class="text-xs text-zinc-400 mb-3 line-clamp-2">{evento.descricao}</p>

              <div class="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">location_on</span>
                  {evento.local}
                </div>
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">payments</span>
                  {formatCurrency(evento.preco)}
                </div>
              </div>

              <div class="flex items-center gap-2 pt-3 border-t border-zinc-800">
                <form method="POST" action="?/toggleActive" use:enhance class="mr-auto">
                  <input type="hidden" name="id" value={evento.id} />
                  <input type="hidden" name="ativo" value={(!evento.ativo).toString()} />
                  <button type="submit" class="text-xs {evento.ativo ? 'text-zinc-500 hover:text-amber-400' : 'text-zinc-600 hover:text-emerald-400'} transition-colors">
                    {evento.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </form>
                <button onclick={() => startEdit(evento)} class="p-1 rounded text-zinc-500 hover:text-blue-400 transition-colors" title="Editar">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <form method="POST" action="?/delete" use:enhance>
                  <input type="hidden" name="id" value={evento.id} />
                  <button type="submit" class="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors" title="Excluir"
                    onclick={(e) => { if (!confirm('Excluir este evento?')) e.preventDefault(); }}>
                    <span class="material-symbols-outlined text-[16px]">delete</span>
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
