<!-- BalancaEu — Layout Área do Professor -->
<script lang="ts">
  import '$lib/styles/professor.css';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import Logo from '$lib/components/landing/Logo.svelte';

  let { children, data } = $props();
  let sidebarOpen = $state(false);

  onMount(() => {
    const pref = data.user?.themePreference;
    if (pref === 'light' || pref === 'dark') {
      themeStore.hydrate(pref);
    }
  });

  function isActive(href: string): boolean {
    const p = $page.url.pathname;
    if (href === '/professor') return p === '/professor';
    return p.startsWith(href);
  }

  const initial = $derived((data.user?.nome ?? 'P')[0].toUpperCase());
</script>

<div class="prof-shell">
  <div class="app">
    {#if sidebarOpen}
      <button class="mobile-overlay" onclick={() => sidebarOpen = false} tabindex="-1" aria-label="Fechar menu"></button>
    {/if}

    <aside class="sidebar {sidebarOpen ? 'is-open' : ''}">
      <div class="sidebar__brand">
        <a href="/" class="sidebar__logo-link">
          <Logo class="sidebar__logo-svg" />
        </a>
        <div class="sidebar__brand-sub">Professor</div>
      </div>

      <div class="sidebar__section">Principal</div>
      <nav class="sidebar__nav">
        <a class="nav-item {isActive('/professor') ? 'is-active' : ''}" href="/professor" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
          <span class="nav-item__label">Painel</span>
        </a>
      </nav>

      <div class="sidebar__section">Aulas</div>
      <nav class="sidebar__nav">
        <a class="nav-item {isActive('/professor/chamada') ? 'is-active' : ''}" href="/professor/chamada" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          <span class="nav-item__label">Chamada</span>
        </a>
        <a class="nav-item {isActive('/professor/agenda') ? 'is-active' : ''}" href="/professor/agenda" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
          <span class="nav-item__label">Agenda</span>
        </a>
        <a class="nav-item {isActive('/professor/particulares') ? 'is-active' : ''}" href="/professor/particulares" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
          <span class="nav-item__label">Particulares</span>
        </a>
        <a class="nav-item {isActive('/professor/disponibilidade') ? 'is-active' : ''}" href="/professor/disponibilidade" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          <span class="nav-item__label">Disponibilidade</span>
        </a>
      </nav>

      <div class="sidebar__section">Conta</div>
      <nav class="sidebar__nav">
        <a class="nav-item {isActive('/professor/perfil') ? 'is-active' : ''}" href="/professor/perfil" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>
          <span class="nav-item__label">Perfil</span>
        </a>
      </nav>

      <div class="sidebar__user">
        <div class="sidebar__avatar">{initial}</div>
        <div class="sidebar__user-info">
          <div class="sidebar__user-name">{data.user?.nome ?? 'Professor'}</div>
          <div class="sidebar__user-email">{data.user?.email ?? ''}</div>
        </div>
      </div>
      <ThemeToggle />
      <form method="POST" action="/logout" use:enhance>
        <button type="submit" class="sidebar__logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>
          Sair
        </button>
      </form>
    </aside>

    <header class="mobile-header">
      <button onclick={() => sidebarOpen = true} aria-label="Menu">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
      <a href="/" class="mobile-header__logo-link">
        <Logo class="mobile-header__logo-svg" />
      </a>
      <div style="width:24px"></div>
    </header>

    <main class="main">
      {@render children()}
    </main>
  </div>
</div>
