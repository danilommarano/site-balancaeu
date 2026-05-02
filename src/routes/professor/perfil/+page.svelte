<!-- BalancaEu — Professor: Perfil -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let nome = $state(data.perfil.nome);
  let telefone = $state(data.perfil.telefone);
  let bio = $state(data.perfil.bio);
  let especialidades = $state(data.perfil.especialidades.join(', '));

  let especialidadesList = $derived(
    especialidades.split(',').map(s => s.trim()).filter(s => s)
  );

  let initial = $derived((nome || 'P')[0].toUpperCase());
</script>

<svelte:head>
  <title>Perfil — Professor · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Meu <em>Perfil</em></h1>
    <p class="page-sub">Gerencie seus dados e informações públicas</p>
  </div>
</div>

{#if form?.success}
  <div class="alert alert--success">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>
    {form.message}
  </div>
{/if}
{#if form?.error}
  <div class="alert">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
    {form.error}
  </div>
{/if}

<div class="two-col" style="grid-template-columns: 2fr 1fr; margin-top: 0;">
  <form method="POST" action="?/salvar" use:enhance>
    <div class="card">
      <div class="card__head">
        <div class="card__title blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Dados do Perfil
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
        <div class="field" style="grid-column:1/-1;">
          <label for="nome">Nome completo</label>
          <input id="nome" name="nome" type="text" required bind:value={nome} />
        </div>
        <div class="field" style="grid-column:1/-1;">
          <label for="email">Email</label>
          <input id="email" type="email" disabled value={data.perfil.email} style="opacity:.6;" />
          <div style="font-size:10.5px; color:var(--text-mute); margin-top:2px;">O email não pode ser alterado.</div>
        </div>
        <div class="field" style="grid-column:1/-1;">
          <label for="telefone">Telefone</label>
          <input id="telefone" name="telefone" type="tel" bind:value={telefone} placeholder="(11) 99999-9999" />
        </div>
        <div class="field" style="grid-column:1/-1;">
          <label for="bio">Biografia</label>
          <textarea id="bio" name="bio" rows="4" bind:value={bio} placeholder="Conte um pouco sobre você, sua experiência com dança..."></textarea>
          <div style="font-size:10.5px; color:var(--text-mute); margin-top:2px;">Será exibida na página pública da escola.</div>
        </div>
        <div class="field" style="grid-column:1/-1;">
          <label for="especialidades">Especialidades</label>
          <input id="especialidades" name="especialidades" type="text" bind:value={especialidades} placeholder="Forró, Samba de Gafieira, Zouk" />
          <div style="font-size:10.5px; color:var(--text-mute); margin-top:2px;">Separe por vírgula.</div>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; margin-top:18px;">
        <button type="submit" class="btn btn--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
          Salvar Alterações
        </button>
      </div>
    </div>
  </form>

  <div style="display:flex; flex-direction:column; gap:16px;">
    <div class="card">
      <div class="card__head">
        <div class="card__title plum">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview Público
        </div>
      </div>
      <div class="public-card" style="padding:0; border:0; background:transparent;">
        {#if data.perfil.imagemUrl}
          <img src={data.perfil.imagemUrl} alt={nome} class="public-card__avatar" style="object-fit:cover;" />
        {:else}
          <div class="public-card__avatar">{initial}</div>
        {/if}
        <div class="public-card__name">{nome || 'Seu nome'}</div>
        <div class="public-card__role">Professor</div>
        {#if bio}
          <div class="public-card__bio">{bio}</div>
        {/if}
        {#if especialidadesList.length > 0}
          <div class="public-card__tags">
            {#each especialidadesList as esp, i}
              <span class="tag {i % 2 === 1 ? 'tag--coral' : ''}">{esp}</span>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="card">
      <div class="card__head">
        <div class="card__title blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></svg>
          Informações
        </div>
      </div>
      <div class="info-row">
        <span class="info-row__label">Modalidades</span>
        <span class="info-row__val">{data.modalidades.length > 0 ? data.modalidades.join(', ') : '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-row__label">Disponibilidade</span>
        <span class="info-row__val">{data.totalDisponibilidades} horário{data.totalDisponibilidades !== 1 ? 's' : ''} <a href="/professor/disponibilidade">editar</a></span>
      </div>
    </div>
  </div>
</div>
