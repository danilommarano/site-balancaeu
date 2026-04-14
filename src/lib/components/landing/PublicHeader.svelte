<script lang="ts">
  import Logo from './Logo.svelte';
  import { onMount, tick } from 'svelte';

  interface NavLink {
    href: string;
    label: string;
  }

  interface Props {
    navLinks: NavLink[];
    ctaHref?: string;
    ctaLabel?: string;
  }

  let { navLinks, ctaHref = '/comecar', ctaLabel = 'Começar Jornada' }: Props = $props();

  let mobileMenuOpen = $state(false);
  let navEl = $state<HTMLElement | null>(null);
  let linkEls: (HTMLAnchorElement | null)[] = $state([]);
  let activeIdx = $state(-1);
  let underline = $state({ left: 0, width: 0, visible: false });

  function getHashId(href: string): string | null {
    const idx = href.indexOf('#');
    if (idx < 0) return null;
    return href.slice(idx + 1) || null;
  }

  function updateUnderline() {
    if (!navEl || activeIdx < 0) {
      underline = { ...underline, visible: false };
      return;
    }
    const el = linkEls[activeIdx];
    if (!el) {
      underline = { ...underline, visible: false };
      return;
    }
    const navRect = navEl.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    underline = {
      left: rect.left - navRect.left,
      width: rect.width,
      visible: true
    };
  }

  $effect(() => {
    // Depende de activeIdx e mudanças em navLinks — recalcula ao mudar
    activeIdx;
    navLinks;
    tick().then(updateUnderline);
  });

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const idx = navLinks.findIndex(l => getHashId(l.href) === id);
            if (idx >= 0) activeIdx = idx;
          }
        }
      },
      { rootMargin: '-20% 0px -75% 0px', threshold: 0 }
    );

    for (const link of navLinks) {
      const id = getHashId(link.href);
      if (!id) continue;
      const target = document.getElementById(id);
      if (target) observer.observe(target);
    }

    const onResize = () => updateUnderline();
    window.addEventListener('resize', onResize);

    updateUnderline();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  });

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<header class="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
  <div class="flex justify-between items-center px-8 py-6 max-w-screen-2xl mx-auto">
    <a class="flex items-center gap-2" href="/">
      <Logo class="h-8 w-auto" />
    </a>

    <nav bind:this={navEl} class="hidden xl:flex gap-8 items-center relative">
      {#each navLinks as link, i}
        <a
          bind:this={linkEls[i]}
          class="font-label text-sm uppercase tracking-widest transition-colors duration-300 {i === activeIdx ? 'text-primary' : 'text-stone-600 hover:text-secondary'}"
          href={link.href}
        >
          {link.label}
        </a>
      {/each}

      <!-- Sublinhado animado deslizante -->
      <span
        class="absolute -bottom-2 h-[2px] bg-primary rounded-full pointer-events-none transition-all duration-500 ease-out"
        style="left: {underline.left}px; width: {underline.width}px; opacity: {underline.visible ? 1 : 0};"
      ></span>
    </nav>

    <div class="flex items-center gap-4">
      <a href={ctaHref} class="bg-primary text-on-primary px-6 py-2 rounded-lg font-label font-medium hover:opacity-90 transition-opacity hidden sm:block">
        {ctaLabel}
      </a>
      <button class="xl:hidden text-primary p-2" onclick={() => mobileMenuOpen = true}>
        <span class="material-symbols-outlined text-3xl">menu</span>
      </button>
    </div>
  </div>
</header>

{#if mobileMenuOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-[100] bg-background/95 backdrop-blur-lg xl:hidden"
    onclick={closeMobileMenu}
    onkeydown={(e) => e.key === 'Escape' && closeMobileMenu()}
  >
    <div class="flex flex-col h-full p-8" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
      <div class="flex justify-between items-center mb-12">
        <Logo class="h-8 w-auto" />
        <button class="text-primary p-2" onclick={closeMobileMenu}>
          <span class="material-symbols-outlined text-3xl">close</span>
        </button>
      </div>
      <nav class="flex flex-col gap-4">
        {#each navLinks as link}
          <a
            class="w-full py-4 px-6 border-2 border-stone-200 rounded-2xl font-headline text-xl text-on-surface flex justify-between items-center group active:border-primary"
            href={link.href}
            onclick={closeMobileMenu}
          >
            {link.label}
            <span class="material-symbols-outlined opacity-0 group-active:opacity-100 transition-opacity">arrow_forward</span>
          </a>
        {/each}
      </nav>
      <div class="mt-auto py-8">
        <a href={ctaHref} class="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-lg block text-center">
          {ctaLabel}
        </a>
      </div>
    </div>
  </div>
{/if}
