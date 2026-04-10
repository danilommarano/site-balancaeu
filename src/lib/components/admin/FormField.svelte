<!--
  FormField — Reusable admin form field with label, icon, hint, and error state.
  Usage: <FormField label="Email" icon="mail" hint="Será usado para login" error={errors.email}>
           <input ... />
         </FormField>
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label,
    icon = '',
    hint = '',
    error = '',
    required = false,
    children
  }: {
    label: string;
    icon?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: Snippet;
  } = $props();
</script>

<div class="space-y-1.5">
  <span class="flex items-center gap-1.5 text-xs text-zinc-400">
    {#if icon}
      <span class="material-symbols-outlined text-[14px]">{icon}</span>
    {/if}
    {label}
    {#if required}
      <span class="text-red-400">*</span>
    {/if}
  </span>
  {@render children()}
  {#if error}
    <p class="text-[11px] text-red-400 flex items-center gap-1">
      <span class="material-symbols-outlined text-[12px]">error</span>
      {error}
    </p>
  {/if}
  {#if hint && !error}
    <p class="text-[10px] text-zinc-600">{hint}</p>
  {/if}
</div>
