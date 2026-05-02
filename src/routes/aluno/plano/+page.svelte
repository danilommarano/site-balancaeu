<!-- BalancaEu — Meu Plano -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let confirmAction = $state<{ type: string; planId?: string; planNome?: string; subId?: string } | null>(null);

  const statusLabels: Record<string, string> = {
    ATIVA: 'Ativa',
    CANCELADA: 'Cancelada',
    PAUSADA: 'Pausada',
    EXPIRADA: 'Expirada'
  };

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function getActionForPlan(plano: { id: string; preco: number }): { action: string; label: string } | null {
    if (!data.assinaturaAtiva) {
      return { action: 'assinar', label: 'Assinar' };
    }
    if (plano.id === data.assinaturaAtiva.plano.id) return null;
    if (plano.preco > data.assinaturaAtiva.plano.preco) {
      return { action: 'trocar', label: 'Upgrade' };
    }
    return { action: 'trocar', label: 'Downgrade' };
  }

  // Heuristic: featured = highest priced plan that is not the current one (or middle one).
  function isFeatured(plano: { id: string }, idx: number, total: number): boolean {
    if (data.assinaturaAtiva?.plano.id === plano.id) return false;
    return idx === Math.floor(total / 2);
  }
</script>

<svelte:head>
  <title>Meu Plano — Balança Eu</title>
</svelte:head>

<div class="page-head">
  <h1 class="page-title">Meu <em>Plano</em></h1>
  <p class="page-sub">Gerencie sua assinatura e compare planos disponíveis.</p>
</div>

