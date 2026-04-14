<!-- BalancaEu — Admin: CMS (Gerenciador de Conteúdo) -->
<script lang="ts">
  import { enhance } from '$app/forms';

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

  const secaoIcons: Record<string, string> = {
    hero: 'auto_awesome',
    escola: 'school',
    precos: 'payments',
    professores: 'groups',
    horarios: 'schedule',
    eventos: 'event',
    cta_final: 'campaign',
    contato: 'contact_page',
    footer: 'bottom_navigation'
  };
</script>

<svelte:head>
  <title>CMS — Admin — BalancaEu</title>
</svelte:head>

<div>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Gerenciador de Conteúdo</h1>
      <p class="text-zinc-500 text-sm">Edite os textos e imagens da landing page</p>
    </div>
    <button
      onclick={() => showPreview = !showPreview}
      class="flex items-center gap-2 bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
    >
      <span class="material-symbols-outlined text-[18px]">{showPreview ? 'visibility_off' : 'visibility'}</span>
      {showPreview ? 'Fechar Preview' : 'Preview'}
    </button>
  </div>

  {#if form?.error && feedbackVisible}
    <div class="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm animate-feedback">
      <span class="material-symbols-outlined text-[18px]">error</span>
      <span class="flex-1">{form.error}</span>
      <button onclick={() => feedbackVisible = false} class="ml-2 hover:text-red-300"><span class="material-symbols-outlined text-[16px]">close</span></button>
    </div>
  {/if}
  {#if form?.success && feedbackVisible}
    <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-4 py-3 mb-6 text-sm animate-feedback">
      <span class="material-symbols-outlined text-[18px]">check_circle</span>
      <span class="flex-1">
        {#if form.updatedKey}
          Campo atualizado com sucesso!
        {:else if form.updatedSection}
          Seção salva com sucesso!
        {:else if form.initializedSection}
          Seção inicializada!
        {:else}
          Operação realizada!
        {/if}
      </span>
      <button onclick={() => feedbackVisible = false} class="ml-2 hover:text-emerald-300"><span class="material-symbols-outlined text-[16px]">close</span></button>
    </div>
  {/if}

  <div class="flex gap-6 {showPreview ? '' : ''}">
    <!-- Seções -->
    <div class="{showPreview ? 'w-1/2' : 'w-full'}">
      <div class="space-y-3">
        {#each secaoKeys as secao}
          {@const config = secoesConfig[secao]}
          {@const hasContent = secaoHasContent(secao)}
          {@const itemCount = countSecaoItems(secao)}
          {@const isOpen = activeSection === secao}

          <!-- Accordion item -->
          <div class="rounded-xl border overflow-hidden {isOpen ? 'border-primary/30 ring-1 ring-primary/20' : 'border-zinc-800'}">
            <button
              onclick={() => activeSection = isOpen ? null : secao}
              class="flex items-center gap-4 p-4 w-full text-left transition-all {isOpen ? 'bg-primary/10' : 'bg-zinc-900 hover:bg-zinc-800/60'}"
            >
              <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 {isOpen ? 'bg-primary/20' : 'bg-zinc-800'}">
                <span class="material-symbols-outlined text-[20px] {isOpen ? 'text-primary' : 'text-zinc-500'}">{secaoIcons[secao] ?? 'article'}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium {isOpen ? 'text-primary' : 'text-white'} truncate">{config.label}</p>
                <p class="text-[10px] text-zinc-500">
                  {#if hasContent}
                    {itemCount}/{config.chaves.length} campos preenchidos
                  {:else}
                    Não configurado
                  {/if}
                </p>
              </div>
              <span class="material-symbols-outlined text-[18px] text-zinc-600 transition-transform {isOpen ? 'rotate-180' : ''}">expand_more</span>
            </button>

            <!-- Expanded content (inline below the button) -->
            {#if isOpen}
              <div class="bg-zinc-900 border-t border-zinc-800">
                <div class="p-5 border-b border-zinc-800 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span class="material-symbols-outlined text-primary text-[18px]">{secaoIcons[secao] ?? 'article'}</span>
                    </div>
                    <div>
                      <h2 class="text-sm font-semibold text-white">{config.label}</h2>
                      <p class="text-[10px] text-zinc-500">{config.chaves.length} campo(s) configurável(is)</p>
                    </div>
                  </div>

                  {#if !hasContent}
                    <form method="POST" action="?/initSection" use:enhance>
                      <input type="hidden" name="secao" value={secao} />
                      <button type="submit" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
                        <span class="material-symbols-outlined text-[16px]">add</span>
                        Inicializar Seção
                      </button>
                    </form>
                  {/if}
                </div>

                {#if hasContent}
                  <form method="POST" action="?/upsertBatch" use:enhance>
                    <input type="hidden" name="secao" value={secao} />
                    <div class="p-5 space-y-5">
                      {#each config.chaves as chaveConfig}
                        {@const valor = getConteudo(secao, chaveConfig.chave)}
                        <div>
                          <label for="cms-{secao}-{chaveConfig.chave}" class="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                            {#if chaveConfig.tipo === 'imagem'}
                              <span class="material-symbols-outlined text-[14px]">image</span>
                            {:else if chaveConfig.tipo === 'textarea'}
                              <span class="material-symbols-outlined text-[14px]">notes</span>
                            {:else}
                              <span class="material-symbols-outlined text-[14px]">text_fields</span>
                            {/if}
                            {chaveConfig.label}
                            <span class="text-zinc-600 text-[10px] ml-auto font-mono">{secao}.{chaveConfig.chave}</span>
                          </label>

                          {#if chaveConfig.tipo === 'textarea'}
                            <textarea
                              id="cms-{secao}-{chaveConfig.chave}"
                              name="{chaveConfig.chave}_texto"
                              rows="3"
                              value={valor}
                              placeholder="Digite o conteúdo..."
                              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary resize-y"
                            ></textarea>
                          {:else if chaveConfig.tipo === 'imagem'}
                            <input
                              id="cms-{secao}-{chaveConfig.chave}"
                              name="{chaveConfig.chave}_imagem"
                              type="text"
                              value={valor}
                              placeholder="URL da imagem (ex: /assets/hero.png)"
                              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                            />
                            {#if valor}
                              <div class="mt-2 flex items-center gap-3">
                                <div class="w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden">
                                  <img src={valor} alt="Preview" class="w-full h-full object-cover" />
                                </div>
                                <span class="text-[10px] text-zinc-600 break-all">{valor}</span>
                              </div>
                            {/if}
                          {:else}
                            <input
                              id="cms-{secao}-{chaveConfig.chave}"
                              name="{chaveConfig.chave}_texto"
                              type="text"
                              value={valor}
                              placeholder="Digite o conteúdo..."
                              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                            />
                          {/if}
                        </div>
                      {/each}
                    </div>

                    <div class="px-5 py-4 border-t border-zinc-800 flex items-center justify-between">
                      <p class="text-[10px] text-zinc-600">Todas as alterações serão salvas de uma vez</p>
                      <button type="submit" class="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                        <span class="material-symbols-outlined text-[16px]">save</span>
                        Salvar Seção
                      </button>
                    </div>
                  </form>
                {:else}
                  <div class="p-10 text-center">
                    <span class="material-symbols-outlined text-4xl text-zinc-700 mb-3 block">edit_note</span>
                    <p class="text-zinc-500 text-sm">Esta seção ainda não foi configurada.</p>
                    <p class="text-zinc-600 text-xs mt-1">Clique em "Inicializar Seção" para criar os campos.</p>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Preview Panel -->
    {#if showPreview}
      <div class="w-1/2 sticky top-6 self-start">
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div class="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-zinc-500 text-[18px]">preview</span>
              <span class="text-xs font-medium text-zinc-400">Preview da Landing Page</span>
            </div>
            <div class="flex items-center gap-3">
              <button onclick={() => { previewKey++; if (previewIframe) previewIframe.src = '/?_t=' + Date.now(); }} class="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors" title="Recarregar preview">
                <span class="material-symbols-outlined text-[14px]">refresh</span>
              </button>
              <a href="/" target="_blank" class="flex items-center gap-1 text-[10px] text-primary hover:underline">
                Abrir site <span class="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>
          </div>

          <div class="bg-zinc-950 rounded-b-xl overflow-hidden" style="height: 70vh;">
            <iframe
              bind:this={previewIframe}
              src="/?_t={previewKey}"
              title="Preview da Landing Page"
              class="w-full h-full border-0"
              style="transform: scale(0.6); transform-origin: top left; width: 166.67%; height: 166.67%;"
            ></iframe>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .animate-feedback {
    animation: fadeSlideIn 0.3s ease-out;
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
