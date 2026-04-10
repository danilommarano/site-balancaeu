<!-- Pulso — Professor: Aulas Particulares -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let filtroStatus = $state('');

  const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
    AGENDADA: { label: 'Pendente', color: 'text-amber-400 bg-amber-400/10', icon: 'hourglass_top' },
    CONFIRMADA: { label: 'Confirmada', color: 'text-blue-400 bg-blue-400/10', icon: 'check_circle' },
    CONCLUIDA: { label: 'Concluída', color: 'text-emerald-400 bg-emerald-400/10', icon: 'task_alt' },
    CANCELADA: { label: 'Cancelada', color: 'text-red-400 bg-red-400/10', icon: 'cancel' }
  };

  let aulasFiltradas = $derived(
    filtroStatus ? data.aulas.filter(a => a.status === filtroStatus) : data.aulas
  );

  let pendentes = $derived(data.aulas.filter(a => a.status === 'AGENDADA').length);

  function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
</script>

<svelte:head>
  <title>Particulares — Professor — Pulso</title>
</svelte:head>

<div>
  <div class="flex items-start justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Aulas Particulares</h1>
      <p class="text-zinc-500 text-sm">Gerencie solicitações de aulas particulares</p>
    </div>
    {#if pendentes > 0}
      <div class="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
        <p class="text-xs text-amber-400 font-medium">{pendentes} pendente{pendentes !== 1 ? 's' : ''}</p>
      </div>
    {/if}
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

  <!-- Filter -->
  <div class="flex gap-2 mb-6">
    <button
      onclick={() => filtroStatus = ''}
      class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors {filtroStatus === '' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}"
    >Todas</button>
    {#each Object.entries(statusLabels) as [key, val]}
      <button
        onclick={() => filtroStatus = key}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors {filtroStatus === key ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}"
      >{val.label}</button>
    {/each}
  </div>

  {#if aulasFiltradas.length === 0}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
      <span class="material-symbols-outlined text-5xl text-zinc-700 mb-3">event_busy</span>
      <h2 class="text-lg font-semibold text-white mb-1">Nenhuma aula encontrada</h2>
      <p class="text-zinc-500 text-sm">
        {#if filtroStatus}Tente outro filtro.{:else}Ainda não há solicitações de aulas particulares.{/if}
      </p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each aulasFiltradas as aula}
        {@const st = statusLabels[aula.status] ?? statusLabels.AGENDADA}
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
          <div class="p-5">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="text-base font-semibold text-white">{aula.modalidade}</h3>
                <p class="text-xs text-zinc-500">Aluno: {aula.aluno.nome}</p>
              </div>
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full {st.color} flex items-center gap-1">
                <span class="material-symbols-outlined text-[12px]">{st.icon}</span>
                {st.label}
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
              <div class="flex items-center gap-2 text-zinc-400">
                <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                {formatDateTime(aula.dataHora)}
              </div>
              <div class="flex items-center gap-2 text-zinc-400">
                <span class="material-symbols-outlined text-[16px]">timer</span>
                {aula.duracao} min
              </div>
              <div class="flex items-center gap-2 text-zinc-400">
                <span class="material-symbols-outlined text-[16px]">mail</span>
                {aula.aluno.email}
              </div>
              {#if aula.observacao}
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">notes</span>
                  {aula.observacao}
                </div>
              {/if}
            </div>

            <!-- Actions based on status -->
            <div class="flex gap-2">
              {#if aula.status === 'AGENDADA'}
                <form method="POST" action="?/confirmar" use:enhance>
                  <input type="hidden" name="id" value={aula.id} />
                  <button type="submit" class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    <span class="material-symbols-outlined text-[14px]">check</span>
                    Confirmar
                  </button>
                </form>
                <form method="POST" action="?/recusar" use:enhance>
                  <input type="hidden" name="id" value={aula.id} />
                  <button type="submit" class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-600/15 text-red-400 hover:bg-red-600/25 transition-colors">
                    <span class="material-symbols-outlined text-[14px]">close</span>
                    Recusar
                  </button>
                </form>
              {/if}
              {#if aula.status === 'CONFIRMADA'}
                <form method="POST" action="?/concluir" use:enhance>
                  <input type="hidden" name="id" value={aula.id} />
                  <button type="submit" class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/25 transition-colors">
                    <span class="material-symbols-outlined text-[14px]">task_alt</span>
                    Marcar Concluída
                  </button>
                </form>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
