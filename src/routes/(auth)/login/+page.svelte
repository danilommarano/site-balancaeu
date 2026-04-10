<!-- Pulso — Página de Login -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Login — Pulso</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white tracking-tight">Pulso</h1>
      <p class="text-zinc-400 mt-2">Acesse sua conta</p>
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
      class="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8 space-y-6"
    >
      {#if form?.error}
        <div class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {form.error}
        </div>
      {/if}

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
          autocomplete="current-password"
          class="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-white/50 transition-colors"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full py-3 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <div class="text-center space-y-2">
        <a href="/recuperar-senha" class="text-sm text-zinc-400 hover:text-white transition-colors">
          Esqueceu sua senha?
        </a>
        <p class="text-sm text-zinc-500">
          Não tem conta? <a href="/cadastro" class="text-white hover:underline">Cadastre-se</a>
        </p>
      </div>
    </form>
  </div>
</div>
