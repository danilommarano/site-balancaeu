<!-- BalancaEu — Admin: Banco de Imagens (Mídia) -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';

  let { data, form } = $props();

  let searchInput = $state(data.search ?? '');
  let uploadInput = $state<HTMLInputElement | null>(null);
  let uploading = $state(false);
  let uploadError = $state<string | null>(null);
  let copiedId = $state<string | null>(null);

  const categorias = [
    { value: null, label: 'Tudo' },
    { value: 'cms', label: 'CMS' },
    { value: 'modality', label: 'Modalidades' },
    { value: 'teacher', label: 'Professores' },
    { value: 'event', label: 'Eventos' },
    { value: 'general', label: 'Outros' }
  ];

  function bytesToMB(n: number): string {
    return (n / 1024 / 1024).toFixed(1);
  }
  function bytesToGB(n: number): string {
    return (n / 1024 / 1024 / 1024).toFixed(2);
  }
  function pct(used: number, max: number): number {
    return Math.min(100, Math.round((used / max) * 100));
  }

  function setCategory(cat: string | null) {
    const u = new URL($page.url);
    if (cat) u.searchParams.set('category', cat);
    else u.searchParams.delete('category');
    goto(u, { replaceState: true });
  }

  function applySearch() {
    const u = new URL($page.url);
    if (searchInput) u.searchParams.set('q', searchInput);
    else u.searchParams.delete('q');
    goto(u, { replaceState: true });
  }

  async function uploadFiles(files: FileList) {
    if (!files || files.length === 0) return;
    uploadError = null;
    uploading = true;
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', 'general');
        const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`${file.name}: ${text || res.status}`);
        }
      }
      await invalidateAll();
    } catch (e: any) {
      uploadError = e?.message ?? 'Falha no upload';
    } finally {
      uploading = false;
      if (uploadInput) uploadInput.value = '';
    }
  }

  async function copyUrl(asset: { id: string; url: string }) {
    try {
      await navigator.clipboard.writeText(asset.url);
      copiedId = asset.id;
      setTimeout(() => { if (copiedId === asset.id) copiedId = null; }, 1500);
    } catch (e) {
      // ignore
    }
  }

  let filesPct = $derived(pct(data.usage.usedFiles, data.usage.maxFiles));
  let bytesPct = $derived(pct(data.usage.usedBytes, data.usage.maxBytes));
</script>

<svelte:head>
  <title>Mídia — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Banco de <em>Imagens</em></h1>
    <p class="page-sub">Imagens compartilhadas entre admins e professores</p>
  </div>
  <button class="btn btn--primary" onclick={() => uploadInput?.click()} disabled={uploading || data.usage.usedFiles >= data.usage.maxFiles}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
    {uploading ? 'Enviando…' : 'Upload'}
  </button>
  <input bind:this={uploadInput} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" onchange={(e) => uploadFiles((e.target as HTMLInputElement).files!)} style="display:none;" />
</div>

<!-- Usage indicators -->
<div class="stat-grid stat-grid--2" style="margin-bottom: 18px;">
  <div class="stat-card">
    <div class="stat-card__head">
      <span class="stat-card__label">Imagens</span>
      <div class="stat-card__icon is-coral">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
      </div>
    </div>
    <div class="stat-card__value">{data.usage.usedFiles} <span style="font-size:14px; color:var(--text-mute);">de {data.usage.maxFiles}</span></div>
    <div style="margin-top:10px; height:6px; border-radius:999px; background:var(--surface-3); overflow:hidden;">
      <div style="height:100%; width:{filesPct}%; background:linear-gradient(90deg, var(--terracota), var(--coral)); border-radius:999px; transition:width 0.3s;"></div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-card__head">
      <span class="stat-card__label">Espaço</span>
      <div class="stat-card__icon is-blue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
      </div>
    </div>
    <div class="stat-card__value">{bytesToGB(data.usage.usedBytes)} <span style="font-size:14px; color:var(--text-mute);">de {bytesToGB(data.usage.maxBytes)} GB</span></div>
    <div style="margin-top:10px; height:6px; border-radius:999px; background:var(--surface-3); overflow:hidden;">
      <div style="height:100%; width:{bytesPct}%; background:linear-gradient(90deg, var(--blue, #5B7FCF), var(--blue-soft, #7FA8D9)); border-radius:999px; transition:width 0.3s;"></div>
    </div>
  </div>
</div>

{#if uploadError}
  <div class="card" style="border-color:var(--danger); margin-bottom:16px;">
    <p style="color:var(--danger); font-size:13px;">{uploadError}</p>
  </div>
{/if}
{#if form?.error}
  <div class="card" style="border-color:var(--danger); margin-bottom:16px;">
    <p style="color:var(--danger); font-size:13px;">{form.error}</p>
  </div>
{/if}

<!-- Filters -->
<div style="display:flex; gap:12px; align-items:center; margin-bottom:16px; flex-wrap:wrap;">
  <div class="tabs">
    {#each categorias as cat}
      <button class="tab {data.category === cat.value ? 'is-active' : ''}" onclick={() => setCategory(cat.value)}>{cat.label}</button>
    {/each}
  </div>
  <form onsubmit={(e) => { e.preventDefault(); applySearch(); }} style="flex:1; min-width:200px;">
    <div class="search-bar" style="margin-bottom:0;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
      <input bind:value={searchInput} type="text" placeholder="Buscar por nome do arquivo..." />
    </div>
  </form>
</div>

{#if data.assets.length === 0}
  <div class="empty">
    <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg></div>
    <p>Nenhuma imagem encontrada. Faça upload da primeira.</p>
  </div>
{:else}
  <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:14px;">
    {#each data.assets as asset}
      <div class="card" style="padding:0; overflow:hidden;">
        <div style="aspect-ratio:1/1; background:var(--surface-2); position:relative; overflow:hidden;">
          <img src={asset.url} alt={asset.filename} style="width:100%; height:100%; object-fit:cover;" loading="lazy" />
        </div>
        <div style="padding:10px 12px;">
          <div style="font-size:12px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title={asset.filename}>{asset.filename}</div>
          <div style="font-size:10.5px; color:var(--text-mute); margin-top:2px; display:flex; justify-content:space-between;">
            <span>{bytesToMB(asset.sizeBytes)} MB</span>
            {#if asset.category}<span class="badge badge--muted" style="font-size:9px; padding:1px 6px;">{asset.category}</span>{/if}
          </div>
          <div style="display:flex; gap:6px; margin-top:8px;">
            <button class="btn btn--ghost btn--sm" style="flex:1; font-size:11px; padding:5px 8px;" onclick={() => copyUrl(asset)}>
              {copiedId === asset.id ? '✓ Copiado' : 'Copiar URL'}
            </button>
            <form method="POST" action="?/delete" use:enhance>
              <input type="hidden" name="id" value={asset.id} />
              <button type="submit" class="btn--icon is-danger" aria-label="Excluir" onclick={(e) => { if (!confirm('Excluir esta imagem? Ela continuará aparecendo nas páginas que a usam até serem editadas.')) e.preventDefault(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}
