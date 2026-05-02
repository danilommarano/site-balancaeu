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
  <title>Disponibilidade — Professor · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Minha <em>Disponibilidade</em></h1>
    <p class="page-sub">Configure os horários em que você está disponível para aulas particulares</p>
  </div>
</div>

{#if form?.success}
  <div class="alert alert--success">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>
    {form.message}
  </div>
{/if}
{#if form?.error}
  <div class="alert">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
    {form.error}
  </div>
{/if}

<div class="two-col" style="grid-template-columns: 1fr 1.4fr; margin-top: 0;">
  <div class="card">
    <div class="card__head">
      <div class="card__title blue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
        Adicionar Horário
      </div>
    </div>
    <form method="POST" action="?/adicionar" use:enhance style="display:flex; flex-direction:column; gap:14px;">
      <div class="field">
        <label for="diaSemana">Dia da semana</label>
        <select id="diaSemana" name="diaSemana" required>
          {#each diasOptions as dia}
            <option value={dia}>{diasLabels[dia]}</option>
          {/each}
        </select>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="field">
          <label for="horarioInicio">Início</label>
          <input id="horarioInicio" name="horarioInicio" type="time" required placeholder="--:--" />
        </div>
        <div class="field">
          <label for="horarioFim">Fim</label>
          <input id="horarioFim" name="horarioFim" type="time" required placeholder="--:--" />
        </div>
      </div>
      <button type="submit" class="btn btn--primary" style="width:100%;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        Adicionar
      </button>
    </form>
  </div>

  {#if data.disponibilidades.length === 0}
    <div class="card">
      <div class="empty">
        <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></div>
        <p>Nenhuma disponibilidade. Adicione seus horários para aulas particulares.</p>
      </div>
    </div>
  {:else}
    <div class="dispo-list">
      {#each disponibilidadesPorDia as grupo}
        <div class="dispo-day">
          <div class="dispo-day__head">
            <div class="dispo-day__name">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>
              {grupo.label}
            </div>
            <div class="dispo-day__count">{grupo.slots.length} horário{grupo.slots.length !== 1 ? 's' : ''}</div>
          </div>
          {#each grupo.slots as slot}
            <div class="dispo-slot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              <span class="dispo-slot__time">{slot.horarioInicio} – {slot.horarioFim}</span>
              <form method="POST" action="?/remover" use:enhance style="margin-left:auto;">
                <input type="hidden" name="id" value={slot.id} />
                <button type="submit" class="dispo-slot__remove">Remover</button>
              </form>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>
