<!-- BalancaEu — Aulas Particulares (Fase 9) -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let activeTab = $state<'agendar' | 'historico'>('agendar');
  let professorSelecionado = $state('');
  let modalidadeSelecionada = $state('');

  const diasLabels: Record<string, string> = {
    SEG: 'Segunda', TER: 'Terça', QUA: 'Quarta', QUI: 'Quinta',
    SEX: 'Sexta', SAB: 'Sábado', DOM: 'Domingo'
  };

  const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
    AGENDADA: { label: 'Pendente', color: 'text-amber-400 bg-amber-400/10', icon: 'hourglass_top' },
    CONFIRMADA: { label: 'Confirmada', color: 'text-blue-400 bg-blue-400/10', icon: 'check_circle' },
    CONCLUIDA: { label: 'Concluída', color: 'text-emerald-400 bg-emerald-400/10', icon: 'task_alt' },
    CANCELADA: { label: 'Cancelada', color: 'text-red-400 bg-red-400/10', icon: 'cancel' }
  };

  let profAtual = $derived(
    data.professores.find(p => p.userId === professorSelecionado)
  );

  let modalidadesProf = $derived(profAtual?.modalidades ?? []);

  let disponibilidadesProf = $derived(profAtual?.disponibilidades ?? []);

  let disponibilidadesPorDia = $derived(
    Object.entries(diasLabels)
      .map(([key, label]) => ({
        dia: key,
        label,
        slots: disponibilidadesProf.filter(d => d.diaSemana === key)
      }))
      .filter(d => d.slots.length > 0)
  );

  let aulasAtivas = $derived(
    data.minhasAulas.filter(a => a.status === 'AGENDADA' || a.status === 'CONFIRMADA')
  );

  let aulasPassadas = $derived(
    data.minhasAulas.filter(a => a.status === 'CONCLUIDA' || a.status === 'CANCELADA')
  );

  function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function canCancel(aula: { status: string; dataHora: string }): boolean {
    if (aula.status === 'AGENDADA') return true;
    if (aula.status === 'CONFIRMADA') {
      const horas = (new Date(aula.dataHora).getTime() - Date.now()) / (1000 * 60 * 60);
      return horas >= 24;
    }
    return false;
  }
</script>

<svelte:head>
  <title>Aulas Particulares — BalancaEu</title>
</svelte:head>

