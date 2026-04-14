<!-- BalancaEu — Professor: Disponibilidade -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  const diasLabels: Record<string, string> = {
    SEG: 'Segunda', TER: 'Terça', QUA: 'Quarta', QUI: 'Quinta',
    SEX: 'Sexta', SAB: 'Sábado', DOM: 'Domingo'
  };

  const diasOptions = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

  let disponibilidadesPorDia = $derived(
    diasOptions.map(dia => ({
      dia,
      label: diasLabels[dia],
      slots: data.disponibilidades.filter(d => d.diaSemana === dia)
    })).filter(d => d.slots.length > 0)
  );
</script>

<svelte:head>
  <title>Disponibilidade — Professor — BalancaEu</title>
</svelte:head>

<div>
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white mb-1">Minha Disponibilidade</h1>
    <p class="text-zinc-500 text-sm">Configure os horários em que você está disponível para aulas particulares</p>
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

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Add form -->
    <div class="lg:col-span-1">
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800">
          <h2 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-blue-400">add_circle</span>
            Adicionar Horário
          </h2>
        </div>
        <form method="POST" action="?/adicionar" use:enhance class="p-5 space-y-4">
          <div>
            <label for="diaSemana" class="block text-xs text-zinc-400 mb-1.5">Dia da semana</label>
            <select
              id="diaSemana"
              name="diaSemana"
              required
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {#each diasOptions as dia}
                <option value={dia}>{diasLabels[dia]}</option>
              {/each}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="horarioInicio" class="block text-xs text-zinc-400 mb-1.5">Início</label>
              <input
                id="horarioInicio"
                name="horarioInicio"
                type="time"
                required
                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label for="horarioFim" class="block text-xs text-zinc-400 mb-1.5">Fim</label>
              <input
                id="horarioFim"
                name="horarioFim"
                type="time"
                required
                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            class="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <span class="material-symbols-outlined text-[16px]">add</span>
            Adicionar
          </button>
        </form>
      </div>
    </div>

    <!-- Schedule overview -->
    <div class="lg:col-span-2">
      {#if data.disponibilidades.length === 0}
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <span class="material-symbols-outlined text-5xl text-zinc-700 mb-3">event_busy</span>
          <h2 class="text-lg font-semibold text-white mb-1">Nenhuma disponibilidade</h2>
          <p class="text-zinc-500 text-sm">Adicione seus horários disponíveis para aulas particulares.</p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each disponibilidadesPorDia as grupo}
            <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div class="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-blue-400">calendar_today</span>
                <h3 class="text-sm font-semibold text-white">{grupo.label}</h3>
                <span class="text-[10px] text-zinc-500 ml-auto">{grupo.slots.length} horário(s)</span>
              </div>
              <div class="divide-y divide-zinc-800/50">
                {#each grupo.slots as slot}
                  <div class="px-5 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="material-symbols-outlined text-[16px] text-zinc-500">schedule</span>
                      <span class="text-sm text-white font-medium">{slot.horarioInicio} – {slot.horarioFim}</span>
                    </div>
                    <form method="POST" action="?/remover" use:enhance>
                      <input type="hidden" name="id" value={slot.id} />
                      <button
                        type="submit"
                        class="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors"
                      >
                        <span class="material-symbols-outlined text-[14px]">delete</span>
                        Remover
                      </button>
                    </form>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
