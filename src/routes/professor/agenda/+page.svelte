<!-- BalancaEu — Professor: Agenda Semanal (Fase 15) -->
<script lang="ts">
  let { data } = $props();

  const diasHoje = (() => {
    const dias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    return dias[new Date().getDay()];
  })();
</script>

<svelte:head>
  <title>Agenda — Professor — BalancaEu</title>
</svelte:head>

<div>
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-white mb-1">Agenda Semanal</h1>
    <p class="text-zinc-500 text-sm">{data.semana}</p>
  </div>

  <!-- Desktop: grid view -->
  <div class="hidden lg:grid grid-cols-7 gap-3">
    {#each data.agenda as dia}
      {@const isHoje = dia.dia === diasHoje}
      <div class="bg-zinc-900 border rounded-xl overflow-hidden {isHoje ? 'border-blue-500/50' : 'border-zinc-800'}">
        <div class="p-3 border-b {isHoje ? 'border-blue-500/30 bg-blue-600/5' : 'border-zinc-800'}">
          <p class="text-xs font-semibold {isHoje ? 'text-blue-400' : 'text-white'}">{dia.label}</p>
          {#if isHoje}
            <span class="text-[9px] text-blue-400/70">Hoje</span>
          {/if}
        </div>
        <div class="p-2 space-y-2 min-h-[200px]">
          {#if dia.items.length === 0}
            <p class="text-[10px] text-zinc-600 text-center py-4">Sem aulas</p>
          {:else}
            {#each dia.items as item}
              {#if item.tipo === 'turma'}
                <div class="bg-zinc-800/50 rounded-lg p-2.5 border border-zinc-700/50 hover:border-blue-500/30 transition-colors">
                  <div class="flex items-center gap-1 mb-1">
                    <span class="material-symbols-outlined text-[12px] text-blue-400">groups</span>
                    <span class="text-[10px] font-semibold text-white truncate">{item.modalidade}</span>
                  </div>
                  <p class="text-[9px] text-zinc-400">{item.nivel}</p>
                  <p class="text-[9px] text-zinc-500">{item.horarioInicio}–{item.horarioFim}</p>
                  <p class="text-[9px] text-zinc-600">Sala {item.sala} · {item.totalAlunos} aluno(s)</p>
                </div>
              {:else}
                <div class="bg-amber-500/5 rounded-lg p-2.5 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
                  <div class="flex items-center gap-1 mb-1">
                    <span class="material-symbols-outlined text-[12px] text-amber-400">person</span>
                    <span class="text-[10px] font-semibold text-white truncate">{item.modalidade}</span>
                  </div>
                  <p class="text-[9px] text-amber-400/70">Particular</p>
                  <p class="text-[9px] text-zinc-400">{item.aluno}</p>
                  <p class="text-[9px] text-zinc-500">{item.horarioInicio}–{item.horarioFim}</p>
                  <span class="text-[8px] px-1.5 py-0.5 rounded-full {item.status === 'CONFIRMADA' ? 'bg-blue-400/10 text-blue-400' : 'bg-amber-400/10 text-amber-400'}">
                    {item.status === 'CONFIRMADA' ? 'Confirmada' : 'Pendente'}
                  </span>
                </div>
              {/if}
            {/each}
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <!-- Mobile: stacked view -->
  <div class="lg:hidden space-y-4">
    {#each data.agenda as dia}
      {@const isHoje = dia.dia === diasHoje}
      {#if dia.items.length > 0 || isHoje}
        <div class="bg-zinc-900 border rounded-xl overflow-hidden {isHoje ? 'border-blue-500/50' : 'border-zinc-800'}">
          <div class="px-4 py-3 border-b {isHoje ? 'border-blue-500/30 bg-blue-600/5' : 'border-zinc-800'} flex items-center justify-between">
            <p class="text-sm font-semibold {isHoje ? 'text-blue-400' : 'text-white'}">{dia.label}</p>
            {#if isHoje}
              <span class="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Hoje</span>
            {/if}
          </div>
          {#if dia.items.length === 0}
            <div class="px-4 py-6 text-center">
              <p class="text-zinc-500 text-xs">Sem aulas programadas.</p>
            </div>
          {:else}
            <div class="divide-y divide-zinc-800/50">
              {#each dia.items as item}
                <div class="px-4 py-3 flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 {item.tipo === 'turma' ? 'bg-blue-600/10' : 'bg-amber-500/10'}">
                    <span class="material-symbols-outlined text-[16px] {item.tipo === 'turma' ? 'text-blue-400' : 'text-amber-400'}">
                      {item.tipo === 'turma' ? 'groups' : 'person'}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-white font-medium truncate">{item.modalidade}</p>
                    <p class="text-[10px] text-zinc-400">
                      {item.horarioInicio}–{item.horarioFim}
                      {#if item.tipo === 'turma'}
                        · {item.nivel} · Sala {item.sala}
                      {:else}
                        · {item.aluno}
                      {/if}
                    </p>
                  </div>
                  {#if item.tipo === 'turma'}
                    <span class="text-[10px] text-zinc-500 shrink-0">{item.totalAlunos} aluno(s)</span>
                  {:else}
                    <span class="text-[9px] px-2 py-0.5 rounded-full shrink-0 {item.status === 'CONFIRMADA' ? 'bg-blue-400/10 text-blue-400' : 'bg-amber-400/10 text-amber-400'}">
                      {item.status === 'CONFIRMADA' ? 'Confirmada' : 'Pendente'}
                    </span>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>
