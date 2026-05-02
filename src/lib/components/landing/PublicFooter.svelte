<script lang="ts">
  import Logo from './Logo.svelte';

  let { cms = {} }: { cms?: Record<string, Record<string, string>> } = $props();

  const footer = $derived(cms.footer ?? {});
  const contato = $derived(cms.contato ?? {});

  const descricao = $derived(footer.descricao || 'Movimento é cura. Dança é encontro. Casa é onde o corpo respira.');
  const copyright = $derived(footer.copyright || '© 2026 Balança Eu · Todos os direitos reservados');

  const instagramUrl = $derived(contato.instagram_url || '#');
  const whatsappUrl = $derived(contato.whatsapp_url || '#');
</script>

<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__brand">
        <div class="footer__logo">
          <Logo class="footer__logo-svg" />
        </div>
        <p class="footer__tagline">{descricao}</p>
        <div class="footer__socials">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>
          </a>
          <a href="#" aria-label="YouTube">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="3"/><polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.5-4.5A8 8 0 1 1 9 20.5L4 20z"/></svg>
          </a>
          <a href="#" aria-label="Spotify">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M7 10c3-1 7-1 10 1M7.5 13.5c2.5-.8 5.5-.6 8 .8M8 17c2-.6 4-.4 6 .5"/></svg>
          </a>
        </div>
      </div>
      <div class="footer__col">
        <h4>Escola</h4>
        <ul>
          <li><a href="#filosofia">Filosofia</a></li>
          <li><a href="#modulos">Módulos</a></li>
          <li><a href="#professores">Professores</a></li>
          <li><a href="#galeria">Galeria</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h4>Aulas</h4>
        <ul>
          <li><a href="#grade">Grade</a></li>
          <li><a href="#caminho">Como funciona</a></li>
          <li><a href="#agenda">Eventos</a></li>
          <li><a href="#faq">Dúvidas</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h4>Conta</h4>
        <ul>
          <li><a href="/login">Portal do aluno</a></li>
          <li><a href="/login">Portal do professor</a></li>
          <li><a href="/login">Portal do gestor</a></li>
          <li><a href="/comecar">Matricule-se</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <div>{copyright}</div>
      <div style="display: flex; gap: 20px;">
        <a href="#">Privacidade</a>
        <a href="#">Termos</a>
        <a href="#">Handbook dos mestres</a>
      </div>
    </div>
  </div>
</footer>
