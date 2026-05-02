<!-- BalancaEu — Professor: Agenda Semanal (Google Calendar style) -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';

  let { data, form } = $props();

  const DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'] as const;
  const DIAS_FULL: Record<string, string> = {
    DOM: 'Domingo', SEG: 'Segunda', TER: 'Terça', QUA: 'Quarta',
    QUI: 'Quinta', SEX: 'Sexta', SAB: 'Sábado'
  };

  const HOUR_HEIGHT = 48; // px por hora
  const START_HOUR = 6;
  const END_HOUR = 23;
  const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  function timeToMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }
  function timeToY(t: string): number {
    return ((timeToMinutes(t) - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  }
  function durationToHeight(start: string, end: string): number {
    return ((timeToMinutes(end) - timeToMinutes(start)) / 60) * HOUR_HEIGHT;
  }
  function pad(n: number): string {
    return String(n).padStart(2, '0');
  }
  function snapToHHMM(minutesFromStart: number): string {
    const totalMin = Math.max(0, Math.round(minutesFromStart / 30) * 30);
    const total = START_HOUR * 60 + totalMin;
    const h = Math.min(END_HOUR, Math.floor(total / 60));
    const m = total % 60;
    return `${pad(h)}:${pad(m)}`;
  }

  function format12hLabel(h: number): string {
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
  }
  function format12hEvent(t: string, includePeriod = true): string {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    const base = m === 0 ? `${h12}` : `${h12}:${pad(m)}`;
    return includePeriod ? `${base}${period}` : base;
  }
  function eventTimeRange(start: string, end: string): string {
    const sh = parseInt(start.split(':')[0], 10);
    const eh = parseInt(end.split(':')[0], 10);
    const samePeriod = (sh >= 12) === (eh >= 12);
    return samePeriod
      ? `${format12hEvent(start, false)} – ${format12hEvent(end)}`
      : `${format12hEvent(start)} – ${format12hEvent(end)}`;
  }

  type Evento = (typeof data.eventos)[number];
  const eventosPorDia = $derived(
    DIAS.reduce((acc, dia) => {
      acc[dia] = data.eventos
        .filter(e => e.dia === dia)
        .sort((a, b) => a.inicio.localeCompare(b.inicio));
      return acc;
    }, {} as Record<string, Evento[]>)
  );

  // Modal de adicionar disponibilidade
  let modalOpen = $state(false);
  let novoDia = $state<string>('SEG');
  let novoInicio = $state('09:00');
  let novoFim = $state('10:00');

  // Click-and-drag para definir bloco visualmente
  type DragState = { dia: string; startY: number; currentY: number; colEl: HTMLElement };
  let dragState = $state<DragState | null>(null);

  function abrirModalRange(dia: string, startY: number, endY: number) {
    const startMin = (startY / HOUR_HEIGHT) * 60;
    const endMin = (endY / HOUR_HEIGHT) * 60;
    novoDia = dia;
    novoInicio = snapToHHMM(startMin);
    novoFim = snapToHHMM(endMin);
    modalOpen = true;
  }

  function abrirModalQuick(dia: string, y: number) {
    // Click rápido (sem drag): sugere bloco grande de 4h, capando no fim do dia
    const minFromStart = (y / HOUR_HEIGHT) * 60;
    const totalMin = (END_HOUR - START_HOUR) * 60;
    const endMin = Math.min(minFromStart + 240, totalMin);
    novoDia = dia;
    novoInicio = snapToHHMM(minFromStart);
    novoFim = snapToHHMM(endMin);
    modalOpen = true;
  }

  function onColPointerDown(e: PointerEvent, dia: string) {
    if ((e.target as HTMLElement).closest('.cal__event')) return;
    if (e.button !== 0) return; // só botão esquerdo
    e.preventDefault();
    const colEl = e.currentTarget as HTMLElement;
    const rect = colEl.getBoundingClientRect();
    const y = Math.max(0, Math.min(TOTAL_HEIGHT, e.clientY - rect.top));
    dragState = { dia, startY: y, currentY: y, colEl };

    function onMove(ev: PointerEvent) {
      if (!dragState) return;
      const r = dragState.colEl.getBoundingClientRect();
      const newY = Math.max(0, Math.min(TOTAL_HEIGHT, ev.clientY - r.top));
      dragState = { ...dragState, currentY: newY };
    }
    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (!dragState) return;
      const { dia, startY, currentY } = dragState;
      const min = Math.min(startY, currentY);
      const max = Math.max(startY, currentY);
      dragState = null;
      // Threshold ~10px = considera click; abaixo disso sugere bloco grande
      if (max - min < 10) {
        abrirModalQuick(dia, min);
      } else {
        abrirModalRange(dia, min, max);
      }
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  function handleAddSubmit() {
    return async ({ result }: any) => {
      if (result.type === 'success') {
        modalOpen = false;
        await invalidateAll();
      }
    };
  }
  function handleRemoveSubmit() {
    return async ({ result }: any) => {
      if (result.type === 'success') await invalidateAll();
    };
  }

  // Linha "agora" — atualiza a cada minuto
  let nowY = $state(-1);
  let nowDia = $derived(data.dias.find(d => d.isToday)?.dia ?? null);
  $effect(() => {
    function tick() {
      const d = new Date();
      const min = d.getHours() * 60 + d.getMinutes();
      const y = ((min - START_HOUR * 60) / 60) * HOUR_HEIGHT;
      nowY = y >= 0 && y <= TOTAL_HEIGHT ? y : -1;
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  });

  // Auto-scroll até "agora" (ou 8 AM se for dia diferente)
  let bodyEl: HTMLDivElement;
  onMount(() => {
    if (!bodyEl) return;
    const target = nowY >= 0 ? Math.max(0, nowY - 100) : (8 - START_HOUR) * HOUR_HEIGHT;
    bodyEl.scrollTop = target;
  });

  // Esc fecha modal
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && modalOpen) modalOpen = false;
  }
</script>

<svelte:head>
  <title>Agenda — Professor · Balança Eu</title>
</svelte:head>
<svelte:window on:keydown={onKey} />

<div class="page-head">
  <div>
    <h1 class="page-title">Agenda <em>Semanal</em></h1>
    <p class="page-sub">Clique e arraste para definir blocos de tempo livre — alunos podem agendar particulares em qualquer horário dentro do bloco.</p>
  </div>
</div>

<div class="cal-toolbar">
  <a href={data.nav.hoje} class="cal-toolbar__hoje">Hoje</a>
  <div class="cal-toolbar__nav">
    <a href={data.nav.prev} class="cal-toolbar__arrow" aria-label="Semana anterior">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </a>
    <a href={data.nav.next} class="cal-toolbar__arrow" aria-label="Próxima semana">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </a>
  </div>
  <h2 class="cal-toolbar__title">{data.intervalo}</h2>
  <div class="cal-toolbar__legend">
    <span class="cal-legend__item"><i class="cal-legend__dot cal-legend__dot--turma"></i>Turmas</span>
    <span class="cal-legend__item"><i class="cal-legend__dot cal-legend__dot--particular"></i>Particulares</span>
    <span class="cal-legend__item"><i class="cal-legend__dot cal-legend__dot--livre"></i>Livre</span>
  </div>
</div>

{#if form?.success}
  <div class="cal-toast cal-toast--success">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>
    {form.message}
  </div>
{/if}
{#if form?.error}
  <div class="cal-toast cal-toast--error">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
    {form.error}
  </div>
{/if}

<div class="cal">
  <div class="cal__scroll" bind:this={bodyEl}>
    <div class="cal__header">
      <div class="cal__corner"><span>{data.tzLabel}</span></div>
      {#each data.dias as d}
        <div class="cal__day-head">
          <span class="cal__day-name {d.isToday ? 'is-today' : ''}">{d.label}</span>
          <span class="cal__day-num {d.isToday ? 'is-today' : ''}">{d.dateNumber}</span>
        </div>
      {/each}
    </div>

    <div class="cal__grid" style="height: {TOTAL_HEIGHT}px;">
      <div class="cal__hours">
        {#each HOURS as h, i}
          {#if i > 0}
            <div class="cal__hour-cell" style="top: {i * HOUR_HEIGHT}px;">
              <span>{format12hLabel(h)}</span>
            </div>
          {/if}
        {/each}
      </div>

      {#each DIAS as dia}
        <div
          class="cal__col"
          role="button"
          tabindex="0"
          aria-label="Adicionar disponibilidade em {DIAS_FULL[dia]}"
          onpointerdown={(e) => onColPointerDown(e, dia)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirModalQuick(dia, 0); } }}
        >
          {#each HOURS as h, i}
            {#if i > 0}
              <div class="cal__grid-line" style="top: {i * HOUR_HEIGHT}px;"></div>
            {/if}
          {/each}

          {#if dragState && dragState.dia === dia}
            {@const minY = Math.min(dragState.startY, dragState.currentY)}
            {@const maxY = Math.max(dragState.startY, dragState.currentY)}
            {#if maxY - minY > 4}
              <div class="cal__drag-preview" style="top: {minY}px; height: {maxY - minY}px;">
                <span>{snapToHHMM((minY / HOUR_HEIGHT) * 60)} – {snapToHHMM((maxY / HOUR_HEIGHT) * 60)}</span>
              </div>
            {/if}
          {/if}

          {#if dia === nowDia && nowY >= 0}
            <div class="cal__now" style="top: {nowY}px;"></div>
          {/if}

          {#each eventosPorDia[dia] as ev}
            <div
              class="cal__event cal__event--{ev.tipo}"
              style="top: {timeToY(ev.inicio)}px; height: {Math.max(durationToHeight(ev.inicio, ev.fim), 22)}px;"
            >
              <div class="cal__event-title">{ev.titulo}</div>
              <div class="cal__event-time">{eventTimeRange(ev.inicio, ev.fim)}</div>
              {#if ev.subtitulo}
                <div class="cal__event-sub">{ev.subtitulo}</div>
              {/if}
              {#if ev.tipo === 'disponibilidade'}
                <form method="POST" action="?/removerDisponibilidade" use:enhance={handleRemoveSubmit} class="cal__event-remove-form">
                  <input type="hidden" name="id" value={ev.id} />
                  <button type="submit" class="cal__event-remove" aria-label="Remover horário livre">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                  </button>
                </form>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

{#if modalOpen}
  <div class="modal-backdrop" onclick={() => modalOpen = false} role="presentation">
    <div class="modal-card" onclick={(e) => e.stopPropagation()} role="dialog" aria-label="Adicionar horário livre">
      <div class="modal-card__head">
        <h3>Marcar horário livre</h3>
        <button type="button" class="modal-card__close" onclick={() => modalOpen = false} aria-label="Fechar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <p class="modal-card__sub">Defina um bloco amplo de tempo livre. Alunos poderão agendar uma aula particular em qualquer horário dentro dele.</p>
      <form method="POST" action="?/adicionarDisponibilidade" use:enhance={handleAddSubmit}>
        <div class="field">
          <label for="diaSemana">Dia da semana</label>
          <select id="diaSemana" name="diaSemana" bind:value={novoDia} required>
            {#each DIAS as d}
              <option value={d}>{DIAS_FULL[d]}</option>
            {/each}
          </select>
        </div>
        <div class="modal-card__row">
          <div class="field">
            <label for="horarioInicio">Início</label>
            <input id="horarioInicio" name="horarioInicio" type="time" bind:value={novoInicio} required />
          </div>
          <div class="field">
            <label for="horarioFim">Fim</label>
            <input id="horarioFim" name="horarioFim" type="time" bind:value={novoFim} required />
          </div>
        </div>
        <div class="modal-card__actions">
          <button type="button" class="btn" onclick={() => modalOpen = false}>Cancelar</button>
          <button type="submit" class="btn btn--primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Adicionar
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
