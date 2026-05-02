<!-- BalancaEu — Admin: CMS (Gerenciador de Conteúdo) -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import ImageUpload from '$lib/components/admin/ImageUpload.svelte';

  let { data, form } = $props();

  let activeSection = $state<string | null>(null);
  let showPreview = $state(false);
  let feedbackVisible = $state(true);
  let previewKey = $state(0);
  let previewIframe = $state<HTMLIFrameElement | null>(null);

  $effect(() => {
    if (form?.success) {
      feedbackVisible = true;
      previewKey++;
      if (previewIframe) {
        previewIframe.src = '/?_t=' + Date.now();
      }
      const timer = setTimeout(() => { feedbackVisible = false; }, 3000);
      return () => clearTimeout(timer);
    }
    if (form?.error) {
      feedbackVisible = true;
    }
  });

  type ChaveConfig = { chave: string; label: string; tipo: 'texto' | 'imagem' | 'textarea' };
  type SecaoConfig = { label: string; chaves: ChaveConfig[] };

  let secoesConfig: Record<string, SecaoConfig> = $derived(data.secoesConfig);
  let secaoKeys = $derived(Object.keys(secoesConfig));

  function getConteudo(secao: string, chave: string): string {
    const item = data.conteudos.find(
      (c: { secao: string; chave: string }) => c.secao === secao && c.chave === chave
    );
    if (!item) return '';
    return item.valorTexto ?? item.valorImagemUrl ?? '';
  }

  function secaoHasContent(secao: string): boolean {
    return data.conteudos.some((c: { secao: string }) => c.secao === secao);
  }

  function countSecaoItems(secao: string): number {
    return data.conteudos.filter((c: { secao: string }) => c.secao === secao).length;
  }
</script>

<svelte:head>
  <title>CMS — Landing — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Gerenciador de Conteúdo</h1>
    <p class="page-sub">Edite os textos e imagens da landing page.</p>
  </div>
  <button class="btn btn--ghost" onclick={() => showPreview = !showPreview}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
    {showPreview ? 'Fechar Preview' : 'Preview'}
  </button>
</div>

{#if form?.error && feedbackVisible}
  <div class="card" style="border-color: var(--danger); margin-bottom: 16px;">
    <p style="color: var(--danger); font-size: 13px;">{form.error}</p>
  </div>
{/if}
{#if form?.success && feedbackVisible}
  <div class="card" style="border-color: var(--success); margin-bottom: 16px;">
    <p style="color: var(--success); font-size: 13px;">
      {#if form.updatedKey}Campo atualizado com sucesso!
      {:else if form.updatedSection}Seção salva com sucesso!
      {:else if form.initializedSection}Seção inicializada!
      {:else}Operação realizada!{/if}
    </p>
  </div>
{/if}

<div class="cms-layout {showPreview ? '' : 'cms-layout--no-preview'}">
  <div>
    <div class="accordion">
      {#each secaoKeys as secao}
        {@const config = secoesConfig[secao]}
        {@const hasContent = secaoHasContent(secao)}
        {@const itemCount = countSecaoItems(secao)}
        {@const isOpen = activeSection === secao}

        <div class="acc-item {isOpen ? 'is-open' : ''}">
          <button class="acc-item__head" onclick={() => activeSection = isOpen ? null : secao}>
            <div class="acc-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
            </div>
            <div class="acc-item__body">
              <div class="acc-item__title">{config.label}</div>
              <div class="acc-item__meta">
                {#if hasContent}{itemCount}/{config.chaves.length} campos preenchidos{:else}Não configurado{/if}
              </div>
            </div>
            <div class="acc-item__caret">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </button>

          {#if isOpen}
            <div style="padding: 0 16px 16px;">
              {#if !hasContent}
                <div class="empty" style="background:transparent; border:0;">
                  <p>Esta seção ainda não foi configurada.</p>
                </div>
                <form method="POST" action="?/initSection" use:enhance>
                  <input type="hidden" name="secao" value={secao} />
                  <button type="submit" class="btn btn--primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                    Inicializar Seção
                  </button>
                </form>
              {:else}
                <form method="POST" action="?/upsertBatch" use:enhance>
                  <input type="hidden" name="secao" value={secao} />
                  <div style="display:flex; flex-direction:column; gap:14px; padding-top:12px;">
                    {#each config.chaves as chaveConfig}
                      {@const valor = getConteudo(secao, chaveConfig.chave)}
                      <div class="field">
                        <label for="cms-{secao}-{chaveConfig.chave}">
                          {chaveConfig.label}
                          <span class="muted" style="font-size:10px; font-family:monospace; margin-left:auto; float:right;">{secao}.{chaveConfig.chave}</span>
                        </label>
                        {#if chaveConfig.tipo === 'textarea'}
                          <textarea id="cms-{secao}-{chaveConfig.chave}" name="{chaveConfig.chave}_texto" rows="3" placeholder="Digite o conteúdo...">{valor}</textarea>
                        {:else if chaveConfig.tipo === 'imagem'}
                          <ImageUpload value={valor || null} name="{chaveConfig.chave}_imagem" category="cms" />
                        {:else}
                          <input id="cms-{secao}-{chaveConfig.chave}" name="{chaveConfig.chave}_texto" type="text" value={valor} placeholder="Digite o conteúdo..." />
                        {/if}
                      </div>
                    {/each}
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding-top:14px; border-top:1px solid var(--line);">
                    <p class="muted" style="font-size:11px;">Todas as alterações serão salvas de uma vez</p>
                    <button type="submit" class="btn btn--primary">Salvar Seção</button>
                  </div>
                </form>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  {#if showPreview}
    <div class="preview-pane">
      <div class="preview-pane__head">
        <div class="preview-pane__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/></svg>
          Preview da Landing Page
        </div>
        <div class="preview-pane__actions">
          <button class="btn--icon" onclick={() => { previewKey++; if (previewIframe) previewIframe.src = '/?_t=' + Date.now(); }} aria-label="Recarregar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0114.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0020.5 15"/></svg>
          </button>
          <a href="/" target="_blank" class="btn btn--ghost btn--sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M21 3l-7 7M9 21H3v-6M3 21l7-7"/></svg>
            Abrir
          </a>
        </div>
      </div>
      <div class="preview-pane__frame">
        <iframe bind:this={previewIframe} src="/?_t={previewKey}" title="Preview da Landing Page" style="width:100%; height:70vh; border:0; background:#000; border-radius:0 0 12px 12px;"></iframe>
      </div>
    </div>
  {/if}
</div>
