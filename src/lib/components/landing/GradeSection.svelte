<script lang="ts">
  type Turma = {
    id: string;
    nivel: string;
    diaSemana: string;
    horarioInicio: string;
    horarioFim: string;
    sala: string;
    modality: { nome: string };
    professor: { nome: string };
  };

  let { cms = {}, turmas = [] }: {
    cms?: Record<string, Record<string, string>>;
    turmas?: Turma[];
  } = $props();

  const sec = $derived(cms.horarios ?? {});
  const labelText = $derived(sec.label || 'Nossa agenda');
  const titulo = $derived(sec.titulo || 'Grade de <em>aulas.</em>');

  const DIA_MAP: Record<string, string> = {
    SEG: 'Segunda', TER: 'Terça', QUA: 'Quarta', QUI: 'Quinta', SEX: 'Sexta', SAB: 'Sábado', DOM: 'Domingo'
  };
  const DIA_ORDER = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

  // Group turmas by day → time slot → sala
  const gradeData = $derived.by(() => {
    if (turmas.length === 0) return { dias: [], grade: {} as Record<string, { time: string; slots: ({ title: string; level: string; prof: string } | null)[] }[]> };

    // Discover all salas and dias
    const salasSet = new Set<string>();
    const diasSet = new Set<string>();
    for (const t of turmas) {
      salasSet.add(t.sala);
      diasSet.add(t.diaSemana);
    }
    const salas = [...salasSet].sort();
    const dias = DIA_ORDER.filter(d => diasSet.has(d));

    // Group by day
    const grade: Record<string, { time: string; slots: ({ title: string; level: string; prof: string } | null)[] }[]> = {};

    for (const dia of dias) {
      const turmasDia = turmas.filter(t => t.diaSemana === dia);
      // Group by time slot
      const timeSlots = new Map<string, Turma[]>();
      for (const t of turmasDia) {
        const key = `${t.horarioInicio} – ${t.horarioFim}`;
        if (!timeSlots.has(key)) timeSlots.set(key, []);
        timeSlots.get(key)!.push(t);
      }

      grade[DIA_MAP[dia]] = [...timeSlots.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([time, ts]) => ({
          time,
          slots: salas.map(sala => {
            const t = ts.find(t => t.sala === sala);
            return t ? { title: t.modality.nome, level: t.nivel, prof: t.professor.nome } : null;
          })
        }));
    }

    return { dias: dias.map(d => DIA_MAP[d]), salas, grade };
  });

  const dias = $derived(gradeData.dias.length > 0 ? gradeData.dias : ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']);
  const salas = $derived('salas' in gradeData && gradeData.salas ? gradeData.salas : ['Sala 1', 'Sala 2', 'Sala 3']);

  let dia = $state('');
  // Set initial day once data is available
  $effect(() => { if (!dia && dias.length > 0) dia = dias[0]; });

  const linhas = $derived(gradeData.grade[dia] || []);
</script>

<section class="sec-grade" id="grade">
  <div class="container">
    <div class="sec-grade__head">
      <div class="eyebrow">{labelText}</div>
      <h2 class="sec-grade__title">{@html titulo}</h2>
    </div>
    <div class="days">
      {#each dias as d}
        <button class="day-pill {d === dia ? 'is-active' : ''}" onclick={() => dia = d}>
          {d}
        </button>
      {/each}
    </div>
    <div class="grade-table">
      <div class="grade-table__header">
        <div>Horário</div>
        {#each salas as s}
          <div>{s}</div>
        {/each}
      </div>
      {#if linhas.length === 0}
        <div class="grade-row" style="justify-content: center; padding: 40px; color: var(--ink-soft);">
          Nenhuma aula neste dia.
        </div>
      {:else}
        {#each linhas as linha}
          <div class="grade-row">
            <div class="grade-time">{linha.time}</div>
            {#each linha.slots as slot, j}
              {#if slot}
                <div class="grade-slot is-filled" data-sala={salas[j]}>
                  <div class="grade-slot__title">{slot.title}</div>
                  <div class="grade-slot__level">{slot.level}</div>
                  <div class="grade-slot__prof">Prof. {slot.prof}</div>
                </div>
              {:else}
                <div class="grade-slot">—</div>
              {/if}
            {/each}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</section>