<div>
  <div class="flex items-start justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Aulas Particulares</h1>
      <p class="text-zinc-500 text-sm">Agende aulas particulares com seus professores</p>
    </div>
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

  <!-- Warnings -->
  {#if !data.temPlano}
    <div class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-6 flex items-start gap-3">
      <span class="material-symbols-outlined text-amber-400 text-[22px] mt-0.5">warning</span>
      <div>
        <p class="text-sm font-medium text-amber-300">Sem plano ativo</p>
        <p class="text-xs text-amber-400/70 mt-1">Você precisa de um plano para agendar aulas. <a href="/aluno/plano" class="underline hover:text-amber-300">Ver planos</a></p>
      </div>
    </div>
  {:else if !data.permiteParticular}
    <div class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-6 flex items-start gap-3">
      <span class="material-symbols-outlined text-amber-400 text-[22px] mt-0.5">lock</span>
      <div>
        <p class="text-sm font-medium text-amber-300">Plano não inclui particulares</p>
        <p class="text-xs text-amber-400/70 mt-1">Faça upgrade para um plano que inclua aulas particulares. <a href="/aluno/plano" class="underline hover:text-amber-300">Ver planos</a></p>
      </div>
    </div>
  {/if}

  <!-- Tabs -->
  <div class="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
    <button
      onclick={() => activeTab = 'agendar'}
      class="px-4 py-2 rounded-md text-sm font-medium transition-all {activeTab === 'agendar' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}"
    >
      Agendar
    </button>
    <button
      onclick={() => activeTab = 'historico'}
      class="px-4 py-2 rounded-md text-sm font-medium transition-all {activeTab === 'historico' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}"
    >
      Minhas Aulas
      {#if aulasAtivas.length > 0}
        <span class="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{aulasAtivas.length}</span>
      {/if}
    </button>
  </div>

  <!-- TAB: Agendar -->
  {#if activeTab === 'agendar'}
    {#if data.professores.length === 0}
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
        <span class="material-symbols-outlined text-5xl text-zinc-700 mb-3">person_off</span>
        <h2 class="text-lg font-semibold text-white mb-1">Nenhum professor disponível</h2>
        <p class="text-zinc-500 text-sm">Nenhum professor configurou horários para aulas particulares no momento.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form -->
        <div class="lg:col-span-1">
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div class="p-5 border-b border-zinc-800">
              <h2 class="text-sm font-semibold text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-emerald-400">add_circle</span>
                Nova Aula
              </h2>
            </div>
            <form method="POST" action="?/agendar" use:enhance class="p-5 space-y-4">
              <div>
                <label for="part-professor" class="block text-xs text-zinc-400 mb-1.5">Professor</label>
                <select
                  id="part-professor"
                  name="professorId"
                  required
                  bind:value={professorSelecionado}
                  onchange={() => modalidadeSelecionada = ''}
                  class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Selecione...</option>
                  {#each data.professores as prof}
                    <option value={prof.userId}>{prof.nome}</option>
                  {/each}
                </select>
              </div>

              {#if profAtual}
                <div>
                  <label for="part-modalidade" class="block text-xs text-zinc-400 mb-1.5">Modalidade</label>
                  <select
                    id="part-modalidade"
                    name="modalityId"
                    required
                    bind:value={modalidadeSelecionada}
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Selecione...</option>
                    {#each modalidadesProf as mod}
                      <option value={mod.id}>{mod.nome}</option>
                    {/each}
                  </select>
                </div>
              {/if}

              <div>
                <label for="part-data" class="block text-xs text-zinc-400 mb-1.5">Data</label>
                <input
                  id="part-data"
                  name="data"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label for="part-horario" class="block text-xs text-zinc-400 mb-1.5">Horário</label>
                <input
                  id="part-horario"
                  name="horario"
                  type="time"
                  required
                  class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label for="part-duracao" class="block text-xs text-zinc-400 mb-1.5">Duração</label>
                <select
                  id="part-duracao"
                  name="duracao"
                  class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="30">30 minutos</option>
                  <option value="60" selected>60 minutos</option>
                  <option value="90">90 minutos</option>
                </select>
              </div>

              <div>
                <label for="part-obs" class="block text-xs text-zinc-400 mb-1.5">Observação (opcional)</label>
                <textarea
                  id="part-obs"
                  name="observacao"
                  rows="2"
                  placeholder="Ex: Quero focar em giros..."
                  class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 resize-y"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={!data.permiteParticular}
                class="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="material-symbols-outlined text-[16px]">send</span>
                Solicitar Agendamento
              </button>
            </form>
          </div>
        </div>

        <!-- Professor availability -->
        <div class="lg:col-span-2">
          {#if !profAtual}
            <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <span class="material-symbols-outlined text-5xl text-zinc-700 mb-3">person_search</span>
              <h2 class="text-lg font-semibold text-white mb-1">Selecione um professor</h2>
              <p class="text-zinc-500 text-sm">Escolha um professor para ver os horários disponíveis.</p>
            </div>
          {:else}
            <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-4">
              <div class="p-5 border-b border-zinc-800">
                <h2 class="text-sm font-semibold text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px] text-blue-400">schedule</span>
                  Disponibilidade de {profAtual.nome}
                </h2>
                <p class="text-[10px] text-zinc-500 mt-1">Agende sua aula em um dos horários disponíveis abaixo</p>
              </div>

              {#if disponibilidadesPorDia.length === 0}
                <div class="p-8 text-center">
                  <p class="text-zinc-500 text-sm">Este professor não tem horários configurados.</p>
                </div>
              {:else}
                <div class="divide-y divide-zinc-800/50">
                  {#each disponibilidadesPorDia as grupo}
                    <div class="px-5 py-3 flex items-center gap-4">
                      <div class="w-20 shrink-0">
                        <span class="text-xs font-medium text-blue-400">{grupo.label}</span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        {#each grupo.slots as slot}
                          <span class="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md">
                            {slot.horarioInicio} – {slot.horarioFim}
                          </span>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Professor modalities -->
            <div class="flex flex-wrap gap-2">
              <span class="text-[10px] text-zinc-500 mr-1 self-center">Modalidades:</span>
              {#each profAtual.modalidades as mod}
                <span class="text-[11px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">{mod.nome}</span>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

  <!-- TAB: Minhas Aulas -->
  {:else}
    {#if data.minhasAulas.length === 0}
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
        <span class="material-symbols-outlined text-5xl text-zinc-700 mb-3">event_busy</span>
        <h2 class="text-lg font-semibold text-white mb-1">Nenhuma aula</h2>
        <p class="text-zinc-500 text-sm mb-4">Você ainda não agendou nenhuma aula particular.</p>
        <button onclick={() => activeTab = 'agendar'} class="text-emerald-400 text-sm hover:underline">
          Agendar uma aula
        </button>
      </div>
    {:else}
      <!-- Active lessons -->
      {#if aulasAtivas.length > 0}
        <h2 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-blue-400">event_available</span>
          Aulas Agendadas
        </h2>
        <div class="space-y-3 mb-8">
          {#each aulasAtivas as aula}
            {@const st = statusLabels[aula.status] ?? statusLabels.AGENDADA}
            <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-base font-semibold text-white">{aula.modalidade}</h3>
                  <p class="text-xs text-zinc-500">Prof. {aula.professor}</p>
                </div>
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-full {st.color} flex items-center gap-1">
                  <span class="material-symbols-outlined text-[12px]">{st.icon}</span>
                  {st.label}
                </span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-3">
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                  {formatDateTime(aula.dataHora)}
                </div>
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="material-symbols-outlined text-[16px]">timer</span>
                  {aula.duracao} min
                </div>
                {#if aula.observacao}
                  <div class="flex items-center gap-2 text-zinc-400">
                    <span class="material-symbols-outlined text-[16px]">notes</span>
                    {aula.observacao}
                  </div>
                {/if}
              </div>
              {#if canCancel(aula)}
                <form method="POST" action="?/cancelar" use:enhance>
                  <input type="hidden" name="id" value={aula.id} />
                  <button type="submit" class="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                    <span class="material-symbols-outlined text-[14px]">cancel</span>
                    Cancelar aula
                  </button>
                </form>
              {:else if aula.status === 'CONFIRMADA'}
                <p class="text-[11px] text-zinc-600 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[12px]">lock</span>
                  Cancelamento indisponível (menos de 24h)
                </p>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <!-- Past lessons -->
      {#if aulasPassadas.length > 0}
        <details>
          <summary class="text-xs text-zinc-500 cursor-pointer hover:text-zinc-400 transition-colors mb-3">
            Histórico ({aulasPassadas.length})
          </summary>
          <div class="space-y-2">
            {#each aulasPassadas as aula}
              {@const st = statusLabels[aula.status] ?? statusLabels.CANCELADA}
              <div class="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 opacity-70">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-medium text-zinc-400">{aula.modalidade} — Prof. {aula.professor}</p>
                    <p class="text-[11px] text-zinc-600">{formatDateTime(aula.dataHora)} · {aula.duracao} min</p>
                  </div>
                  <span class="text-[10px] font-medium px-2 py-0.5 rounded-full {st.color}">{st.label}</span>
                </div>
              </div>
            {/each}
          </div>
        </details>
      {/if}
    {/if}
  {/if}
</div>
