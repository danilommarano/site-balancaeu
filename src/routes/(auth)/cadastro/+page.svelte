<!-- BalancaEu — Página de Cadastro -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Cadastrar — Balança Eu</title>
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
      <p class="auth__sub">Crie sua conta</p>
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
        <label class="field__label" for="nome">Nome completo</label>
        <input class="field__input" id="nome" name="nome" value={form?.nome ?? ''} placeholder="Seu nome" autocomplete="name" required />
      </div>
      <div class="field">
        <label class="field__label" for="email">Email</label>
        <input class="field__input" id="email" name="email" type="email" value={form?.email ?? ''} placeholder="seu@email.com" autocomplete="email" required />
      </div>
      <div class="field">
        <label class="field__label" for="password">Senha</label>
        <input class="field__input" id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password" required minlength="6" />
      </div>
      <div class="field" style="margin-bottom: 22px;">
        <label class="field__label" for="passwordConfirm">Confirmar senha</label>
        <input class="field__input" id="passwordConfirm" name="passwordConfirm" type="password" placeholder="Repita a senha" autocomplete="new-password" required minlength="6" />
      </div>

      <button class="btn btn--primary" type="submit" disabled={loading}>
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>

      <div class="auth__foot">
        <p>Já tem conta? <a href="/login">Entrar</a></p>
      </div>
    </form>

    <p class="legal">Comece sua jornada no movimento.</p>
  </div>
</div>
