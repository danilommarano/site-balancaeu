<!-- Pulso — Admin: Turmas -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import FormFeedback from '$lib/components/admin/FormFeedback.svelte';

  let { data, form } = $props();

  let showCreateForm = $state(false);
  let editingId = $state<string | null>(null);
  let editModalityId = $state('');
  let editProfessorId = $state('');
  let editNivel = $state('');
  let editDiaSemana = $state('');
  let editHorarioInicio = $state('');
  let editHorarioFim = $state('');
  let editSala = $state('');
  let editMaxAlunos = $state('');
  let editAtivo = $state(true);

  const diasLabels: Record<string, string> = {
    SEG: 'Segunda', TER: 'Terça', QUA: 'Quarta',
    QUI: 'Quinta', SEX: 'Sexta', SAB: 'Sábado', DOM: 'Domingo'
  };

  function startEdit(t: { id: string; modalityId: string; professorId: string; nivel: string; diaSemana: string; horarioInicio: string; horarioFim: string; sala: string; maxAlunos: number; ativo: boolean }) {
    editingId = t.id;
    editModalityId = t.modalityId;
    editProfessorId = t.professorId;
    editNivel = t.nivel;
    editDiaSemana = t.diaSemana;
    editHorarioInicio = t.horarioInicio;
    editHorarioFim = t.horarioFim;
    editSala = t.sala;
    editMaxAlunos = String(t.maxAlunos);
    editAtivo = t.ativo;
  }

  function cancelEdit() {
    editingId = null;
  }
</script>

<svelte:head>
  <title>Turmas — Admin — Pulso</title>
</svelte:head>

