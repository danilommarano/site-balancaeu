<!-- Pulso — Extrato Financeiro (Fase 11) -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let { data } = $props();

  // Filter state (initialized from URL params)
  let filtroTipo = $state(data.filtros.tipo);
  let filtroStatus = $state(data.filtros.status);
  let filtroDe = $state(data.filtros.de);
  let filtroAte = $state(data.filtros.ate);
  let gerandoPdf = $state(false);

  const tipoLabels: Record<string, { label: string; icon: string }> = {
    MENSALIDADE: { label: 'Mensalidade', icon: 'credit_card' },
    PARTICULAR: { label: 'Aula Particular', icon: 'event' },
    EVENTO: { label: 'Evento', icon: 'celebration' },
    OUTRO: { label: 'Outro', icon: 'receipt' }
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    PAGO: { label: 'Pago', color: 'text-emerald-400 bg-emerald-400/10' },
    PENDENTE: { label: 'Pendente', color: 'text-amber-400 bg-amber-400/10' },
    CANCELADO: { label: 'Cancelado', color: 'text-red-400 bg-red-400/10' },
    REEMBOLSADO: { label: 'Reembolsado', color: 'text-blue-400 bg-blue-400/10' }
  };

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatCurrency(val: number): string {
    return `R$ ${val.toFixed(2)}`;
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

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(escola?.nome ?? 'Pulso', 14, 22);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      const infoLines: string[] = [];
      if (escola?.emailContato) infoLines.push(escola.emailContato);
      if (escola?.telefone) infoLines.push(escola.telefone);
      if (escola?.endereco) infoLines.push(escola.endereco);
      doc.text(infoLines.join('  |  '), 14, 28);

      // Title
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

      // Summary
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const summaryY = filtroDe || filtroAte ? 60 : 55;
      doc.text(`Total Pago: ${formatCurrency(data.resumo.totalPago)}`, 14, summaryY);
      doc.text(`Total Pendente: ${formatCurrency(data.resumo.totalPendente)}`, 90, summaryY);
      doc.text(`Transações: ${data.resumo.count}`, 166, summaryY);

      // Table
      const tableData = data.transacoes.map(t => [
        formatDate(t.data),
        t.descricao,
        tipoLabels[t.tipo]?.label ?? t.tipo,
        formatCurrency(t.valor),
        statusLabels[t.status]?.label ?? t.status
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

      // Footer
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
  <title>Extrato — Pulso</title>
</svelte:head>

<div>
  <div class="flex items-start justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Extrato Financeiro</h1>
      <p class="text-zinc-500 text-sm">Histórico de pagamentos e transações</p>
    </div>
    {#if data.transacoes.length > 0}
      <button
        onclick={baixarPdf}
        disabled={gerandoPdf}
        class="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        <span class="material-symbols-outlined text-[18px]">{gerandoPdf ? 'hourglass_top' : 'picture_as_pdf'}</span>
        {gerandoPdf ? 'Gerando...' : 'Baixar PDF'}
      </button>
    {/if}
  </div>

  <!-- Resumo Financeiro -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Total Pago</span>
      <p class="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(data.resumo.totalPago)}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Pendente</span>
      <p class="text-lg font-bold text-amber-400 mt-1">{formatCurrency(data.resumo.totalPendente)}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Cancelado</span>
      <p class="text-lg font-bold text-red-400 mt-1">{formatCurrency(data.resumo.totalCancelado)}</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Transações</span>
      <p class="text-lg font-bold text-white mt-1">{data.resumo.count}</p>
    </div>
  </div>

  <!-- Filtros -->
  <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
    <div class="flex items-center gap-2 mb-3">
      <span class="material-symbols-outlined text-[18px] text-zinc-400">filter_list</span>
      <span class="text-xs font-medium text-zinc-400">Filtros</span>
      {#if temFiltrosAtivos}
        <button onclick={limparFiltros} class="ml-auto text-[11px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">close</span>
          Limpar
        </button>
      {/if}
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div>
        <label for="f-tipo" class="block text-[10px] text-zinc-500 mb-1">Tipo</label>
        <select id="f-tipo" bind:value={filtroTipo} onchange={aplicarFiltros}
          class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500">
          <option value="">Todos</option>
          <option value="MENSALIDADE">Mensalidade</option>
          <option value="PARTICULAR">Aula Particular</option>
          <option value="EVENTO">Evento</option>
          <option value="OUTRO">Outro</option>
        </select>
      </div>
      <div>
        <label for="f-status" class="block text-[10px] text-zinc-500 mb-1">Status</label>
        <select id="f-status" bind:value={filtroStatus} onchange={aplicarFiltros}
          class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500">
          <option value="">Todos</option>
          <option value="PAGO">Pago</option>
          <option value="PENDENTE">Pendente</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>
      <div>
        <label for="f-de" class="block text-[10px] text-zinc-500 mb-1">De</label>
        <input id="f-de" type="date" bind:value={filtroDe} onchange={aplicarFiltros}
          class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
      </div>
      <div>
        <label for="f-ate" class="block text-[10px] text-zinc-500 mb-1">Até</label>
        <input id="f-ate" type="date" bind:value={filtroAte} onchange={aplicarFiltros}
          class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
      </div>
    </div>
  </div>

  <!-- Tabela de Transações -->
  {#if data.transacoes.length === 0}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
      <span class="material-symbols-outlined text-5xl text-zinc-700 mb-3">receipt_long</span>
      <h2 class="text-lg font-semibold text-white mb-1">Nenhuma transação</h2>
      <p class="text-zinc-500 text-sm">
        {temFiltrosAtivos ? 'Nenhuma transação encontrada com os filtros aplicados.' : 'Seu extrato aparecerá aqui quando houver movimentações.'}
      </p>
      {#if temFiltrosAtivos}
        <button onclick={limparFiltros} class="mt-3 text-emerald-400 text-sm hover:underline">Limpar filtros</button>
      {/if}
    </div>
  {:else}
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-[11px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
              <th class="px-5 py-3">Data</th>
              <th class="px-5 py-3">Descrição</th>
              <th class="px-5 py-3">Tipo</th>
              <th class="px-5 py-3 text-right">Valor</th>
              <th class="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/50">
            {#each data.transacoes as t}
              {@const tipo = tipoLabels[t.tipo] ?? tipoLabels.OUTRO}
              {@const st = statusLabels[t.status] ?? statusLabels.PENDENTE}
              <tr class="hover:bg-zinc-800/30 transition-colors">
                <td class="px-5 py-3 text-zinc-400 whitespace-nowrap">{formatDate(t.data)}</td>
                <td class="px-5 py-3 text-white">{t.descricao}</td>
                <td class="px-5 py-3">
                  <span class="flex items-center gap-1.5 text-zinc-400">
                    <span class="material-symbols-outlined text-[16px]">{tipo.icon}</span>
                    {tipo.label}
                  </span>
                </td>
                <td class="px-5 py-3 text-right font-medium whitespace-nowrap {t.valor < 0 ? 'text-red-400' : 'text-white'}">
                  {t.valor < 0 ? '- ' : ''}{formatCurrency(Math.abs(t.valor))}
                </td>
                <td class="px-5 py-3">
                  <span class="text-[11px] font-medium px-2 py-0.5 rounded-full {st.color}">{st.label}</span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
