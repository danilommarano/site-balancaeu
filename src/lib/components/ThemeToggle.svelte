<script lang="ts">
  import { themeStore } from '$lib/stores/theme.svelte';
  let { variant = 'sidebar' }: { variant?: 'sidebar' | 'inline' } = $props();
</script>

<button
  type="button"
  class="theme-toggle theme-toggle--{variant}"
  onclick={() => themeStore.toggle()}
  aria-label={themeStore.value === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
  title={themeStore.value === 'dark' ? 'Tema claro' : 'Tema escuro'}
>
  {#if themeStore.value === 'dark'}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
    <span>Tema claro</span>
  {:else}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
    <span>Tema escuro</span>
  {/if}
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    color: inherit;
    background: none;
    border: 0;
    cursor: pointer;
    transition: background .2s, color .2s;
    width: 100%;
    text-align: left;
  }
  .theme-toggle:hover {
    background: rgba(127, 127, 127, 0.08);
  }
  .theme-toggle svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  .theme-toggle--inline {
    width: auto;
    padding: 6px 10px;
    font-size: 12px;
  }
  .theme-toggle--inline span {
    display: none;
  }
</style>
