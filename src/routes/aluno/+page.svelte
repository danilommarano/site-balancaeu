<!-- BalancaEu — Dashboard do Aluno -->
<script lang="ts">
  import { page } from '$app/stores';

  let { data } = $props();

  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const DIAS_FULL: Record<string, string> = {
    SEG: 'Segunda-feira', TER: 'Terça-feira', QUA: 'Quarta-feira', QUI: 'Quinta-feira',
    SEX: 'Sexta-feira', SAB: 'Sábado', DOM: 'Domingo'
  };
  const MESES_FULL = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatNivLine(iso: string, nivel: string, professor: string, sala: string): string {
    const d = new Date(iso);
    const diaSemana = DIAS_FULL[['DOM','SEG','TER','QUA','QUI','SEX','SAB'][d.getDay()]] ?? '';
    const dia = d.getDate();
    const mes = MESES_FULL[d.getMonth()];
    const hora = formatTime(iso);
    return `${diaSemana}, ${dia} de ${mes} · ${hora} · Nível ${nivel} · Prof. ${professor} · ${sala}`;
  }

  let showWelcome = $state($page.url.searchParams.get('welcome') === '1');
  const nivelamentos = $derived(data.nivelamentos ?? []);
  const firstName = $derived(data.user?.nome?.split(' ')[0] ?? 'Aluno');
</script>

<svelte:head>
  <title>Minha Área — Balança Eu</title>
</svelte:head>

{#if showWelcome && nivelamentos.length > 0}
  <div class="alert" style="margin-bottom: 24px;">
    <div class="alert__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 22h20L12 2z"/><path d="M12 10v4M12 18h.01"/></svg>
    </div>
    <div class="alert__body">
      <strong>Bem-vindo(a) ao Balança Eu!</strong>
      <p>Sua conta foi criada e seus nivelamentos estão agendados. Nos vemos em breve!</p>
    </div>
  </div>
{/if}

{#if nivelamentos.length > 0}
  <section class="upcoming">
    <div class="upcoming__head">
      <div class="upcoming__head-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
      </div>
      <div>
        <h3>Seus nivelamentos agendados</h3>
        <p>Compareça às escolas nas datas abaixo para conhecer seu nível e os professores.</p>
      </div>
    </div>

    <div class="upcoming__list">
      {#each nivelamentos as niv}
        {@const d = new Date(niv.dataHora)}
        <div class="upcoming-row">
          <div class="upcoming-date">
            <small>{MESES[d.getMonth()]}</small>
            <strong>{String(d.getDate()).padStart(2, '0')}</strong>
          </div>
          <div class="upcoming-info">
            <h4>{niv.modalidade}</h4>
            <p>{formatNivLine(niv.dataHora, niv.nivel, niv.professor, niv.sala)}</p>
          </div>
          <div class="upcoming-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            {formatTime(niv.dataHora)}
          </div>
        </div>
      {/each}
    </div>

    <div class="upcoming__footer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
      <span>Após o nivelamento você poderá se alocar em uma turma com este horário. Se não se adaptar, você tem direito a <a href="#">uma aula experimental gratuita</a>.</span>
    </div>
  </section>
{/if}

<section style="margin-top: {nivelamentos.length > 0 ? '44px' : '0'};">
  <h1 class="page-title">Olá, <em>{firstName}!</em></h1>
  <p class="page-sub">Bem-vindo à sua área.</p>

  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-card__head">
        <div class="stat-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
        </div>
        Meu Plano
      </div>
      {#if data.planoAtual}
        <div class="stat-card__value is-small">{data.planoAtual.nome}</div>
        <div class="stat-card__hint">R$ {data.planoAtual.preco.toFixed(2)}/mês</div>
      {:else}
        <div class="stat-card__value is-small" style="font-family: var(--italic); font-style: italic; color: var(--ink-soft);">Sem plano</div>
        <div class="stat-card__hint"><a href="/aluno/plano" style="color: var(--terracota); font-weight: 600;">Escolher plano →</a></div>
      {/if}
    </div>

    <div class="stat-card stat-card--coral">
      <div class="stat-card__head">
        <div class="stat-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M15 20c0-2 2-4 4-4s2 1 2 2"/></svg>
        </div>
        Turmas
      </div>
      <div class="stat-card__value">{data.totalTurmas}</div>
      <div class="stat-card__hint">inscrições ativas</div>
    </div>

    <div class="stat-card stat-card--ocre">
      <div class="stat-card__head">
        <div class="stat-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        Presenças no mês
      </div>
      <div class="stat-card__value">{data.presencasMes}</div>
      <div class="stat-card__hint">aulas com presença</div>
    </div>

    <div class="stat-card stat-card--plum">
      <div class="stat-card__head">
        <div class="stat-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
        </div>
        Máx. aulas/sem
      </div>
      {#if data.planoAtual}
        <div class="stat-card__value">{data.planoAtual.maxAulasSemana}</div>
      {:else}
        <div class="stat-card__value" style="font-family: var(--italic); font-style: italic; color: var(--ink-mute);">—</div>
      {/if}
      <div class="stat-card__hint">permitidas pelo plano</div>
    </div>
  </div>
</section>

<div class="two-col">
  <div class="card">
    <div class="card__head">
      <div class="card__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M15 20c0-2 2-4 4-4s2 1 2 2"/></svg>
        Minhas Turmas
      </div>
      <a class="btn--link" href="/aluno/inscricoes">Ver todas →</a>
    </div>
    {#if data.turmas.length === 0}
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
        </div>
        <p>Você não está inscrito em nenhuma turma.</p>
        <a href="/aluno/inscricoes">Explorar turmas</a>
      </div>
    {:else}
      <div class="upcoming__list">
        {#each data.turmas as turma}
          <div class="upcoming-row">
            <div class="upcoming-date">
              <small>{turma.diaSemana}</small>
              <strong style="font-size: 16px;">{turma.horarioInicio}</strong>
            </div>
            <div class="upcoming-info">
              <h4>{turma.modalidade}</h4>
              <p>{turma.nivel} · Prof. {turma.professor} · {turma.sala}</p>
            </div>
            <div class="upcoming-time">
              {turma.horarioInicio}–{turma.horarioFim}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="card">
    <div class="card__head">
      <div class="card__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><circle cx="12" cy="14" r="1.2" fill="currentColor"/></svg>
        Próximos Eventos
      </div>
    </div>
    {#if data.eventos.length === 0}
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>
        </div>
        <p>Nenhum evento agendado.</p>
      </div>
    {:else}
      <div class="upcoming__list">
        {#each data.eventos as evento}
          {@const d = new Date(evento.data)}
          <div class="upcoming-row">
            <div class="upcoming-date">
              <small>{MESES[d.getMonth()]}</small>
              <strong>{String(d.getDate()).padStart(2, '0')}</strong>
            </div>
            <div class="upcoming-info">
              <h4>{evento.titulo}</h4>
              <p>{evento.horario} · {evento.local}</p>
            </div>
            <div class="upcoming-time">
              {#if evento.preco}
                R$ {evento.preco.toFixed(2)}
              {:else}
                Gratuito
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
