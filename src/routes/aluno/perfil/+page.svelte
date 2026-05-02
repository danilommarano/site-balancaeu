<!-- BalancaEu — Perfil do Aluno -->
<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();

  function formatMembro(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
</script>

<svelte:head>
  <title>Meu Perfil — Balança Eu</title>
</svelte:head>

<div class="page-head">
  <h1 class="page-title">Meu <em>Perfil</em></h1>
  <p class="page-sub">Gerencie seus dados pessoais e senha.</p>
</div>

<div class="two-col" style="margin-top: 0;">
  <div class="card">
    <div class="card__head">
      <div class="card__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
        Dados Pessoais
      </div>
    </div>

    {#if form?.success}
      <div class="alert" style="margin-bottom: 18px;">
        <div class="alert__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <div class="alert__body">
          <strong>Sucesso!</strong>
          <p>{form.success}</p>
        </div>
      </div>
    {/if}
    {#if form?.error && !form?.senhaError}
      <div class="alert" style="margin-bottom: 18px;">
        <div class="alert__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
        </div>
        <div class="alert__body">
          <strong>Erro</strong>
          <p>{form.error}</p>
        </div>
      </div>
    {/if}

    <form method="POST" action="?/update" use:enhance>
      <div class="form-grid">
        <div class="field field--full">
          <label for="perfil-nome">Nome completo</label>
          <input id="perfil-nome" name="nome" type="text" required value={data.perfil.nome} />
        </div>
        <div class="field field--full">
          <label for="perfil-email">Email</label>
          <input id="perfil-email" name="email" type="email" required value={data.perfil.email} />
        </div>
        <div class="field">
          <label for="perfil-telefone">Telefone</label>
          <input id="perfil-telefone" name="telefone" type="tel" placeholder="(11) 99999-9999" value={data.perfil.telefone ?? ''} />
        </div>
        <div class="field">
          <label for="perfil-datanasc">Data de nascimento</label>
          <input id="perfil-datanasc" name="dataNasc" type="date" value={data.perfil.dataNasc} />
        </div>
      </div>
      <div class="form-foot">
        <button type="submit" class="btn btn--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          Salvar alterações
        </button>
      </div>
    </form>
  </div>

  <div class="card">
    <div class="card__head">
      <div class="card__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
        Alterar Senha
      </div>
    </div>

    {#if form?.senhaSuccess}
      <div class="alert" style="margin-bottom: 18px;">
        <div class="alert__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <div class="alert__body">
          <strong>Sucesso!</strong>
          <p>{form.senhaSuccess}</p>
        </div>
      </div>
    {/if}
    {#if form?.senhaError}
      <div class="alert" style="margin-bottom: 18px;">
        <div class="alert__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
        </div>
        <div class="alert__body">
          <strong>Erro</strong>
          <p>{form.senhaError}</p>
        </div>
      </div>
    {/if}

    <form method="POST" action="?/senha" use:enhance>
      <div class="form-grid" style="grid-template-columns: 1fr;">
        <div class="field">
          <label for="senha-atual">Senha atual</label>
          <input id="senha-atual" name="senhaAtual" type="password" required />
        </div>
        <div class="field">
          <label for="senha-nova">Nova senha</label>
          <input id="senha-nova" name="novaSenha" type="password" required minlength="6" />
          <span class="field__hint">Mínimo de 6 caracteres.</span>
        </div>
        <div class="field">
          <label for="senha-confirmar">Confirmar nova senha</label>
          <input id="senha-confirmar" name="confirmarSenha" type="password" required minlength="6" />
        </div>
      </div>
      <div class="form-foot">
        <button type="submit" class="btn btn--coral">Alterar senha</button>
      </div>
    </form>
  </div>
</div>

<div style="margin-top: 20px;">
  <div class="card card--bordered">
    <div class="card__head">
      <div class="card__title" style="font-size: 18px;">Informações da conta</div>
    </div>
    <div class="info-row">
      <div class="info-row__item">
        <h5>Membro desde</h5>
        <p>{formatMembro(data.perfil.createdAt)}</p>
      </div>
      <div class="info-row__item">
        <h5>Email</h5>
        <p style="font-family: var(--sans); font-size: 14px;">{data.perfil.email}</p>
      </div>
      <div class="info-row__item">
        <h5>Status</h5>
        <p><span class="status-dot"></span>Ativo</p>
      </div>
    </div>
  </div>
</div>