{#if form?.success}
  <div class="alert" style="margin-bottom: 20px;">
    <div class="alert__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
    </div>
    <div class="alert__body">
      <strong>Sucesso</strong>
      <p>{form.message}</p>
    </div>
  </div>
{/if}
{#if form?.error}
  <div class="alert" style="margin-bottom: 20px;">
    <div class="alert__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
    </div>
    <div class="alert__body">
      <strong>Erro</strong>
      <p>{form.error}</p>
    </div>
  </div>
{/if}

{#if data.assinaturaAtiva}
  {@const sub = data.assinaturaAtiva}
  <div class="card" style="margin-bottom: 28px; border-color: var(--terracota);">
    <div class="card__head">
      <div class="card__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
        {sub.plano.nome}
      </div>
      <span style="font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: var(--coral); color: var(--terracota-ink);">
        {statusLabels[sub.status] ?? sub.status}
      </span>
    </div>

    <p style="font-size: 14px; color: var(--ink-soft); margin-top: -4px;">{sub.plano.descricao ?? ''}</p>

    <div class="info-row" style="margin-top: 18px;">
      <div class="info-row__item">
        <h5>Preço</h5>
        <p>R$ {sub.plano.preco.toFixed(2)}/mês</p>
      </div>
      <div class="info-row__item">
        <h5>Aulas/semana</h5>
        <p>{sub.plano.maxAulasSemana}</p>
      </div>
      <div class="info-row__item">
        <h5>Aula particular</h5>
        <p>{sub.plano.permiteParticular ? 'Sim' : 'Não'}</p>
      </div>
      <div class="info-row__item">
        <h5>Início</h5>
        <p>{formatDate(sub.inicio)}</p>
      </div>
    </div>

    <div style="margin-top: 18px;">
      <button
        type="button"
        class="btn btn--ghost btn--sm"
        style="border-color: var(--danger); color: var(--danger);"
        onclick={() => confirmAction = { type: 'cancelar', subId: sub.id, planNome: sub.plano.nome }}
      >
        Cancelar assinatura
      </button>
    </div>
  </div>
{:else}
  <div class="plan-status">
    <div class="plan-status__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M8 15h3"/></svg>
    </div>
    <h3>Sem assinatura ativa</h3>
    <p>Escolha um plano abaixo para começar.</p>
  </div>
{/if}

<div class="plans-title">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/></svg>
  Planos Disponíveis
</div>

{#if data.planos.length === 0}
  <div class="empty-state">
    <p>Nenhum plano disponível no momento.</p>
  </div>
{:else}
  <div class="plan-grid">
    {#each data.planos as plano, idx}
      {@const isAtual = data.assinaturaAtiva?.plano.id === plano.id}
      {@const featured = isFeatured(plano, idx, data.planos.length)}
      {@const actionInfo = getActionForPlan(plano)}
      {@const precoStr = plano.preco.toFixed(2).replace('.', ',')}
      <div class="plan {featured ? 'is-featured' : ''}">
        <div class="plan__name">{plano.nome}</div>
        <div class="plan__tag">{plano.descricao ?? ''}</div>
        <div class="plan__price">
          <span class="cur">R$</span><span class="val">{precoStr}</span><span class="per">/mês</span>
        </div>
        <ul class="plan__features">
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            {plano.maxAulasSemana} aula{plano.maxAulasSemana === 1 ? '' : 's'} por semana
          </li>
          <li class={plano.permiteParticular ? '' : 'is-off'}>
            {#if plano.permiteParticular}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            {/if}
            Aulas particulares
          </li>
        </ul>
        <div class="plan__cta">
          {#if isAtual}
            <button type="button" class="btn btn--ghost btn--full" disabled style="opacity:0.7; cursor: default;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              Plano atual
            </button>
          {:else if actionInfo}
            <button
              type="button"
              class="btn btn--coral btn--full"
              onclick={() => confirmAction = { type: actionInfo.action, planId: plano.id, planNome: plano.nome }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.4 11.5a2 2 0 002 1.5h7.4a2 2 0 002-1.5L20 8H6"/></svg>
              {actionInfo.label}
            </button>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

{#if data.historico.length > 1}
  <div style="margin-top: 30px;">
    <details>
      <summary style="font-size: 13px; color: var(--ink-mute); cursor: pointer; padding: 8px 0;">
        Histórico de Assinaturas ({data.historico.length})
      </summary>
      <div class="card" style="margin-top: 10px;">
        <div class="upcoming__list">
          {#each data.historico as sub}
            <div class="upcoming-row">
              <div class="upcoming-info">
                <h4>{sub.plano}</h4>
                <p>{formatDate(sub.inicio)} {sub.fim ? `→ ${formatDate(sub.fim)}` : '(em curso)'}</p>
              </div>
              <div class="upcoming-time">{statusLabels[sub.status] ?? sub.status}</div>
            </div>
          {/each}
        </div>
      </div>
    </details>
  </div>
{/if}

{#if confirmAction}
  <div style="position: fixed; inset: 0; background: rgba(27, 20, 16, 0.6); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px;">
    <div class="card" style="max-width: 460px; width: 100%; background: var(--bg);">
      {#if confirmAction.type === 'cancelar'}
        <div class="card__head">
          <div class="card__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
            Cancelar assinatura
          </div>
        </div>
        <p style="font-size: 14px; color: var(--ink-soft); margin-bottom: 18px;">
          Ao cancelar o plano <strong>{confirmAction.planNome}</strong>, todas as suas inscrições em turmas serão canceladas automaticamente. Um crédito pro-rata será registrado caso haja dias restantes no ciclo.
        </p>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn btn--ghost btn--full" onclick={() => confirmAction = null}>Voltar</button>
          <form method="POST" action="?/cancelar" style="flex: 1;" use:enhance={() => { return async ({ update }) => { confirmAction = null; await update(); }; }}>
            <input type="hidden" name="subscriptionId" value={confirmAction.subId} />
            <button type="submit" class="btn btn--coral btn--full" style="background: var(--danger); color: var(--creme);">
              Confirmar Cancelamento
            </button>
          </form>
        </div>

      {:else if confirmAction.type === 'trocar'}
        <div class="card__head">
          <div class="card__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l-3 3 3 3M4 10h11M17 17l3-3-3-3M20 14H9"/></svg>
            Trocar de plano
          </div>
        </div>
        <p style="font-size: 14px; color: var(--ink-soft); margin-bottom: 18px;">
          Deseja mudar para o plano <strong>{confirmAction.planNome}</strong>? A diferença pro-rata será calculada proporcionalmente aos dias restantes do ciclo.
        </p>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn btn--ghost btn--full" onclick={() => confirmAction = null}>Voltar</button>
          <form method="POST" action="?/trocar" style="flex: 1;" use:enhance={() => { return async ({ update }) => { confirmAction = null; await update(); }; }}>
            <input type="hidden" name="planId" value={confirmAction.planId} />
            <button type="submit" class="btn btn--primary btn--full">Confirmar Troca</button>
          </form>
        </div>

      {:else if confirmAction.type === 'assinar'}
        <div class="card__head">
          <div class="card__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.4 11.5a2 2 0 002 1.5h7.4a2 2 0 002-1.5L20 8H6"/></svg>
            Assinar plano
          </div>
        </div>
        <p style="font-size: 14px; color: var(--ink-soft); margin-bottom: 18px;">
          Deseja assinar o plano <strong>{confirmAction.planNome}</strong>? A primeira mensalidade será registrada imediatamente.
        </p>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn btn--ghost btn--full" onclick={() => confirmAction = null}>Voltar</button>
          <form method="POST" action="?/assinar" style="flex: 1;" use:enhance={() => { return async ({ update }) => { confirmAction = null; await update(); }; }}>
            <input type="hidden" name="planId" value={confirmAction.planId} />
            <button type="submit" class="btn btn--coral btn--full">Confirmar Assinatura</button>
          </form>
        </div>
      {/if}
    </div>
  </div>
{/if}
