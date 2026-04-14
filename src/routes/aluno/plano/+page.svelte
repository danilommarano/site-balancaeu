<!-- BalancaEu — Meu Plano (Fase 10) -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let confirmAction = $state<{ type: string; planId?: string; planNome?: string; subId?: string } | null>(null);

  const statusLabels: Record<string, { label: string; color: string }> = {
    ATIVA: { label: 'Ativa', color: 'text-emerald-400 bg-emerald-400/10' },
    CANCELADA: { label: 'Cancelada', color: 'text-red-400 bg-red-400/10' },
    PAUSADA: { label: 'Pausada', color: 'text-amber-400 bg-amber-400/10' },
    EXPIRADA: { label: 'Expirada', color: 'text-zinc-400 bg-zinc-400/10' }
  };

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function getActionForPlan(plano: { id: string; preco: number }): { action: string; label: string; icon: string; color: string } | null {
    if (!data.assinaturaAtiva) {
      return { action: 'assinar', label: 'Assinar', icon: 'shopping_cart', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' };
    }
    if (plano.id === data.assinaturaAtiva.plano.id) return null;
    if (plano.preco > data.assinaturaAtiva.plano.preco) {
      return { action: 'trocar', label: 'Upgrade', icon: 'arrow_upward', color: 'bg-blue-600 hover:bg-blue-700 text-white' };
    }
    return { action: 'trocar', label: 'Downgrade', icon: 'arrow_downward', color: 'bg-amber-600/15 hover:bg-amber-600/25 text-amber-400' };
  }
</script>

<svelte:head>
  <title>Meu Plano — BalancaEu</title>
</svelte:head>

<div>
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white mb-1">Meu Plano</h1>
    <p class="text-zinc-500 text-sm">Gerencie sua assinatura e compare planos disponíveis</p>
  </div>

  <!-- Feedback -->
  {#if form?.success}
    <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-4 py-3 mb-6 text-sm">
      <span class="material-symbols-outlined text-[18px]">check_circle</span>
      {form.message}
    </div>
  {/if}
  {#if form?.error}
    <div class="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
      <span class="material-symbols-outlined text-[18px]">error</span>
      {form.error}
    </div>
  {/if}

  <!-- Assinatura Atual -->
  {#if data.assinaturaAtiva}
    {@const sub = data.assinaturaAtiva}
    {@const st = statusLabels[sub.status] ?? statusLabels.ATIVA}
    <div class="bg-zinc-900 border border-emerald-600/30 rounded-xl overflow-hidden mb-8">
      <div class="p-6">
        <div class="flex items-start justify-between mb-6">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-xl font-bold text-white">{sub.plano.nome}</h2>
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full {st.color}">{st.label}</span>
            </div>
            <p class="text-sm text-zinc-400">{sub.plano.descricao}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-emerald-400">R$ {sub.plano.preco.toFixed(2)}</p>
            <p class="text-xs text-zinc-500">por mês</p>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div class="bg-zinc-800/50 rounded-lg p-3">
            <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Aulas/semana</span>
            <p class="text-lg font-bold text-white mt-1">{sub.plano.maxAulasSemana}</p>
          </div>
          <div class="bg-zinc-800/50 rounded-lg p-3">
            <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Aula particular</span>
            <p class="text-lg font-bold mt-1 {sub.plano.permiteParticular ? 'text-emerald-400' : 'text-zinc-500'}">
              {sub.plano.permiteParticular ? 'Sim' : 'Não'}
            </p>
          </div>
          <div class="bg-zinc-800/50 rounded-lg p-3">
            <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Início</span>
            <p class="text-sm font-medium text-white mt-1">{formatDate(sub.inicio)}</p>
          </div>
          <div class="bg-zinc-800/50 rounded-lg p-3">
            <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Vigência</span>
            <p class="text-sm font-medium text-white mt-1">{sub.fim ? formatDate(sub.fim) : 'Recorrente'}</p>
          </div>
        </div>

        <button
          onclick={() => confirmAction = { type: 'cancelar', subId: sub.id, planNome: sub.plano.nome }}
          class="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors"
        >
          <span class="material-symbols-outlined text-[14px]">cancel</span>
          Cancelar assinatura
        </button>
      </div>
    </div>
  {:else}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center mb-8">
      <span class="material-symbols-outlined text-5xl text-zinc-700 mb-3">credit_card_off</span>
      <h2 class="text-lg font-semibold text-white mb-1">Sem assinatura ativa</h2>
      <p class="text-zinc-500 text-sm mb-4">Escolha um plano abaixo para começar.</p>
    </div>
  {/if}

  <!-- Planos Disponíveis -->
  <div class="mb-8">
    <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <span class="material-symbols-outlined text-[20px] text-purple-400">compare</span>
      Planos Disponíveis
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {#each data.planos as plano}
        {@const isAtual = data.assinaturaAtiva?.plano.id === plano.id}
        {@const actionInfo = getActionForPlan(plano)}
        <div class="bg-zinc-900 border rounded-xl overflow-hidden {isAtual ? 'border-emerald-600/50' : 'border-zinc-800'} flex flex-col">
          {#if isAtual}
            <div class="bg-emerald-600/15 text-center py-1.5">
              <span class="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Plano Atual</span>
            </div>
          {/if}
          <div class="p-5 flex-1 flex flex-col">
            <h3 class="text-base font-semibold text-white mb-1">{plano.nome}</h3>
            <p class="text-xs text-zinc-500 mb-4">{plano.descricao}</p>
            <p class="text-2xl font-bold text-white mb-4">
              R$ {plano.preco.toFixed(2)}
              <span class="text-xs font-normal text-zinc-500">/mês</span>
            </p>
            <ul class="space-y-2 text-sm mb-5">
              <li class="flex items-center gap-2 text-zinc-300">
                <span class="material-symbols-outlined text-[16px] text-emerald-400">check</span>
                {plano.maxAulasSemana} aulas por semana
              </li>
              <li class="flex items-center gap-2 {plano.permiteParticular ? 'text-zinc-300' : 'text-zinc-600'}">
                <span class="material-symbols-outlined text-[16px] {plano.permiteParticular ? 'text-emerald-400' : 'text-zinc-600'}">{plano.permiteParticular ? 'check' : 'close'}</span>
                Aulas particulares
              </li>
            </ul>

            <div class="mt-auto">
              {#if isAtual}
                <p class="text-xs text-emerald-400/70 flex items-center gap-1 justify-center">
                  <span class="material-symbols-outlined text-[14px]">check</span>
                  Seu plano atual
                </p>
              {:else if actionInfo}
                <button
                  onclick={() => confirmAction = { type: actionInfo.action, planId: plano.id, planNome: plano.nome }}
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors {actionInfo.color}"
                >
                  <span class="material-symbols-outlined text-[16px]">{actionInfo.icon}</span>
                  {actionInfo.label}
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
    {#if data.planos.length === 0}
      <p class="text-zinc-500 text-sm text-center py-4">Nenhum plano disponível no momento.</p>
    {/if}
  </div>

  <!-- Info boxes -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
      <span class="material-symbols-outlined text-blue-400 text-[20px] mt-0.5">arrow_upward</span>
      <div>
        <p class="text-xs font-medium text-white">Upgrade</p>
        <p class="text-[11px] text-zinc-500 mt-0.5">Efeito imediato. Você paga apenas a diferença pro-rata dos dias restantes do ciclo.</p>
      </div>
    </div>
    <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
      <span class="material-symbols-outlined text-amber-400 text-[20px] mt-0.5">arrow_downward</span>
      <div>
        <p class="text-xs font-medium text-white">Downgrade</p>
        <p class="text-[11px] text-zinc-500 mt-0.5">Entra em vigor no próximo ciclo. Você mantém os benefícios atuais até lá.</p>
      </div>
    </div>
  </div>

  <!-- Histórico de Assinaturas -->
  {#if data.historico.length > 1}
    <details>
      <summary class="text-xs text-zinc-500 cursor-pointer hover:text-zinc-400 transition-colors mb-3">
        Histórico de Assinaturas ({data.historico.length})
      </summary>
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                <th class="px-5 py-3">Plano</th>
                <th class="px-5 py-3">Status</th>
                <th class="px-5 py-3">Início</th>
                <th class="px-5 py-3">Fim</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/50">
              {#each data.historico as sub}
                {@const st = statusLabels[sub.status] ?? statusLabels.ATIVA}
                <tr class="hover:bg-zinc-800/30 transition-colors">
                  <td class="px-5 py-3 text-white font-medium">{sub.plano}</td>
                  <td class="px-5 py-3">
                    <span class="text-[11px] font-medium px-2 py-0.5 rounded-full {st.color}">{st.label}</span>
                  </td>
                  <td class="px-5 py-3 text-zinc-400">{formatDate(sub.inicio)}</td>
                  <td class="px-5 py-3 text-zinc-400">{sub.fim ? formatDate(sub.fim) : '—'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  {/if}
</div>

<!-- Confirmation Modal -->
{#if confirmAction}
  <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden">
      <div class="p-6">
        {#if confirmAction.type === 'cancelar'}
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-600/15 flex items-center justify-center">
              <span class="material-symbols-outlined text-red-400">warning</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-white">Cancelar assinatura</h3>
              <p class="text-xs text-zinc-500">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          <p class="text-sm text-zinc-400 mb-6">
            Ao cancelar o plano <strong class="text-white">{confirmAction.planNome}</strong>, todas as suas inscrições em turmas serão canceladas automaticamente. Um crédito pro-rata será registrado caso haja dias restantes no ciclo.
          </p>
          <div class="flex gap-3">
            <button
              onclick={() => confirmAction = null}
              class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >Voltar</button>
            <form method="POST" action="?/cancelar" use:enhance={() => { return async ({ update }) => { confirmAction = null; await update(); }; }} class="flex-1">
              <input type="hidden" name="subscriptionId" value={confirmAction.subId} />
              <button type="submit" class="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
                Confirmar Cancelamento
              </button>
            </form>
          </div>

        {:else if confirmAction.type === 'trocar'}
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-blue-600/15 flex items-center justify-center">
              <span class="material-symbols-outlined text-blue-400">swap_vert</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-white">Trocar de plano</h3>
              <p class="text-xs text-zinc-500">Efeito imediato</p>
            </div>
          </div>
          <p class="text-sm text-zinc-400 mb-6">
            Deseja mudar para o plano <strong class="text-white">{confirmAction.planNome}</strong>? A diferença pro-rata será calculada proporcionalmente aos dias restantes do ciclo.
          </p>
          <div class="flex gap-3">
            <button
              onclick={() => confirmAction = null}
              class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >Voltar</button>
            <form method="POST" action="?/trocar" use:enhance={() => { return async ({ update }) => { confirmAction = null; await update(); }; }} class="flex-1">
              <input type="hidden" name="planId" value={confirmAction.planId} />
              <button type="submit" class="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Confirmar Troca
              </button>
            </form>
          </div>

        {:else if confirmAction.type === 'assinar'}
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-emerald-600/15 flex items-center justify-center">
              <span class="material-symbols-outlined text-emerald-400">shopping_cart</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-white">Assinar plano</h3>
              <p class="text-xs text-zinc-500">Ativação imediata</p>
            </div>
          </div>
          <p class="text-sm text-zinc-400 mb-6">
            Deseja assinar o plano <strong class="text-white">{confirmAction.planNome}</strong>? A primeira mensalidade será registrada imediatamente.
          </p>
          <div class="flex gap-3">
            <button
              onclick={() => confirmAction = null}
              class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >Voltar</button>
            <form method="POST" action="?/assinar" use:enhance={() => { return async ({ update }) => { confirmAction = null; await update(); }; }} class="flex-1">
              <input type="hidden" name="planId" value={confirmAction.planId} />
              <button type="submit" class="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                Confirmar Assinatura
              </button>
            </form>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
