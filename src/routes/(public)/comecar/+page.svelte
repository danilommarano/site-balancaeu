<!-- BalancaEu — Fluxo de Onboarding (/comecar) -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  const modalidades = $derived(data.modalidades ?? []);
  const turmas = $derived(data.turmas ?? []);

  // Module metadata for display
  const MODULE_META: Record<string, { num: string; label: string; meta: string[] }> = {
    'forró-pé-descalço': { num: "01", label: "Tradição", meta: ["3x/sem", "Graduado"] },
    'forró-roots': { num: "02", label: "Raiz", meta: ["2x/sem", "Aberto"] },
    'samba-de-gafieira': { num: "03", label: "Elegância", meta: ["3x/sem", "Níveis"] },
    'zumba': { num: "04", label: "Energia", meta: ["2x/sem", "Livre"] },
  };

  const ENCOURAGE: Record<number, string> = {
    1: "Bom começo. Um ritmo já é um mundo.",
    2: "Dois ritmos — seu corpo vai agradecer.",
    3: "Três? Você veio mesmo pra dançar.",
    4: "Tudo! Bem-vinda(o) à casa por inteiro.",
  };

  // ─── State ───
  let step = $state(0); // 0,1,2 = steps, 3 = success
  let selectedIds = $state<string[]>([]);
  let schedules = $state<Record<string, { dia: string; turmaId: string }>>({});
  let activeModTab = $state('');
  let activeDia = $state('');
  let submitting = $state(false);

  // Day keys matching server data
  const dayKeys = [
    { key: 'SEG', label: 'Segunda', short: 'Seg' },
    { key: 'TER', label: 'Terça', short: 'Ter' },
    { key: 'QUA', label: 'Quarta', short: 'Qua' },
    { key: 'QUI', label: 'Quinta', short: 'Qui' },
    { key: 'SEX', label: 'Sexta', short: 'Sex' },
    { key: 'SAB', label: 'Sábado', short: 'Sáb' },
  ];

  const SALAS = ['Sala 1', 'Sala 2', 'Sala 3'];

  // ─── Derived ───
  const selectedMods = $derived(
    modalidades.filter((m: { id: string }) => selectedIds.includes(m.id))
  );

  $effect(() => {
    if (selectedIds.length > 0 && !selectedIds.includes(activeModTab)) {
      activeModTab = selectedIds[0];
    }
  });

  // Turmas filtered by active module tab
  const turmasDoMod = $derived(
    turmas.filter((t: { modalityId: string }) => t.modalityId === activeModTab)
  );

  // Available days for current module
  const diasDisponiveis = $derived.by(() => {
    const dias = new Set<string>(turmasDoMod.map((t: { diaSemana: string }) => t.diaSemana));
    return dayKeys.filter(d => dias.has(d.key));
  });

  $effect(() => {
    const dias = diasDisponiveis;
    if (dias.length > 0 && !dias.find(d => d.key === activeDia)) {
      activeDia = dias[0].key;
    }
  });

  // Turmas for current day
  const turmasDoDia = $derived(
    turmasDoMod.filter((t: { diaSemana: string }) => t.diaSemana === activeDia)
  );

  // Grid: rows = time slots, columns = salas
  const gradeSlots = $derived.by(() => {
    const slotMap = new Map<string, Record<string, typeof turmas[number] | null>>();
    for (const t of turmasDoDia) {
      const key = `${t.horarioInicio} - ${t.horarioFim}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, { 'Sala 1': null, 'Sala 2': null, 'Sala 3': null });
      }
      slotMap.get(key)![t.sala] = t;
    }
    return Array.from(slotMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  });

  // All turmas for the grid (all modules, for showing non-matching as dimmed)
  const allTurmasDoDia = $derived(
    turmas.filter((t: { diaSemana: string }) => t.diaSemana === activeDia)
  );

  const allGradeSlots = $derived.by(() => {
    const slotMap = new Map<string, Record<string, typeof turmas[number] | null>>();
    for (const t of allTurmasDoDia) {
      const key = `${t.horarioInicio} - ${t.horarioFim}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, { 'Sala 1': null, 'Sala 2': null, 'Sala 3': null });
      }
      slotMap.get(key)![t.sala] = t;
    }
    return Array.from(slotMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  });

  const canNextStep0 = $derived(selectedIds.length > 0);
  const canNextStep1 = $derived(selectedIds.every(id => schedules[id]));

  const placementsList = $derived(
    Object.entries(schedules).map(([modId, sch]) => {
      const m = modalidades.find((x: { id: string }) => x.id === modId);
      const t = turmas.find((x: { id: string }) => x.id === sch.turmaId);
      return { modId, mod: m, turma: t };
    })
  );

  // ─── Actions ───
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter(x => x !== id);
      const next = { ...schedules };
      delete next[id];
      schedules = next;
    } else {
      selectedIds = [...selectedIds, id];
    }
  }

  function removeMod(id: string) {
    selectedIds = selectedIds.filter(x => x !== id);
    const next = { ...schedules };
    delete next[id];
    schedules = next;
  }

  function selectSchedule(modId: string, turmaId: string, dia: string) {
    schedules = { ...schedules, [modId]: { dia, turmaId } };
  }

  function next() {
    if (step === 0 && canNextStep0) step = 1;
    else if (step === 1 && canNextStep1) step = 2;
  }
  function back() { step = Math.max(0, step - 1); }

  function getModMeta(mod: { id: string }) {
    return MODULE_META[mod.id.toLowerCase()] || { num: "01", label: "", meta: [] };
  }

  // Stepper labels
  const STEP_LABELS = ["Módulos", "Nivelamento", "Conta"];
