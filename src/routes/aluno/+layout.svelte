<!-- BalancaEu — Layout Área do Aluno -->
<script lang="ts">
  import '$lib/styles/aluno.css';
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

  type NavItem = { href: string; label: string; svg: string };
  type NavSection = { title: string; items: NavItem[] };

  const navSections: NavSection[] = [
    {
      title: 'Principal',
      items: [
        {
          href: '/aluno',
          label: 'Minha Área',
          svg: '<path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/>'
        },
        {
          href: '/aluno/perfil',
          label: 'Meu Perfil',
          svg: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>'
        }
      ]
    },
    {
      title: 'Aulas',
      items: [
        {
          href: '/aluno/inscricoes',
          label: 'Minhas Turmas',
          svg: '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M15 20c0-2 2-4 4-4s2 1 2 2"/>'
        },
        {
          href: '/aluno/particular',
          label: 'Aulas Particulares',
          svg: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>'
        },
        {
          href: '/aluno/checkin',
          label: 'Check-in',
          svg: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v3M14 21h3M21 18v3h-3"/>'
        }
      ]
    },
    {
      title: 'Financeiro',
      items: [
        {
          href: '/aluno/plano',
          label: 'Meu Plano',
          svg: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>'
        },
        {
          href: '/aluno/extrato',
          label: 'Extrato',
          svg: '<path d="M5 4h11l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M8 12h8M8 16h6M8 8h4"/>'
        }
      ]
    }
  ];

  function isActive(href: string): boolean {
    const p = $page.url.pathname;
    if (href === '/aluno') return p === '/aluno';
    return p.startsWith(href);
  }

  const initial = $derived((data.user?.nome ?? 'A')[0].toUpperCase());
</script>

<div class="aluno-shell">
  <div class="app">
    {#if sidebarOpen}
      <button class="mobile-overlay" onclick={() => sidebarOpen = false} tabindex="-1" aria-label="Fechar menu"></button>
    {/if}

    <aside class="sidebar {sidebarOpen ? 'is-open' : ''}">
      <div class="sidebar__brand">
        <a href="/" class="sidebar__logo-link">
          <Logo class="sidebar__logo-svg" />
        </a>
        <div class="sidebar__brand-sub">Área do aluno</div>
      </div>

      {#each navSections as section, sIdx}
        <div class="sidebar__section">{section.title}</div>
        <nav class="sidebar__nav" style={sIdx < navSections.length - 1 ? 'flex: none;' : ''}>
          {#each section.items as item}
            <a class="nav-item {isActive(item.href) ? 'is-active' : ''}" href={item.href} onclick={() => sidebarOpen = false}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{@html item.svg}</svg>
              <span class="nav-item__label">{item.label}</span>
            </a>
          {/each}
        </nav>
      {/each}

      <div class="sidebar__user">
        <div class="sidebar__avatar">{initial}</div>
        <div class="sidebar__user-info">
          <div class="sidebar__user-name">{data.user?.nome ?? 'Aluno'}</div>
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
