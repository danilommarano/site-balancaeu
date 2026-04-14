<!-- BalancaEu — Página de Login -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Login — BalancaEu</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white tracking-tight">BalancaEu</h1>
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

      <!-- Divisor "ou" -->
      <div class="flex items-center gap-3">
        <div class="flex-1 h-px bg-zinc-700"></div>
        <span class="text-[11px] text-zinc-500 uppercase tracking-widest">ou</span>
        <div class="flex-1 h-px bg-zinc-700"></div>
      </div>

      <!-- Botões OAuth -->
      <div class="space-y-3">
        <a
          href="/login/google"
          class="flex items-center justify-center gap-3 w-full py-3 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continuar com Google</span>
        </a>

        <a
          href="/login/apple"
          class="flex items-center justify-center gap-3 w-full py-3 bg-black text-white font-medium rounded-lg border border-zinc-700 hover:bg-zinc-900 transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.05 20.28c-.98.95-2.05.94-3.08.47-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.44C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span>Continuar com Apple</span>
        </a>
      </div>

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