</script>

<svelte:head>
  <title>Começar — Balança Eu</title>
  <meta name="description" content="Escolha suas modalidades e agende seu nivelamento." />
</svelte:head>

<div class="ob">
  <!-- Top bar -->
  <div class="ob-top">
    <a href="/" class="ob-top__logo">
      <span class="ob-top__mark">B</span>
      <span>balança<b>eu</b></span>
    </a>
    <div class="ob-steps">
      {#each [0, 1, 2] as i}
        <div class="ob-step-dot {step > i ? 'is-done' : ''} {step === i ? 'is-active' : ''}">
          <div class="ob-step-dot__num">
            {#if step > i}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
            {:else}
              {i + 1}
            {/if}
          </div>
          <span class="ob-step-dot__label">{STEP_LABELS[i]}</span>
        </div>
        {#if i < 2}
          <div class="ob-step-line {step > i ? 'is-full' : ''}"></div>
        {/if}
      {/each}
    </div>
    <a href="/login" class="ob-top__login">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h5v18h-5"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
      Já tenho conta
    </a>
  </div>

  <!-- Main stage -->
  <div class="ob-stage">
    <!-- Step 1: Modules -->
    {#if step === 0}
      <div class="ob-screen">
        <div class="ob-screen__eyebrow">Passo 1 de 3</div>
        <h1 class="ob-screen__title">Quais <em>módulos</em> fazem seu corpo pulsar?</h1>
        <p class="ob-screen__sub">Pode escolher quantos quiser — cada um vira uma trilha dentro da sua conta, com sua própria graduação e ritmo.</p>

        <div class="ob-mods">
          {#each modalidades as mod, idx}
            {@const isSel = selectedIds.includes(mod.id)}
            {@const meta = getModMeta(mod)}
            <div
              class="ob-mod {isSel ? 'is-selected' : ''}"
              onclick={() => toggle(mod.id)}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(mod.id); } }}
              role="button"
              tabindex="0"
            >
              <div class="ob-mod__bg"></div>
              <div class="ob-mod__shade"></div>
              <span class="ob-mod__num">{meta.num}</span>
              <div class="ob-mod__check">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
              </div>
              <div class="ob-mod__content">
                <span class="ob-mod__label">{meta.label}</span>
                <h3 class="ob-mod__title">{mod.nome}</h3>
                <p class="ob-mod__desc">{mod.descricao}</p>
                <div class="ob-mod__meta">
                  {#each meta.meta as x}
                    <span>· {x}</span>
                  {/each}
                </div>
              </div>
            </div>
          {/each}
        </div>

        <div class="ob-encourage" aria-live="polite">
          {#if selectedIds.length > 0}
            <span class="ob-encourage__kiss">{ENCOURAGE[selectedIds.length] || ENCOURAGE[4]}</span>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Step 2: Schedule -->
    {#if step === 1}
      <div class="ob-screen">
        <div class="ob-screen__eyebrow">Passo 2 de 3</div>
        <h1 class="ob-screen__title">Agende seu <em>nivelamento</em></h1>
        <p class="ob-screen__sub">Escolha um horário de nivelamento para cada módulo. Um mestre avalia seu ponto de partida.</p>

        <div class="ob-info-banner">
          <div class="ob-info-banner__icon">!</div>
          <p>Essa é <strong>apenas a aula de nivelamento</strong> — o professor vai avaliar você. Depois, você pode ser alocado(a) em outra turma com outro horário. E se não se adaptar, tem direito a uma <strong>aula experimental gratuita</strong>.</p>
        </div>

        <div class="ob-sched">
          <div class="ob-mod-tabs">
            {#each selectedIds as id}
              {@const m = modalidades.find((x: { id: string }) => x.id === id)}
              {@const done = !!schedules[id]}
              <button
                class="ob-mod-tab {id === activeModTab ? 'is-active' : ''} {done ? 'is-done' : ''}"
                onclick={() => activeModTab = id}
              >
                <span class="ob-mod-tab__status"></span>
                {m?.nome}
              </button>
            {/each}
          </div>

          <div class="ob-days">
            {#each dayKeys as d}
              {@const hasClasses = turmasDoMod.some((t: { diaSemana: string }) => t.diaSemana === d.key)}
              <button
                class="ob-day {d.key === activeDia ? 'is-active' : ''}"
                disabled={!hasClasses}
                onclick={() => activeDia = d.key}
              >
                {d.short}
              </button>
            {/each}
          </div>

          <div class="ob-grid">
            <div class="ob-grid__head">
              <div>Horário</div><div>Sala 1</div><div>Sala 2</div><div>Sala 3</div>
            </div>
            {#each allGradeSlots as [time, slots]}
              <div class="ob-grid__row">
                <div class="ob-grid__time">{time.split(' - ')[0]}</div>
                {#each SALAS as sala, j}
                  {@const turma = slots[sala]}
                  {#if !turma}
                    <div class="ob-slot ob-slot--empty">—</div>
                  {:else}
                    {@const matches = turma.modalityId === activeModTab}
                    {@const picked = schedules[activeModTab]?.turmaId === turma.id}
                    <button
                      class="ob-slot {matches ? 'ob-slot--match' : 'ob-slot--wrong'} {picked ? 'is-picked' : ''}"
                      data-sala="Sala {j + 1}"
                      onclick={() => { if (matches) selectSchedule(activeModTab, turma.id, activeDia); }}
                      disabled={!matches}
                    >
                      <div class="ob-slot__check">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
                      </div>
                      <div class="ob-slot__title">{turma.modality?.nome}</div>
                      <div class="ob-slot__meta">{turma.nivel} · {turma.professor?.nome}</div>
                    </button>
                  {/if}
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <!-- Step 3: Account -->
    {#if step === 2}
      <div class="ob-screen">
        <div class="ob-screen__eyebrow">Passo 3 de 3</div>
        <h1 class="ob-screen__title">Crie sua <em>conta</em></h1>
        <p class="ob-screen__sub">Último passo — seus nivelamentos já estão reservados.</p>

        <div class="ob-account">
          <form
            method="POST"
            action="?/signup"
            class="ob-form"
            use:enhance={() => {
              submitting = true;
              return async ({ update }) => {
                await update();
                submitting = false;
              };
            }}
          >
            <input
              type="hidden"
              name="placements"
              value={JSON.stringify(Object.values(schedules).map(s => ({ classGroupId: s.turmaId })))}
            />

            {#if form?.error}
              <div class="ob-info-banner" style="background: rgba(226,90,76,0.15); border-color: rgba(226,90,76,0.4);">
                <div class="ob-info-banner__icon" style="background: var(--color-danger); color: white;">!</div>
                <p style="color: var(--ink);">{form.error}</p>
              </div>
            {/if}

            <div class="ob-field">
              <label for="nome">Nome completo</label>
              <input id="nome" name="nome" type="text" placeholder="Como devemos te chamar?" value={form?.nome ?? ''} required />
            </div>
            <div class="ob-field">
              <label for="email">E-mail</label>
              <input id="email" name="email" type="email" placeholder="seu@email.com" value={form?.email ?? ''} required />
            </div>
            <div class="ob-field ob-field--row">
              <div>
                <label for="password">Senha</label>
                <input id="password" name="password" type="password" placeholder="mínimo 6 caracteres" required />
              </div>
              <div>
                <label for="passwordConfirm">Confirmar</label>
                <input id="passwordConfirm" name="passwordConfirm" type="password" placeholder="repita a senha" required />
              </div>
            </div>
            <button type="submit" class="btn btn--primary ob-form__submit" disabled={submitting}>
              {#if submitting}
                Criando sua conta...
              {:else}
                Finalizar e reservar nivelamentos
                <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              {/if}
            </button>
            <p class="ob-form__login">Já tem conta? <a href="/login">Fazer login</a></p>
          </form>

          <aside class="ob-summary">
            <h3>Seu resumo</h3>
            <div class="ob-summary__list">
              {#each placementsList as p}
                <div class="ob-summary-item">
                  <h4>Nivelamento</h4>
                  <div class="ob-summary-item__mod">{p.mod?.nome}</div>
                  {#if p.turma}
                    {@const turmaRef = p.turma}
                    <div class="ob-summary-item__sched">
                      <span>{dayKeys.find(d => d.key === turmaRef.diaSemana)?.short}</span>
                      <span>{turmaRef.horarioInicio}</span>
                      <span>{turmaRef.sala}</span>
                    </div>
                  {:else}
                    <div class="ob-summary-item__sched" style="color: var(--ink-mute)">Sem horário</div>
                  {/if}
                </div>
              {/each}
            </div>
          </aside>
        </div>
      </div>
    {/if}
  </div>

  <!-- Bottom bar -->
  {#if step <= 2}
    <div class="ob-bottom">
      <div class="ob-bottom__count">
        {#if step === 0}
          <strong>{selectedIds.length}</strong> selecionado{selectedIds.length !== 1 ? 's' : ''}
          <div class="ob-bottom__chips">
            {#each selectedIds as id}
              {@const m = modalidades.find((x: { id: string }) => x.id === id)}
              <span class="ob-bottom__chip">
                {m?.nome}
                <button onclick={() => removeMod(id)} aria-label="Remover {m?.nome}">×</button>
              </span>
            {/each}
          </div>
        {:else if step === 1}
          <strong>{Object.keys(schedules).length}/{selectedIds.length}</strong> nivelamentos marcados
        {:else}
          <span style="color: var(--ink-mute); font-size: 13px;">Quase lá — preencha seus dados para confirmar.</span>
        {/if}
      </div>
      <div class="ob-bottom__actions">
        {#if step > 0}
          <button class="ob-back" onclick={back}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Voltar
          </button>
        {/if}
        {#if step < 2}
          <button
            class="ob-next"
            onclick={next}
            disabled={(step === 0 && !canNextStep0) || (step === 1 && !canNextStep1)}
          >
            Continuar
            <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>
