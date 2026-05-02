<script lang="ts">
  import { onMount } from 'svelte';
  import Logo from './Logo.svelte';
  import LogoMark from './LogoMark.svelte';

  let { cms = {} }: { cms?: Record<string, Record<string, string>> } = $props();

  let scrolled = $state(false);
  let menuOpen = $state(false);

  onMount(() => {
    const onScroll = () => { scrolled = window.scrollY > 40; };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = menuOpen ? 'hidden' : '';
    }
  });

  function closeMenu() { menuOpen = false; }

  const links = [
    { href: '#filosofia', label: 'Filosofia' },
    { href: '#modulos', label: 'Módulos' },
    { href: '#professores', label: 'Professores' },
    { href: '#grade', label: 'Grade' },
    { href: '#agenda', label: 'Agenda' },
    { href: '#caminho', label: 'Como funciona' }
  ];
</script>

<nav class="nav {scrolled ? 'is-scrolled' : ''}">
  <div class="container nav__inner">
    <a href="#top" class="nav__logo" aria-label="Balança Eu — início" onclick={closeMenu}>
      <span class="nav__logo-full"><Logo class="nav__logo-svg" /></span>
      <span class="nav__logo-mark"><LogoMark class="nav__logo-mark-svg" /></span>
    </a>

    <div class="nav__menu">
      {#each links as link}
        <a href={link.href}>{link.label}</a>
      {/each}
    </div>

    <div class="nav__actions">
      <a href="/comecar" class="btn btn--primary btn--sm nav__cta">
        <span class="nav__cta-full">Matricule-se</span>
        <span class="nav__cta-short">Matrícula</span>
        <svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>
      <button
        class="nav__burger"
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuOpen}
        onclick={() => menuOpen = !menuOpen}
      >
        <span class:is-open={menuOpen}></span>
        <span class:is-open={menuOpen}></span>
        <span class:is-open={menuOpen}></span>
      </button>
    </div>
  </div>
</nav>

{#if menuOpen}
  <button class="mobile-overlay" onclick={closeMenu} aria-label="Fechar menu" tabindex="-1"></button>
{/if}

<aside class="mobile-drawer {menuOpen ? 'is-open' : ''}" aria-hidden={!menuOpen}>
  <div class="mobile-drawer__head">
    <a href="#top" onclick={closeMenu}><Logo class="mobile-drawer__logo" /></a>
    <button class="mobile-drawer__close" onclick={closeMenu} aria-label="Fechar">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <nav class="mobile-drawer__nav">
    {#each links as link, i}
      <a href={link.href} onclick={closeMenu} style="animation-delay:{60 + i * 40}ms">
        <span>{link.label}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </a>
    {/each}
  </nav>
  <div class="mobile-drawer__cta">
    <a href="/comecar" class="btn btn--primary" onclick={closeMenu}>
      Matricule-se agora
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
    </a>
    <a href="/login" class="btn btn--ghost" onclick={closeMenu}>Já sou aluno</a>
  </div>
</aside>

<style>
  /* Logo: full em desktop, mark em mobile */
  :global(.nav__logo) { gap: 0; }
  :global(.nav__logo-full) { display: inline-flex; }
  :global(.nav__logo-mark) { display: none; align-items: center; }
  :global(.nav__logo-mark-svg) { height: 32px; width: 32px; color: var(--terracota); }

  /* CTA texts */
  :global(.nav__cta-short) { display: none; }

  /* Hambúrguer button */
  .nav__burger {
    display: none;
    width: 40px; height: 40px;
    background: transparent;
    border: 0;
    cursor: pointer;
    padding: 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    border-radius: 8px;
    transition: background .2s;
  }
  .nav__burger:hover { background: rgba(168, 58, 46, 0.06); }
  .nav__burger span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--ink);
    border-radius: 2px;
    transition: transform .25s var(--ease-out), opacity .2s, background .2s;
    transform-origin: center;
  }
  .nav__burger span.is-open:nth-child(1) { transform: translateY(7px) rotate(45deg); background: var(--terracota); }
  .nav__burger span.is-open:nth-child(2) { opacity: 0; }
  .nav__burger span.is-open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: var(--terracota); }

  /* Mobile overlay */
  .mobile-overlay {
    display: none;
    position: fixed; inset: 0;
    background: rgba(27, 20, 16, 0.55);
    backdrop-filter: blur(2px);
    z-index: 60;
    border: 0;
    cursor: pointer;
    animation: fadeIn .25s var(--ease-out);
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

  /* Drawer off-canvas */
  .mobile-drawer {
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: min(86vw, 360px);
    background: var(--creme);
    border-left: 1px solid var(--line);
    z-index: 70;
    transform: translateX(100%);
    transition: transform .35s var(--ease-out);
    display: none;
    flex-direction: column;
    box-shadow: -20px 0 60px -20px rgba(74, 20, 15, 0.3);
  }
  .mobile-drawer.is-open { transform: translateX(0); }
  .mobile-drawer__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 22px 16px;
    border-bottom: 1px solid var(--line);
  }
  :global(.mobile-drawer__logo) { height: 26px; width: auto; color: var(--terracota); }
  .mobile-drawer__close {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: var(--creme-warm);
    border: 0;
    cursor: pointer;
    color: var(--ink);
    display: grid; place-items: center;
    transition: background .2s, color .2s;
  }
  .mobile-drawer__close:hover { background: var(--terracota); color: var(--creme); }

  .mobile-drawer__nav {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .mobile-drawer__nav a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 14px;
    border-radius: 12px;
    color: var(--ink);
    text-decoration: none;
    font-family: var(--serif);
    font-size: 22px;
    font-weight: 400;
    letter-spacing: -0.015em;
    transition: background .2s, color .2s, transform .2s;
    opacity: 0;
    animation: drawerItem .35s var(--ease-out) forwards;
  }
  @keyframes drawerItem {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .mobile-drawer__nav a:hover {
    background: var(--creme-warm);
    color: var(--terracota);
    transform: translateX(2px);
  }
  .mobile-drawer__nav a svg {
    color: var(--terracota);
    opacity: 0.5;
    transition: opacity .2s, transform .2s;
  }
  .mobile-drawer__nav a:hover svg { opacity: 1; transform: translateX(2px); }

  .mobile-drawer__cta {
    padding: 18px 22px 22px;
    border-top: 1px solid var(--line);
    background: var(--creme-warm);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  :global(.mobile-drawer__cta .btn) { width: 100%; justify-content: center; }

  @media (max-width: 760px) {
    :global(.nav__logo-full) { display: none; }
    :global(.nav__logo-mark) { display: inline-flex; }
    :global(.nav__cta-full) { display: none; }
    :global(.nav__cta-short) { display: inline; }
    .nav__burger { display: flex; }
    .mobile-drawer { display: flex; }
  }
</style>
