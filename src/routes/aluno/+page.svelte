<!-- Pulso — Dashboard do Aluno -->
<script lang="ts">
  let { data } = $props();

  const diasLabels: Record<string, string> = {
    SEG: 'Segunda', TER: 'Terça', QUA: 'Quarta', QUI: 'Quinta',
    SEX: 'Sexta', SAB: 'Sábado', DOM: 'Domingo'
  };

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
</script>

<svelte:head>
  <title>Minha Área — Pulso</title>
</svelte:head>

<div>
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white mb-1">Olá, {data.user?.nome?.split(' ')[0] ?? 'Aluno'}!</h1>
    <p class="text-zinc-500 text-sm">Bem-vindo à sua área</p>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-9 h-9 bg-emerald-600/15 rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-emerald-400 text-[20px]">credit_card</span>
        </div>
        <span class="text-xs text-zinc-500 uppercase tracking-wider">Meu Plano</span>
      </div>
      <p class="text-lg font-bold text-white">{data.planoAtual?.nome ?? 'Sem plano'}</p>
      {#if data.planoAtual}
        <p class="text-xs text-zinc-500 mt-1">R$ {data.planoAtual.preco.toFixed(2)}/mês</p>
      {/if}
    </div>

    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-9 h-9 bg-blue-600/15 rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-blue-400 text-[20px]">groups</span>
        </div>
        <span class="text-xs text-zinc-500 uppercase tracking-wider">Turmas</span>
      </div>
      <p class="text-lg font-bold text-white">{data.totalTurmas}</p>
      <p class="text-xs text-zinc-500 mt-1">inscrição(ões) ativa(s)</p>
    </div>

    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-9 h-9 bg-amber-600/15 rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-amber-400 text-[20px]">check_circle</span>
        </div>
        <span class="text-xs text-zinc-500 uppercase tracking-wider">Presenças no Mês</span>
      </div>
      <p class="text-lg font-bold text-white">{data.presencasMes}</p>
      <p class="text-xs text-zinc-500 mt-1">aula(s) com presença</p>
    </div>

    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-9 h-9 bg-purple-600/15 rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-purple-400 text-[20px]">calendar_month</span>
        </div>
        <span class="text-xs text-zinc-500 uppercase tracking-wider">Máx. aulas/sem</span>
      </div>
      <p class="text-lg font-bold text-white">{data.planoAtual?.maxAulasSemana ?? '—'}</p>
      <p class="text-xs text-zinc-500 mt-1">permitidas pelo plano</p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Minhas Turmas -->
    <div class="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="flex items-center justify-between p-5 border-b border-zinc-800">
        <h2 class="text-base font-semibold text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-emerald-400">groups</span>
          Minhas Turmas
        </h2>
        <a href="/aluno/inscricoes" class="text-xs text-emerald-400 hover:underline">Ver todas</a>
      </div>
      {#if data.turmas.length === 0}
        <div class="p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-zinc-700 mb-2">event_busy</span>
          <p class="text-zinc-500 text-sm">Você não está inscrito em nenhuma turma.</p>
          <a href="/aluno/inscricoes" class="text-emerald-400 text-sm hover:underline mt-2 inline-block">Explorar turmas</a>
        </div>
      {:else}
        <div class="divide-y divide-zinc-800">
          {#each data.turmas as turma}
            <div class="px-5 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
              <div>
                <p class="text-sm font-medium text-white">{turma.modalidade}</p>
                <p class="text-xs text-zinc-500">{turma.nivel} — Prof. {turma.professor}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-zinc-300">{diasLabels[turma.diaSemana] ?? turma.diaSemana}</p>
                <p class="text-xs text-zinc-500">{turma.horarioInicio}–{turma.horarioFim} · {turma.sala}</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Próximos Eventos -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="p-5 border-b border-zinc-800">
        <h2 class="text-base font-semibold text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-purple-400">event</span>
          Próximos Eventos
        </h2>
      </div>
      {#if data.eventos.length === 0}
        <div class="p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-zinc-700 mb-2">event_busy</span>
          <p class="text-zinc-500 text-sm">Nenhum evento agendado.</p>
        </div>
      {:else}
        <div class="divide-y divide-zinc-800">
          {#each data.eventos as evento}
            <div class="px-5 py-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-purple-600/15 rounded-lg flex flex-col items-center justify-center shrink-0">
                  <span class="text-[10px] text-purple-400 leading-none uppercase">{formatDate(evento.data).split(' ')[1]}</span>
                  <span class="text-sm font-bold text-purple-300 leading-none">{formatDate(evento.data).split(' ')[0]}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-white truncate">{evento.titulo}</p>
                  <p class="text-xs text-zinc-500">{evento.horario} · {evento.local}</p>
                  {#if evento.preco}
                    <p class="text-xs text-emerald-400 mt-0.5">R$ {evento.preco.toFixed(2)}</p>
                  {:else}
                    <p class="text-xs text-emerald-400 mt-0.5">Gratuito</p>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Quick Actions -->
  {#if data.planoAtual}
    <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <a href="/aluno/inscricoes" class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-emerald-600/40 transition-colors group flex items-center gap-3">
        <span class="material-symbols-outlined text-zinc-500 group-hover:text-emerald-400 transition-colors">add_circle</span>
        <span class="text-sm text-zinc-300 group-hover:text-white transition-colors">Inscrever em turma</span>
      </a>
      <a href="/aluno/perfil" class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-emerald-600/40 transition-colors group flex items-center gap-3">
        <span class="material-symbols-outlined text-zinc-500 group-hover:text-emerald-400 transition-colors">edit</span>
        <span class="text-sm text-zinc-300 group-hover:text-white transition-colors">Editar perfil</span>
      </a>
      <a href="/aluno/extrato" class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-emerald-600/40 transition-colors group flex items-center gap-3">
        <span class="material-symbols-outlined text-zinc-500 group-hover:text-emerald-400 transition-colors">receipt_long</span>
        <span class="text-sm text-zinc-300 group-hover:text-white transition-colors">Ver extrato</span>
      </a>
    </div>
  {/if}
</div>
