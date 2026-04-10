<!-- Pulso — Layout do Painel Administrativo -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

  let { children, data } = $props();
  let sidebarOpen = $state(false);

  const navSections = [
    {
      title: 'Principal',
      items: [
        { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
        { href: '/admin/cms', label: 'Conteúdo (CMS)', icon: 'edit_note' },
      ]
    },
    {
      title: 'Escola',
      items: [
        { href: '/admin/modalidades', label: 'Modalidades', icon: 'sports_martial_arts' },
        { href: '/admin/turmas', label: 'Turmas', icon: 'groups' },
        { href: '/admin/professores', label: 'Professores', icon: 'school' },
        { href: '/admin/alunos', label: 'Alunos', icon: 'person' },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { href: '/admin/planos', label: 'Planos', icon: 'credit_card' },
        { href: '/admin/eventos', label: 'Eventos', icon: 'event' },
        { href: '/admin/financeiro', label: 'Financeiro', icon: 'account_balance' },
        { href: '/admin/checkin', label: 'Check-in', icon: 'qr_code_scanner' },
        { href: '/admin/presenca', label: 'Presença', icon: 'fact_check' },
      ]
    }
  ];

  function isActive(href: string, pathname: string): boolean {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }
</script>

<div class="min-h-screen bg-zinc-950 flex">
  <!-- Mobile overlay -->
  {#if sidebarOpen}
    <button
      class="fixed inset-0 bg-black/60 z-40 lg:hidden"
      onclick={() => sidebarOpen = false}
      tabindex="-1"
      aria-label="Fechar menu"
    ></button>
  {/if}

  <!-- Sidebar -->
  <aside class="fixed lg:sticky top-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-50 transition-transform lg:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}">
    <div class="p-5 border-b border-zinc-800">
      <a href="/admin" class="flex items-center gap-2">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-lg">bolt</span>
        </div>
        <div>
          <span class="text-sm font-bold text-white block leading-none">Pulso</span>
          <span class="text-[10px] text-zinc-500 uppercase tracking-widest">{data.tenant?.nome ?? 'Admin'}</span>
        </div>
      </a>
    </div>

    <nav class="flex-1 overflow-y-auto p-3 space-y-6">
      {#each navSections as section}
        <div>
          <p class="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">{section.title}</p>
          <div class="space-y-0.5">
            {#each section.items as item}
              {@const active = isActive(item.href, $page.url.pathname)}
              <a
                href={item.href}
                onclick={() => sidebarOpen = false}
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all {active ? 'bg-primary/15 text-primary font-medium' : 'text-zinc-400 hover:text-white hover:bg-white/5'}"
              >
                <span class="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            {/each}
          </div>
        </div>
      {/each}
    </nav>

    <div class="p-4 border-t border-zinc-800">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-zinc-300 text-sm">person</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-white truncate">{data.user?.nome ?? 'Admin'}</p>
          <p class="text-[10px] text-zinc-500 truncate">{data.user?.email ?? ''}</p>
        </div>
      </div>
      <form method="POST" action="/logout" use:enhance>
        <button type="submit" class="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-400 transition-colors w-full px-1">
          <span class="material-symbols-outlined text-[18px]">logout</span>
          Sair
        </button>
      </form>
    </div>
  </aside>

  <!-- Main -->
  <div class="flex-1 flex flex-col min-h-screen">
    <!-- Top bar mobile -->
    <header class="lg:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-lg sticky top-0 z-30">
      <button onclick={() => sidebarOpen = true} class="text-zinc-400 hover:text-white">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <span class="text-sm font-bold text-white">Pulso</span>
      <div class="w-6"></div>
    </header>

    <main class="flex-1 p-6 lg:p-8">
      {@render children()}
    </main>
  </div>
</div>
