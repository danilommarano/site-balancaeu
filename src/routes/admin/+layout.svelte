<!-- BalancaEu — Layout do Painel Administrativo -->
<script lang="ts">
  import '$lib/styles/admin.css';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import Logo from '$lib/components/landing/Logo.svelte';

  let { children, data } = $props();
  let sidebarOpen = $state(false);

  // Hidrata o tema com a preferência salva no banco, se houver
  onMount(() => {
    const pref = data.user?.themePreference;
    if (pref === 'light' || pref === 'dark') {
      themeStore.hydrate(pref);
    }
  });

  let cmsOpen = $state(false);
  $effect(() => {
    if ($page.url.pathname.startsWith('/admin/cms')) cmsOpen = true;
  });

  const cmsPages = $derived([
    { href: '/admin/cms', label: 'Landing Page', icon: 'home' },
    ...((data.modalidadesNav ?? []) as { id: string; nome: string }[]).map(m => ({
      href: `/admin/cms/modulo/${m.id}`,
      label: m.nome,
      icon: 'modulo'
    }))
  ]);

  function isActive(href: string): boolean {
    const p = $page.url.pathname;
    if (href === '/admin') return p === '/admin';
    if (href === '/admin/cms') return p === '/admin/cms';
    return p.startsWith(href);
  }

  const initial = $derived((data.user?.nome ?? 'A')[0].toUpperCase());
</script>

<div class="admin-shell">
  <div class="app">
    <!-- Mobile overlay -->
    {#if sidebarOpen}
      <button class="mobile-overlay" onclick={() => sidebarOpen = false} tabindex="-1" aria-label="Fechar menu"></button>
    {/if}

    <!-- Sidebar -->
    <aside class="sidebar {sidebarOpen ? 'is-open' : ''}">
      <div class="sidebar__brand">
        <a href="/" class="sidebar__logo-link">
          <Logo class="sidebar__logo-svg" />
        </a>
        <div class="sidebar__brand-sub">{data.tenant?.nome ?? 'Admin'}</div>
      </div>

      <div class="sidebar__section">Principal</div>
      <nav class="sidebar__nav">
        <a class="nav-item {isActive('/admin') ? 'is-active' : ''}" href="/admin" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
          <span class="nav-item__label">Dashboard</span>
        </a>
        <button class="nav-item {cmsOpen ? 'is-open' : ''} {$page.url.pathname.startsWith('/admin/cms') ? 'is-active' : ''}" onclick={() => cmsOpen = !cmsOpen}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M4 12h16M4 19h10"/></svg>
          <span class="nav-item__label">Conteúdo (CMS)</span>
          <span class="nav-item__caret"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M6 9l6 6 6-6"/></svg></span>
        </button>
        {#if cmsOpen}
          <div class="nav-sub">
            {#each cmsPages as sub}
              <a href={sub.href} class={isActive(sub.href) ? 'is-active' : ''} onclick={() => sidebarOpen = false}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  {#if sub.icon === 'home'}
                    <path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/>
                  {:else}
                    <circle cx="12" cy="5" r="2"/><path d="M12 7v6M8 13h8M8 13l-3 8M16 13l3 8"/>
                  {/if}
                </svg>
                {sub.label}
              </a>
            {/each}
          </div>
        {/if}
      </nav>

      <div class="sidebar__section">Escola</div>
      <nav class="sidebar__nav">
        <a class="nav-item {isActive('/admin/modalidades') ? 'is-active' : ''}" href="/admin/modalidades" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v6M8 13h8M8 13l-3 8M16 13l3 8"/></svg>
          <span class="nav-item__label">Modalidades</span>
        </a>
        <a class="nav-item {isActive('/admin/turmas') ? 'is-active' : ''}" href="/admin/turmas" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M15 20c0-2 2-4 4-4s2 1 2 2"/></svg>
          <span class="nav-item__label">Turmas</span>
        </a>
        <a class="nav-item {isActive('/admin/professores') ? 'is-active' : ''}" href="/admin/professores" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5L2 10z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>
          <span class="nav-item__label">Professores</span>
        </a>
        <a class="nav-item {isActive('/admin/alunos') ? 'is-active' : ''}" href="/admin/alunos" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
          <span class="nav-item__label">Alunos</span>
        </a>
        <a class="nav-item {isActive('/admin/midia') ? 'is-active' : ''}" href="/admin/midia" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
          <span class="nav-item__label">Mídia</span>
        </a>
      </nav>

      <div class="sidebar__section">Gestão</div>
      <nav class="sidebar__nav">
        <a class="nav-item {isActive('/admin/planos') ? 'is-active' : ''}" href="/admin/planos" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
          <span class="nav-item__label">Planos</span>
        </a>
        <a class="nav-item {isActive('/admin/eventos') ? 'is-active' : ''}" href="/admin/eventos" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
          <span class="nav-item__label">Eventos</span>
        </a>
        <a class="nav-item {isActive('/admin/financeiro') ? 'is-active' : ''}" href="/admin/financeiro" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"/><path d="M7 15h4"/></svg>
          <span class="nav-item__label">Financeiro</span>
        </a>
        <a class="nav-item {isActive('/admin/checkin') ? 'is-active' : ''}" href="/admin/checkin" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v3M14 21h3M21 18v3h-3"/></svg>
          <span class="nav-item__label">Check-in</span>
        </a>
        <a class="nav-item {isActive('/admin/presenca') ? 'is-active' : ''}" href="/admin/presenca" onclick={() => sidebarOpen = false}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          <span class="nav-item__label">Presença</span>
        </a>
      </nav>

      <div class="sidebar__user">
        <div class="sidebar__avatar">{initial}</div>
        <div class="sidebar__user-info">
          <div class="sidebar__user-name">{data.user?.nome ?? 'Admin'}</div>
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

    <!-- Mobile header -->
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
