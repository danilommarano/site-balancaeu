<!-- BalancaEu — Página de Login -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Entrar — Balança Eu</title>
</svelte:head>

<div class="auth-shell">
  <div class="auth">
    <div class="auth__brand">
      <div class="auth__logo">
        <div class="auth__logo-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
        </div>
      </div>
      <h1 class="auth__title">Balança<b>Eu</b></h1>
      <p class="auth__sub">Acesse sua conta</p>
    </div>

    <form
      class="auth__card"
      method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          loading = false;
          await update();
        };
      }}
    >
      {#if form?.error}
        <div class="auth__error">{form.error}</div>
      {/if}

      <div class="field">
        <label class="field__label" for="email">Email</label>
        <input class="field__input" id="email" name="email" type="email" value={form?.email ?? ''} placeholder="seu@email.com" autocomplete="email" required />
      </div>
      <div class="field" style="margin-bottom: 22px;">
        <label class="field__label" for="password">Senha</label>
        <input class="field__input" id="password" name="password" type="password" placeholder="••••••••" autocomplete="current-password" required />
      </div>

      <button class="btn btn--primary" type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <div class="divider">ou</div>

      <a href="/login/google" class="btn btn--social">
        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 015.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 001 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
        Continuar com Google
      </a>

      <a href="/login/apple" class="btn btn--social" style="background:#000; color:#fff; border-color:#222;">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.05 12.04c-.03-2.93 2.4-4.34 2.51-4.41-1.37-2-3.5-2.27-4.26-2.31-1.81-.18-3.54 1.07-4.46 1.07-.93 0-2.34-1.04-3.86-1.01-1.98.03-3.81 1.15-4.83 2.92-2.06 3.57-.53 8.86 1.48 11.77 1 1.42 2.18 3.02 3.7 2.96 1.49-.06 2.05-.96 3.86-.96 1.79 0 2.31.96 3.87.93 1.6-.02 2.61-1.45 3.59-2.88 1.13-1.65 1.6-3.25 1.62-3.34-.04-.02-3.1-1.19-3.13-4.74M14.13 3.55C14.95 2.55 15.5 1.18 15.35 0c-1.17.05-2.6.78-3.45 1.78-.76.88-1.43 2.28-1.25 3.43 1.31.1 2.65-.66 3.48-1.66"/></svg>
        Continuar com Apple
      </a>

      <div class="auth__foot">
        <a href="/recuperar-senha">Esqueceu sua senha?</a>
        <p>Não tem conta? <a href="/cadastro">Cadastre-se</a></p>
      </div>
    </form>

    <p class="legal">Movimento é cura. Boas-vindas de volta.</p>
  </div>
</div>
