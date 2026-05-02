<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  type Props = {
    options: Record<string, unknown>;
    height?: number | string;
  };

  let { options, height = 260 }: Props = $props();

  let el: HTMLDivElement;
  let chart: any = null;

  onMount(async () => {
    const { default: ApexCharts } = await import('apexcharts');
    chart = new ApexCharts(el, { ...options, chart: { ...(options.chart ?? {}), height } });
    await chart.render();
  });

  // Re-render quando options mudam (após hidratação dos dados)
  $effect(() => {
    if (!chart) return;
    chart.updateOptions({ ...options, chart: { ...(options.chart ?? {}), height } }, false, true);
  });

  onDestroy(() => {
    if (chart) chart.destroy();
  });
</script>

<div bind:this={el} class="apex-host"></div>

<style>
  .apex-host { width: 100%; min-height: 200px; }
  /* Garantir que o chart não estoure o card */
  .apex-host :global(.apexcharts-canvas) { max-width: 100% !important; }
</style>
