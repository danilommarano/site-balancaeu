<script lang="ts">
  import Logo from './Logo.svelte';

  interface NavLink {
    href: string;
    label: string;
  }

  interface Props {
    navLinks: NavLink[];
    cms?: Record<string, Record<string, string>>;
  }

  let { navLinks, cms: cmsData = {} }: Props = $props();

  function cms(secao: string, chave: string, fallback = ''): string {
    return cmsData?.[secao]?.[chave] ?? fallback;
  }
</script>

<footer class="bg-surface border-t border-primary/10">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-20 max-w-screen-2xl mx-auto">
    <div class="md:col-span-2">
      <span class="mb-4 block">
        <Logo class="h-10 w-auto text-secondary" />
      </span>
      <p class="text-stone-500 font-label text-sm leading-relaxed max-w-sm mb-8">
        {cms('footer', 'descricao', 'Um centro cultural dedicado ao movimento consciente, à arte performática e ao florescimento humano através do corpo.')}
      </p>
      <div class="flex gap-6">
        {#if cms('contato', 'instagram_url')}
          <a class="text-stone-500 hover:text-primary transition-colors" href={cms('contato', 'instagram_url')} target="_blank" rel="noopener">
            <span class="material-symbols-outlined">share</span>
          </a>
        {/if}
        {#if cms('contato', 'whatsapp_url')}
          <a class="text-stone-500 hover:text-primary transition-colors" href={cms('contato', 'whatsapp_url')} target="_blank" rel="noopener">
            <span class="material-symbols-outlined">chat</span>
          </a>
        {/if}
      </div>
    </div>

    <div>
      <h4 class="font-bold text-on-surface mb-6 uppercase tracking-widest text-xs">Explore</h4>
      <nav class="flex flex-col gap-4">
        {#each navLinks as link}
          <a class="text-stone-500 hover:text-primary underline decoration-from-font transition-all font-label text-sm" href={link.href}>
            {link.label}
          </a>
        {/each}
      </nav>
    </div>

    <div>
      <h4 class="font-bold text-on-surface mb-6 uppercase tracking-widest text-xs">Conecte-se</h4>
      <nav class="flex flex-col gap-4">
        {#if cms('contato', 'instagram')}
          <a class="text-stone-500 hover:text-primary transition-all font-label text-sm" href={cms('contato', 'instagram_url', '#')} target="_blank" rel="noopener">
            Instagram ({cms('contato', 'instagram')})
          </a>
        {/if}
        {#if cms('contato', 'whatsapp')}
          <a class="text-stone-500 hover:text-primary transition-all font-label text-sm" href={cms('contato', 'whatsapp_url', '#')} target="_blank" rel="noopener">
            WhatsApp
          </a>
        {/if}
        {#if cms('contato', 'email')}
          <a class="text-stone-500 hover:text-primary transition-all font-label text-sm" href="mailto:{cms('contato', 'email')}">
            {cms('contato', 'email')}
          </a>
        {/if}
      </nav>
    </div>
  </div>

  <div class="px-12 py-8 border-t border-primary/5 text-center">
    <p class="text-stone-500 font-label text-sm">
      {cms('footer', 'copyright', '© 2024 Balança Eu. Onde o movimento encontra a alma.')}
    </p>
  </div>
</footer>
