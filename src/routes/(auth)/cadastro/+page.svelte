<!-- Pulso — Página de Cadastro -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Cadastro — Pulso</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white tracking-tight">Pulso</h1>
      <p class="text-zinc-400 mt-2">Crie sua conta</p>
    </div>

    <form
      method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          loading = false;
          await update();
        };
      }}
      class="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8 space-y-5"
    >
      {#if form?.error}
        <div class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {form.error}
        </div>
      {/if}

      <div>
        <label for="nome" class="block text-sm font-medium text-zinc-300 mb-2">Nome completo</label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={form?.nome ?? ''}
          required
          autocomplete="name"
          class="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-white/50 transition-colors"
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-zinc-300 mb-2">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={form?.email ?? ''}
          required
          autocomplete="email"
          class="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-white/50 transition-colors"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-zinc-300 mb-2">Senha</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minlength="6"
          autocomplete="new-password"
          class="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-white/50 transition-colors"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <label for="passwordConfirm" class="block text-sm font-medium text-zinc-300 mb-2">Confirmar senha</label>
        <input
          type="password"
          id="passwordConfirm"
          name="passwordConfirm"
          required
          minlength="6"
          autocomplete="new-password"
          class="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-white/50 transition-colors"
          placeholder="Repita a senha"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full py-3 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>

      <p class="text-center text-sm text-zinc-500">
        Já tem conta? <a href="/login" class="text-white hover:underline">Entrar</a>
      </p>
    </form>
  </div>
</div>
