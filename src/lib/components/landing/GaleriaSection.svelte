<script lang="ts">
  type GalleryItem = { cls: string; label: string; video?: boolean };
  let { galeria = [] }: { galeria?: GalleryItem[] } = $props();
</script>

{#if galeria.length > 0}
<section class="sec-galeria" id="galeria">
  <div class="container">
    <div class="galeria-head">
      <div>
        <div class="eyebrow">A casa por dentro</div>
        <h2>Nossa <em>galeria</em> de movimentos.</h2>
      </div>
      <p style="font-size: 16px; color: var(--ink-soft); max-width: 420px; line-height: 1.6;">
        Um recorte dos bailes, aulas e encontros que acontecem por aqui — o que você vai viver quando chegar.
      </p>
    </div>
    <div class="galeria-grid">
      {#each galeria as it}
        <div class="gal-item {it.cls} {it.video ? 'is-video' : ''}">
          <span class="gal-item__label">{it.label}</span>
        </div>
      {/each}
    </div>
  </div>
</section>
{/if}
