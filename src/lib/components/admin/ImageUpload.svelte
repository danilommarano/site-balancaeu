<script lang="ts">
  type Props = {
    value: string | null;
    name?: string;
    category?: string;
    label?: string;
    onChange?: (url: string | null) => void;
  };

  let { value = $bindable(null), name, category = 'general', label, onChange }: Props = $props();

  let inputEl = $state<HTMLInputElement | null>(null);
  let uploading = $state(false);
  let error = $state<string | null>(null);

  async function handleFile(file: File) {
    if (!file) return;
    error = null;
    uploading = true;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', category);
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      value = data.url;
      onChange?.(data.url);
    } catch (e: any) {
      error = e?.message ?? 'Falha no upload';
    } finally {
      uploading = false;
      if (inputEl) inputEl.value = '';
    }
  }

  function onPick(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) handleFile(file);
  }

  function clear() {
    value = null;
    onChange?.(null);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }
</script>

<div class="img-upload">
  {#if label}
    <label for={name}>{label}</label>
  {/if}

  {#if name}
    <input type="hidden" {name} value={value ?? ''} />
  {/if}

  {#if value}
    <div class="img-upload__preview">
      <img src={value} alt="" />
      <div class="img-upload__actions">
        <button type="button" class="btn btn--ghost btn--sm" onclick={() => inputEl?.click()} disabled={uploading}>
          {uploading ? 'Enviando…' : 'Trocar'}
        </button>
        <button type="button" class="btn btn--danger-ghost btn--sm" onclick={clear} disabled={uploading}>
          Remover
        </button>
      </div>
    </div>
  {:else}
    <button
      type="button"
      class="img-upload__drop"
      class:is-uploading={uploading}
      onclick={() => inputEl?.click()}
      ondragover={(e) => e.preventDefault()}
      ondrop={onDrop}
      disabled={uploading}
    >
      {#if uploading}
        <span>Enviando…</span>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
        <span>Clique ou arraste uma imagem</span>
        <small>JPG, PNG, WEBP, GIF · até 10 MB</small>
      {/if}
    </button>
  {/if}

  {#if error}
    <p class="img-upload__error">{error}</p>
  {/if}

  <input
    bind:this={inputEl}
    type="file"
    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
    onchange={onPick}
    style="display:none;"
  />
</div>

<style>
  .img-upload {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .img-upload label {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--text-mute, var(--ink-mute, #7A6B5E));
  }
  .img-upload__drop {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 28px 20px;
    background: transparent;
    border: 1.5px dashed var(--line, #2E2418);
    border-radius: 12px;
    color: var(--text-mute, #7A6B5E);
    cursor: pointer;
    transition: border-color .2s, background .2s, color .2s;
    font-family: inherit;
    width: 100%;
  }
  .img-upload__drop:hover:not(:disabled) {
    border-color: var(--terracota, #A83A2E);
    color: var(--text-soft, #C8B8A5);
    background: rgba(168, 58, 46, 0.04);
  }
  .img-upload__drop:disabled,
  .img-upload__drop.is-uploading {
    opacity: 0.6;
    cursor: progress;
  }
  .img-upload__drop svg {
    width: 28px;
    height: 28px;
    opacity: 0.6;
  }
  .img-upload__drop span {
    font-size: 13px;
    font-weight: 500;
  }
  .img-upload__drop small {
    font-size: 11px;
    color: var(--text-mute, #7A6B5E);
    opacity: 0.8;
  }
  .img-upload__preview {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px;
    background: var(--surface-2, var(--creme-warm, #F2E8DB));
    border: 1px solid var(--line, #2E2418);
    border-radius: 12px;
  }
  .img-upload__preview img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
  }
  .img-upload__actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .img-upload__error {
    font-size: 12px;
    color: var(--danger, #E25A4C);
    margin: 0;
  }
</style>
