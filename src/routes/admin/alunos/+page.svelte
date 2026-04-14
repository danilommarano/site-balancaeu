<!-- BalancaEu — Admin: Alunos -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import FormFeedback from '$lib/components/admin/FormFeedback.svelte';

  let { data, form } = $props();
  let search = $state('');

  const filtered = $derived(
    search.trim()
      ? data.alunos.filter((a: { nome: string; email: string }) =>
          a.nome.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase())
        )
      : data.alunos
  );
</script>

<svelte:head>
  <title>Alunos — Admin — BalancaEu</title>
</svelte:head>

<div>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Alunos</h1>
      <p class="text-zinc-500 text-sm">{data.alunos.length} aluno(s) cadastrado(s)</p>
    </div>
  </div>

  <FormFeedback {form} />

  <!-- Search -->
  <div class="mb-6">
    <div class="relative">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[20px]">search</span>
      <input
        type="text"
        bind:value={search}
        placeholder="Buscar por nome ou email..."
        class="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary"
      />
    </div>
  </div>

  <!-- Table -->
  <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
    {#if filtered.length === 0}
      <div class="p-10 text-center">
        <span class="material-symbols-outlined text-4xl text-zinc-700 mb-3 block">person</span>
        <p class="text-zinc-500 text-sm">{search ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado.'}</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-zinc-800">
              <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Nome</th>
              <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium hidden md:table-cell">Email</th>
              <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium hidden lg:table-cell">Telefone</th>
              <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Plano</th>
              <th class="text-center text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Turmas</th>
              <th class="text-center text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Status</th>
              <th class="text-right text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800">
            {#each filtered as aluno}
              <tr class="hover:bg-zinc-800/30 transition-colors {!aluno.ativo ? 'opacity-50' : ''}">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined text-zinc-400 text-sm">person</span>
                    </div>
                    <span class="text-sm text-white font-medium">{aluno.nome}</span>
                  </div>
                </td>
                <td class="px-5 py-3 hidden md:table-cell">
                  <span class="text-sm text-zinc-400">{aluno.email}</span>
                </td>
                <td class="px-5 py-3 hidden lg:table-cell">
                  <span class="text-sm text-zinc-400">{aluno.telefone ?? '—'}</span>
                </td>
                <td class="px-5 py-3">
                  {#if aluno.subscriptions.length > 0}
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary uppercase tracking-wider">
                      {aluno.subscriptions[0].plan.nome}
                    </span>
                  {:else}
                    <span class="text-xs text-zinc-600">Sem plano</span>
                  {/if}
                </td>
                <td class="px-5 py-3 text-center">
                  <span class="text-sm text-zinc-300">{aluno._count.enrollments}</span>
                </td>
                <td class="px-5 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider {aluno.ativo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}">
                    {aluno.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td class="px-5 py-3 text-right">
                  <form method="POST" action="?/toggleActive" use:enhance class="inline">
                    <input type="hidden" name="id" value={aluno.id} />
                    <input type="hidden" name="ativo" value={(!aluno.ativo).toString()} />
                    <button type="submit" class="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors" title={aluno.ativo ? 'Desativar' : 'Ativar'}>
                      <span class="material-symbols-outlined text-[18px]">{aluno.ativo ? 'person_off' : 'person_add'}</span>
                    </button>
                  </form>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
