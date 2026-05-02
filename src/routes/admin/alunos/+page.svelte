<!-- BalancaEu — Admin: Alunos -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();
  let search = $state('');

  const filtered = $derived(
    search.trim()
      ? data.alunos.filter((a: { nome: string; email: string }) =>
          a.nome.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase())
        )
      : data.alunos
  );
</script>

<svelte:head>
  <title>Alunos — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Alunos</h1>
    <p class="page-sub">{data.alunos.length} aluno(s) cadastrado(s)</p>
  </div>
</div>

{#if form?.error}
  <div class="card" style="border-color: var(--danger); margin-bottom: 16px;">
    <p style="color: var(--danger); font-size: 13px;">{form.error}</p>
  </div>
{/if}

<div class="search-bar">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
  <input bind:value={search} placeholder="Buscar por nome ou email..." />
</div>

{#if filtered.length === 0}
  <div class="empty">
    <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg></div>
    <p>{search ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado.'}</p>
  </div>
{:else}
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Telefone</th>
          <th>Plano</th>
          <th>Turmas</th>
          <th>Status</th>
          <th style="text-align:right;">Ações</th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as aluno}
          <tr>
            <td>
              <div class="name">
                <div class="dot">{aluno.nome[0]}</div>{aluno.nome}
              </div>
            </td>
            <td>{aluno.email}</td>
            <td class="muted">{aluno.telefone ?? '—'}</td>
            <td>
              {#if aluno.subscriptions.length > 0}
                <span class="badge badge--coral">{aluno.subscriptions[0].plan.nome}</span>
              {:else}
                <span class="muted">Sem plano</span>
              {/if}
            </td>
            <td>{aluno._count.enrollments}</td>
            <td>
              {#if aluno.ativo}
                <span class="badge badge--active">Ativo</span>
              {:else}
                <span class="badge">Inativo</span>
              {/if}
            </td>
            <td>
              <div class="actions">
                <form method="POST" action="?/toggleActive" use:enhance style="display:inline;">
                  <input type="hidden" name="id" value={aluno.id} />
                  <input type="hidden" name="ativo" value={(!aluno.ativo).toString()} />
                  <button type="submit" class="btn--icon" aria-label={aluno.ativo ? 'Desativar' : 'Ativar'}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 014 4l-12 12-5 1 1-5L17 3z"/></svg>
                  </button>
                </form>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
