<script lang="ts">
  import { themeStore } from '$lib/stores/theme.svelte';

  interface Props {
    class?: string;
  }
  let { class: klass = '' }: Props = $props();
</script>

<button
  type="button"
  onclick={() => themeStore.toggle()}
  aria-label="Alternar tema"
  title={themeStore.value === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
  class="relative inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors
    text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100
    dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 {klass}"
>
  {#if themeStore.value === 'dark'}
    <span class="material-symbols-outlined text-[20px]">light_mode</span>
  {:else}
    <span class="material-symbols-outlined text-[20px]">dark_mode</span>
  {/if}
</button>
