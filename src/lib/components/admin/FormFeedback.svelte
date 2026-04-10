<!--
  FormFeedback — Auto-dismissing success/error feedback for admin forms.
  Usage: <FormFeedback {form} />
-->
<script lang="ts">
  let { form } = $props<{ form: { error?: string; success?: boolean } | null }>();
  let visible = $state(true);

  $effect(() => {
    if (form?.success) {
      visible = true;
      const timer = setTimeout(() => { visible = false; }, 3000);
      return () => clearTimeout(timer);
    }
    if (form?.error) {
      visible = true;
    }
  });
</script>

{#if form?.error && visible}
  <div class="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm animate-in">
    <span class="material-symbols-outlined text-[18px]">error</span>
    <span class="flex-1">{form.error}</span>
    <button onclick={() => visible = false} class="ml-2 hover:text-red-300 transition-colors">
      <span class="material-symbols-outlined text-[16px]">close</span>
    </button>
  </div>
{/if}

{#if form?.success && visible}
  <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-4 py-3 mb-6 text-sm animate-in">
    <span class="material-symbols-outlined text-[18px]">check_circle</span>
    <span class="flex-1">Operação realizada com sucesso!</span>
    <button onclick={() => visible = false} class="ml-2 hover:text-emerald-300 transition-colors">
      <span class="material-symbols-outlined text-[16px]">close</span>
    </button>
  </div>
{/if}

<style>
  .animate-in {
    animation: fadeSlideIn 0.3s ease-out;
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
