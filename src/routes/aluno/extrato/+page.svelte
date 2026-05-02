<!-- BalancaEu — Extrato Financeiro -->
<script lang="ts">
  import { goto } from '$app/navigation';

  let { data } = $props();

  let filtroTipo = $state(data.filtros.tipo);
  let filtroStatus = $state(data.filtros.status);
  let filtroDe = $state(data.filtros.de);
  let filtroAte = $state(data.filtros.ate);
  let gerandoPdf = $state(false);

  const tipoLabels: Record<string, string> = {
    MENSALIDADE: 'Mensalidade',
    PARTICULAR: 'Aula Particular',
    EVENTO: 'Evento',
    OUTRO: 'Outro'
  };

  const statusLabels: Record<string, string> = {
    PAGO: 'Pago',
    PENDENTE: 'Pendente',
    CANCELADO: 'Cancelado',
    REEMBOLSADO: 'Reembolsado'
  };

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatCurrency(val: number): string {
    return `R$ ${val.toFixed(2).replace('.', ',')}`;
  }

  function aplicarFiltros() {
    const params = new URLSearchParams();
    if (filtroTipo) params.set('tipo', filtroTipo);
    if (filtroStatus) params.set('status', filtroStatus);
    if (filtroDe) params.set('de', filtroDe);
    if (filtroAte) params.set('ate', filtroAte);
    const qs = params.toString();
    goto(`/aluno/extrato${qs ? '?' + qs : ''}`, { invalidateAll: true });
  }

  function limparFiltros() {
    filtroTipo = '';
    filtroStatus = '';
    filtroDe = '';
    filtroAte = '';
    goto('/aluno/extrato', { invalidateAll: true });
  }

  let temFiltrosAtivos = $derived(!!filtroTipo || !!filtroStatus || !!filtroDe || !!filtroAte);

  async function baixarPdf() {
    gerandoPdf = true;
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      const escola = data.escola;

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(escola?.nome ?? 'BalancaEu', 14, 22);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      const infoLines: string[] = [];
      if (escola?.emailContato) infoLines.push(escola.emailContato);
      if (escola?.telefone) infoLines.push(escola.telefone);
      if (escola?.endereco) infoLines.push(escola.endereco);
      doc.text(infoLines.join('  |  '), 14, 28);

      doc.setTextColor(0);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Extrato Financeiro', 14, 40);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      doc.text(`Gerado em ${hoje}`, 14, 46);

      if (filtroDe || filtroAte) {
        const periodo = [filtroDe ? `De: ${filtroDe}` : '', filtroAte ? `Até: ${filtroAte}` : ''].filter(Boolean).join('  ');
        doc.text(periodo, 14, 51);
      }

      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const summaryY = filtroDe || filtroAte ? 60 : 55;
      doc.text(`Total Pago: ${formatCurrency(data.resumo.totalPago)}`, 14, summaryY);
      doc.text(`Total Pendente: ${formatCurrency(data.resumo.totalPendente)}`, 90, summaryY);
      doc.text(`Transações: ${data.resumo.count}`, 166, summaryY);

      const tableData = data.transacoes.map(t => [
        formatDate(t.data),
        t.descricao,
        tipoLabels[t.tipo] ?? t.tipo,
        formatCurrency(t.valor),
        statusLabels[t.status] ?? t.status
      ]);

      autoTable(doc, {
        startY: summaryY + 6,
        head: [['Data', 'Descrição', 'Tipo', 'Valor', 'Status']],
        body: tableData,
        headStyles: { fillColor: [39, 39, 42], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 28 },
          3: { halign: 'right', cellWidth: 28 },
          4: { cellWidth: 24 }
        },
        margin: { left: 14, right: 14 }
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
      }

      doc.save(`extrato-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error('Erro ao gerar PDF:', e);
    } finally {
      gerandoPdf = false;
    }
  }
</script>

<svelte:head>
  <title>Extrato Financeiro — Balança Eu</title>
</svelte:head>

<div class="page-head" style="display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
  <div>
    <h1 class="page-title">Extrato <em>Financeiro</em></h1>
    <p class="page-sub">Histórico de pagamentos e transações.</p>
  </div>
  {#if data.transacoes.length > 0}
    <button type="button" class="btn btn--primary" onclick={baixarPdf} disabled={gerandoPdf}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
      {gerandoPdf ? 'Gerando...' : 'Baixar PDF'}
    </button>
  {/if}
</div>

<div class="stat-grid">
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__icon is-success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
      </div>
      Total Pago
    </div>
    <div class="stat-card__value is-success">{formatCurrency(data.resumo.totalPago)}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__icon" style="color: var(--warning); background: rgba(196,138,42,0.12);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
      </div>
      Pendente
    </div>
    <div class="stat-card__value is-warning">{formatCurrency(data.resumo.totalPendente)}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__icon" style="color: var(--danger); background: rgba(182,67,52,0.12);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
      </div>
      Cancelado
    </div>
    <div class="stat-card__value is-danger">{formatCurrency(data.resumo.totalCancelado)}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <div class="stat-card__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M8 12h8M8 16h6"/></svg>
      </div>
      Transações
    </div>
    <div class="stat-card__value">{data.resumo.count}</div>
  </div>
</div>

<div style="margin-top: 28px;"></div>

<div class="filters-bar">
  <div class="filters-bar__title">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
    Filtros
  </div>
  <div class="field">
    <label for="f-tipo">Tipo</label>
    <select id="f-tipo" bind:value={filtroTipo} onchange={aplicarFiltros}>
      <option value="">Todos</option>
      <option value="MENSALIDADE">Mensalidade</option>
      <option value="PARTICULAR">Aula Particular</option>
      <option value="EVENTO">Evento</option>
      <option value="OUTRO">Outro</option>
    </select>
  </div>
  <div class="field">
    <label for="f-status">Status</label>
    <select id="f-status" bind:value={filtroStatus} onchange={aplicarFiltros}>
      <option value="">Todos</option>
      <option value="PAGO">Pago</option>
      <option value="PENDENTE">Pendente</option>
      <option value="CANCELADO">Cancelado</option>
    </select>
  </div>
  <div class="field">
    <label for="f-de">De</label>
    <input id="f-de" type="date" bind:value={filtroDe} onchange={aplicarFiltros} />
  </div>
  <div class="field">
    <label for="f-ate">Até</label>
    <input id="f-ate" type="date" bind:value={filtroAte} onchange={aplicarFiltros} />
  </div>
</div>

{#if temFiltrosAtivos}
  <div style="margin-bottom: 16px;">
    <button type="button" class="btn--link" onclick={limparFiltros}>Limpar filtros ✕</button>
  </div>
{/if}

{#if data.transacoes.length === 0}
  <div class="placeholder-card" style="padding: 80px 30px;">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M8 12h8M8 16h6M8 8h4"/></svg>
    <h3>Nenhuma transação</h3>
    <p>
      {temFiltrosAtivos
        ? 'Nenhuma transação encontrada com os filtros aplicados.'
        : 'Seu extrato aparecerá aqui quando houver movimentações.'}
    </p>
  </div>
{:else}
  <div class="card">
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="text-align: left; color: var(--ink-mute); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid var(--line);">
            <th style="padding: 10px 14px;">Data</th>
            <th style="padding: 10px 14px;">Descrição</th>
            <th style="padding: 10px 14px;">Tipo</th>
            <th style="padding: 10px 14px; text-align: right;">Valor</th>
            <th style="padding: 10px 14px;">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each data.transacoes as t}
            <tr style="border-bottom: 1px solid var(--line);">
              <td style="padding: 12px 14px; color: var(--ink-soft); white-space: nowrap;">{formatDate(t.data)}</td>
              <td style="padding: 12px 14px; color: var(--ink);">{t.descricao}</td>
              <td style="padding: 12px 14px; color: var(--ink-soft);">{tipoLabels[t.tipo] ?? t.tipo}</td>
              <td style="padding: 12px 14px; text-align: right; font-weight: 600; white-space: nowrap; color: {t.valor < 0 ? 'var(--danger)' : 'var(--ink)'};">
                {t.valor < 0 ? '- ' : ''}{formatCurrency(Math.abs(t.valor))}
              </td>
              <td style="padding: 12px 14px;">
                <span style="font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: var(--creme-warm); color: var(--ink-soft); border: 1px solid var(--line);">
                  {statusLabels[t.status] ?? t.status}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}
