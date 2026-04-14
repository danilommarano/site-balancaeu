<!-- BalancaEu — Layout Área do Professor -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

  let { children, data } = $props();
  let mobileOpen = $state(false);

  const navSections = [
    {
      label: 'Principal',
      items: [
        { href: '/professor', label: 'Painel', icon: 'dashboard' },
      ]
    },
    {
      label: 'Aulas',
      items: [
        { href: '/professor/chamada', label: 'Chamada', icon: 'fact_check' },
        { href: '/professor/agenda', label: 'Agenda', icon: 'calendar_month' },
        { href: '/professor/particulares', label: 'Particulares', icon: 'person' },
        { href: '/professor/disponibilidade', label: 'Disponibilidade', icon: 'schedule' },
      ]
    },
    {
      label: 'Conta',
      items: [
        { href: '/professor/perfil', label: 'Perfil', icon: 'settings' },
      ]
    }
  ];

  function isActive(href: string): boolean {
    if (href === '/professor') return $page.url.pathname === '/professor';
    return $page.url.pathname.startsWith(href);
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
</svelte:head>

<div class="min-h-screen bg-zinc-950 flex">
  <!-- Sidebar -->
  <aside class="hidden lg:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col fixed inset-y-0 left-0 z-30">
    <div class="p-5 border-b border-zinc-800">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-[18px]">school</span>
        </div>
        <div>
          <h1 class="text-sm font-bold text-white">BalancaEu</h1>
          <p class="text-[10px] text-zinc-500">Professor</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 p-3 overflow-y-auto">
      {#each navSections as section}
        <div class="mb-4">
          <p class="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 mb-1.5">{section.label}</p>
          {#each section.items as item}
            <a
              href={item.href}
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                {isActive(item.href) ? 'bg-blue-600/15 text-blue-400 font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}"
            >
              <span class="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </a>
          {/each}
        </div>
      {/each}
    </nav>

    <div class="p-4 border-t border-zinc-800">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
          <span class="material-symbols-outlined text-blue-400 text-[16px]">person</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-white font-medium truncate">{data.user?.nome ?? 'Professor'}</p>
          <p class="text-[10px] text-zinc-500 truncate">{data.user?.email ?? ''}</p>
        </div>
      </div>
      <form method="POST" action="/logout" use:enhance>
        <button type="submit" class="flex items-center gap-2 text-xs text-zinc-500 hover:text-red-400 transition-colors w-full">
          <span class="material-symbols-outlined text-[16px]">logout</span>
          Sair
        </button>
      </form>
    </div>
  </aside>

  <!-- Mobile header -->
  <div class="lg:hidden fixed top-0 left-0 right-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
        <span class="material-symbols-outlined text-white text-[16px]">school</span>
      </div>
      <span class="text-sm font-bold text-white">BalancaEu</span>
    </div>
    <button onclick={() => mobileOpen = !mobileOpen} class="text-zinc-400 hover:text-white" aria-label="Menu">
      <span class="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
    </button>
  </div>

  <!-- Mobile overlay -->
  {#if mobileOpen}
    <button class="lg:hidden fixed inset-0 bg-black/60 z-30" onclick={() => mobileOpen = false} aria-label="Fechar menu"></button>
    <aside class="lg:hidden fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 z-40 flex flex-col">
      <div class="p-5 border-b border-zinc-800">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-[18px]">school</span>
          </div>
          <div>
            <h1 class="text-sm font-bold text-white">BalancaEu</h1>
            <p class="text-[10px] text-zinc-500">Professor</p>
          </div>
        </div>
      </div>
      <nav class="flex-1 p-3 overflow-y-auto">
        {#each navSections as section}
          <div class="mb-4">
            <p class="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 mb-1.5">{section.label}</p>
            {#each section.items as item}
              <a
                href={item.href}
                onclick={() => mobileOpen = false}
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                  {isActive(item.href) ? 'bg-blue-600/15 text-blue-400 font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}"
              >
                <span class="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </a>
            {/each}
          </div>
        {/each}
      </nav>
      <div class="p-4 border-t border-zinc-800">
        <p class="text-sm text-white font-medium truncate mb-2">{data.user?.nome ?? 'Professor'}</p>
        <form method="POST" action="/logout" use:enhance>
          <button type="submit" class="flex items-center gap-2 text-xs text-zinc-500 hover:text-red-400 transition-colors">
            <span class="material-symbols-outlined text-[16px]">logout</span>
            Sair
          </button>
        </form>
      </div>
    </aside>
  {/if}

  <!-- Main content -->
  <main class="flex-1 lg:ml-64 pt-16 lg:pt-0">
    <div class="p-6 lg:p-8">
      {@render children()}
    </div>
  </main>
</div>
