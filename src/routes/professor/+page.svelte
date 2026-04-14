<!-- BalancaEu — Dashboard do Professor (Fase 15) -->
<script lang="ts">
  let { data } = $props();

  function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
      ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDateShort(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
    AGENDADA: { label: 'Pendente', color: 'text-amber-400 bg-amber-400/10', icon: 'hourglass_top' },
    CONFIRMADA: { label: 'Confirmada', color: 'text-blue-400 bg-blue-400/10', icon: 'check_circle' }
  };
</script>

<svelte:head>
  <title>Painel — Professor — BalancaEu</title>
</svelte:head>

<div>
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white mb-1">Olá, {data.user?.nome?.split(' ')[0] ?? 'Professor'}!</h1>
    <p class="text-zinc-500 text-sm">{data.diaLabel} — Painel do professor</p>
  </div>

  <!-- Stats cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div class="flex items-center justify-between mb-2">
        <span class="text-zinc-500 text-xs uppercase tracking-wider">Turmas Ativas</span>
        <div class="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-[16px] text-blue-400">groups</span>
        </div>
      </div>
      <p class="text-2xl font-bold text-white">{data.stats.totalTurmas}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div class="flex items-center justify-between mb-2">
        <span class="text-zinc-500 text-xs uppercase tracking-wider">Aulas Hoje</span>
        <div class="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-[16px] text-emerald-400">today</span>
        </div>
      </div>
      <p class="text-2xl font-bold text-white">{data.stats.aulasHoje}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div class="flex items-center justify-between mb-2">
        <span class="text-zinc-500 text-xs uppercase tracking-wider">Particulares Pendentes</span>
        <div class="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-[16px] text-amber-400">hourglass_top</span>
        </div>
      </div>
      <p class="text-2xl font-bold text-white">{data.stats.particularesPendentes}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div class="flex items-center justify-between mb-2">
        <span class="text-zinc-500 text-xs uppercase tracking-wider">Confirmadas</span>
        <div class="w-7 h-7 bg-purple-500/10 rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-[16px] text-purple-400">event_available</span>
        </div>
      </div>
      <p class="text-2xl font-bold text-white">{data.stats.particularesConfirmadas}</p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Today's classes -->
    <div class="lg:col-span-2 space-y-6">
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-emerald-400">today</span>
          <h2 class="text-sm font-semibold text-white">Turmas de Hoje</h2>
          <span class="ml-auto text-[10px] text-zinc-500">{data.turmasHoje.length} turma(s)</span>
        </div>
        {#if data.turmasHoje.length === 0}
          <div class="p-8 text-center">
            <span class="material-symbols-outlined text-4xl text-zinc-700 mb-2">event_busy</span>
            <p class="text-zinc-500 text-sm">Nenhuma aula programada para hoje.</p>
          </div>
        {:else}
          <div class="divide-y divide-zinc-800/50">
            {#each data.turmasHoje as turma}
              <div class="px-5 py-4 flex items-center gap-4 hover:bg-zinc-800/20 transition-colors">
                <div class="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-blue-400">sports_martial_arts</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-white">{turma.modalidade}</p>
                  <p class="text-xs text-zinc-500">{turma.nivel} · {turma.horarioInicio}–{turma.horarioFim} · Sala {turma.sala}</p>
                  <p class="text-[10px] text-zinc-600">{turma.totalAlunos} aluno(s) inscrito(s)</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  {#if turma.chamadaFeita}
                    <span class="text-[10px] bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span class="material-symbols-outlined text-[12px]">check</span>
                      Chamada feita
                    </span>
                  {:else}
                    <a
                      href="/professor/chamada?data={new Date().toISOString().split('T')[0]}&turma={turma.id}"
                      class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      <span class="material-symbols-outlined text-[14px]">fact_check</span>
                      Chamada
                    </a>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Recent attendance -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-purple-400">history</span>
          <h2 class="text-sm font-semibold text-white">Últimas Chamadas</h2>
        </div>
        {#if data.ultimasChamadas.length === 0}
          <div class="p-6 text-center">
            <p class="text-zinc-500 text-xs">Nenhuma chamada registrada ainda.</p>
          </div>
        {:else}
          <div class="divide-y divide-zinc-800/50">
            {#each data.ultimasChamadas as chamada}
              {@const total = chamada.presentes + chamada.ausentes}
              {@const pct = total > 0 ? Math.round((chamada.presentes / total) * 100) : 0}
              <div class="px-5 py-3 flex items-center justify-between">
                <div>
                  <p class="text-xs text-white font-medium">{chamada.turma}</p>
                  <p class="text-[10px] text-zinc-500">{formatDateShort(chamada.data)}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[10px] text-emerald-400">{chamada.presentes}P</span>
                  <span class="text-[10px] text-red-400">{chamada.ausentes}F</span>
                  <div class="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full" style="width: {pct}%"></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Sidebar: upcoming private lessons -->
    <div class="space-y-6">
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-amber-400">person</span>
            Próximas Particulares
          </h2>
          <a href="/professor/particulares" class="text-[10px] text-primary hover:underline">Ver todas</a>
        </div>
        {#if data.proximasParticulares.length === 0}
          <div class="p-6 text-center">
            <span class="material-symbols-outlined text-3xl text-zinc-700 mb-2">event_busy</span>
            <p class="text-zinc-500 text-xs">Nenhuma particular agendada.</p>
          </div>
        {:else}
          <div class="divide-y divide-zinc-800/50">
            {#each data.proximasParticulares as aula}
              {@const st = statusLabels[aula.status] ?? statusLabels.AGENDADA}
              <div class="px-5 py-3 hover:bg-zinc-800/20 transition-colors">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-white font-medium">{aula.modalidade}</span>
                  <span class="text-[10px] font-medium px-2 py-0.5 rounded-full {st.color} flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[10px]">{st.icon}</span>
                    {st.label}
                  </span>
                </div>
                <p class="text-[10px] text-zinc-400">Aluno: {aula.aluno}</p>
                <p class="text-[10px] text-zinc-500">{formatDateTime(aula.dataHora)} · {aula.duracao}min</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Quick navigation -->
      <div class="space-y-2">
        <h3 class="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-1">Ações rápidas</h3>
        <a href="/professor/chamada" class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3 hover:border-blue-500/30 transition-colors group">
          <div class="w-9 h-9 rounded-lg bg-blue-600/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-blue-400 text-[18px]">fact_check</span>
          </div>
          <div>
            <p class="text-xs text-white font-medium group-hover:text-blue-400 transition-colors">Chamada</p>
            <p class="text-[10px] text-zinc-600">Registrar presença</p>
          </div>
        </a>
        <a href="/professor/agenda" class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3 hover:border-blue-500/30 transition-colors group">
          <div class="w-9 h-9 rounded-lg bg-purple-600/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-purple-400 text-[18px]">calendar_month</span>
          </div>
          <div>
            <p class="text-xs text-white font-medium group-hover:text-purple-400 transition-colors">Agenda</p>
            <p class="text-[10px] text-zinc-600">Ver semana completa</p>
          </div>
        </a>
        <a href="/professor/disponibilidade" class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3 hover:border-blue-500/30 transition-colors group">
          <div class="w-9 h-9 rounded-lg bg-teal-600/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-teal-400 text-[18px]">schedule</span>
          </div>
          <div>
            <p class="text-xs text-white font-medium group-hover:text-teal-400 transition-colors">Disponibilidade</p>
            <p class="text-[10px] text-zinc-600">Configurar horários</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</div>