<div>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Turmas</h1>
      <p class="text-zinc-500 text-sm">{data.turmas.length} turma(s) cadastrada(s)</p>
    </div>
    <button
      onclick={() => showCreateForm = !showCreateForm}
      class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
    >
      <span class="material-symbols-outlined text-[18px]">{showCreateForm ? 'close' : 'add'}</span>
      {showCreateForm ? 'Cancelar' : 'Nova Turma'}
    </button>
  </div>

  <FormFeedback {form} />

  <!-- Create form -->
  {#if showCreateForm}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <h2 class="text-sm font-semibold text-white mb-4">Nova Turma</h2>
      <form method="POST" action="?/create" use:enhance={() => { return async ({ update }) => { await update(); showCreateForm = false; }; }}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label for="c-mod" class="block text-xs text-zinc-400 mb-1.5">Modalidade</label>
            <select id="c-mod" name="modalityId" required class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
              <option value="">Selecione...</option>
              {#each data.modalidades as m}
                <option value={m.id}>{m.nome}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="c-prof" class="block text-xs text-zinc-400 mb-1.5">Professor</label>
            <select id="c-prof" name="professorId" required class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
              <option value="">Selecione...</option>
              {#each data.professores as p}
                <option value={p.id}>{p.nome}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="c-nivel" class="block text-xs text-zinc-400 mb-1.5">Nível</label>
            <input id="c-nivel" name="nivel" type="text" required placeholder="Iniciante"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-dia" class="block text-xs text-zinc-400 mb-1.5">Dia da Semana</label>
            <select id="c-dia" name="diaSemana" required class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
              {#each Object.entries(diasLabels) as [key, label]}
                <option value={key}>{label}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="c-inicio" class="block text-xs text-zinc-400 mb-1.5">Início</label>
            <input id="c-inicio" name="horarioInicio" type="time" required
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-fim" class="block text-xs text-zinc-400 mb-1.5">Fim</label>
            <input id="c-fim" name="horarioFim" type="time" required
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-sala" class="block text-xs text-zinc-400 mb-1.5">Sala</label>
            <input id="c-sala" name="sala" type="text" required placeholder="Sala 1"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label for="c-max" class="block text-xs text-zinc-400 mb-1.5">Máx. Alunos</label>
            <input id="c-max" name="maxAlunos" type="number" required min="1" value="20"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
          </div>
        </div>
        <button type="submit" class="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Criar Turma</button>
      </form>
    </div>
  {/if}

  <!-- Table -->
  <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
    {#if data.turmas.length === 0}
      <div class="p-10 text-center">
        <span class="material-symbols-outlined text-4xl text-zinc-700 mb-3 block">groups</span>
        <p class="text-zinc-500 text-sm">Nenhuma turma cadastrada.</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-zinc-800">
              <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Modalidade</th>
              <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Nível</th>
              <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Dia</th>
              <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Horário</th>
              <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium hidden lg:table-cell">Professor</th>
              <th class="text-left text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium hidden lg:table-cell">Sala</th>
              <th class="text-center text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Alunos</th>
              <th class="text-center text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Status</th>
              <th class="text-right text-[10px] uppercase tracking-wider text-zinc-500 px-5 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800">
            {#each data.turmas as turma}
              {#if editingId === turma.id}
                <!-- Inline Edit Row -->
                <tr class="bg-zinc-800/40">
                  <td colspan="9" class="px-5 py-4">
                    <form method="POST" action="?/update" use:enhance={() => { return async ({ update }) => { await update(); editingId = null; }; }}>
                      <input type="hidden" name="id" value={turma.id} />
                      <input type="hidden" name="ativo" value={editAtivo.toString()} />
                      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-3">
                        <div>
                          <label for="edit-turma-modalidade" class="block text-[10px] text-zinc-500 mb-1">Modalidade</label>
                          <select id="edit-turma-modalidade" name="modalityId" required bind:value={editModalityId} class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
                            {#each data.modalidades as m}
                              <option value={m.id}>{m.nome}</option>
                            {/each}
                          </select>
                        </div>
                        <div>
                          <label for="edit-turma-professor" class="block text-[10px] text-zinc-500 mb-1">Professor</label>
                          <select id="edit-turma-professor" name="professorId" required bind:value={editProfessorId} class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
                            {#each data.professores as p}
                              <option value={p.id}>{p.nome}</option>
                            {/each}
                          </select>
                        </div>
                        <div>
                          <label for="edit-turma-nivel" class="block text-[10px] text-zinc-500 mb-1">Nível</label>
                          <input id="edit-turma-nivel" name="nivel" type="text" required bind:value={editNivel}
                            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label for="edit-turma-dia" class="block text-[10px] text-zinc-500 mb-1">Dia</label>
                          <select id="edit-turma-dia" name="diaSemana" required bind:value={editDiaSemana} class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
                            {#each Object.entries(diasLabels) as [key, label]}
                              <option value={key}>{label}</option>
                            {/each}
                          </select>
                        </div>
                        <div>
                          <label for="edit-turma-sala" class="block text-[10px] text-zinc-500 mb-1">Sala</label>
                          <input id="edit-turma-sala" name="sala" type="text" required bind:value={editSala}
                            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label for="edit-turma-inicio" class="block text-[10px] text-zinc-500 mb-1">Início</label>
                          <input id="edit-turma-inicio" name="horarioInicio" type="time" required bind:value={editHorarioInicio}
                            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label for="edit-turma-fim" class="block text-[10px] text-zinc-500 mb-1">Fim</label>
                          <input id="edit-turma-fim" name="horarioFim" type="time" required bind:value={editHorarioFim}
                            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label for="edit-turma-maxalunos" class="block text-[10px] text-zinc-500 mb-1">Máx. Alunos</label>
                          <input id="edit-turma-maxalunos" name="maxAlunos" type="number" required min="1" bind:value={editMaxAlunos}
                            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                        </div>
                        <div class="flex items-end pb-1">
                          <label class="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                            <input type="checkbox" bind:checked={editAtivo} class="accent-emerald-500" />
                            Ativa
                          </label>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button type="submit" class="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:opacity-90">Salvar</button>
                        <button type="button" onclick={cancelEdit} class="bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded-lg text-xs hover:bg-zinc-700">Cancelar</button>
                      </div>
                    </form>
                  </td>
                </tr>
              {:else}
                <!-- Display Row -->
                <tr class="hover:bg-zinc-800/30 transition-colors">
                  <td class="px-5 py-3">
                    <span class="text-sm text-white font-medium">{turma.modality.nome}</span>
                  </td>
                  <td class="px-5 py-3">
                    <span class="text-sm text-zinc-300">{turma.nivel}</span>
                  </td>
                  <td class="px-5 py-3">
                    <span class="text-sm text-zinc-300">{diasLabels[turma.diaSemana] ?? turma.diaSemana}</span>
                  </td>
                  <td class="px-5 py-3">
                    <span class="text-sm text-zinc-300">{turma.horarioInicio} - {turma.horarioFim}</span>
                  </td>
                  <td class="px-5 py-3 hidden lg:table-cell">
                    <span class="text-sm text-zinc-400">{turma.professor.nome}</span>
                  </td>
                  <td class="px-5 py-3 hidden lg:table-cell">
                    <span class="text-sm text-zinc-400">{turma.sala}</span>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span class="text-sm {turma._count.enrollments >= turma.maxAlunos ? 'text-amber-400' : 'text-zinc-300'}">
                      {turma._count.enrollments}/{turma.maxAlunos}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider {turma.ativo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}">
                      {turma.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button onclick={() => startEdit(turma)} class="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Editar">
                        <span class="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <form method="POST" action="?/delete" use:enhance>
                        <input type="hidden" name="id" value={turma.id} />
                        <button type="submit" class="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Excluir"
                          onclick={(e) => { if (!confirm('Excluir esta turma?')) e.preventDefault(); }}>
                          <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
