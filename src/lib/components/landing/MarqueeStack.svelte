<script lang="ts">
  import { onMount } from 'svelte';

  type Modalidade = { id: string; nome: string };
  type Professor = { id: string; nome: string };

  let { modalidades = [], professores = [] }: {
    modalidades?: Modalidade[];
    professores?: Professor[];
  } = $props();

  // Palavras / vibrações da escola
  const VIBES = [
    'Movimento', 'Ritmo', 'Acolhimento', 'Tradição', 'Família',
    'Suingue', 'Presença', 'Cura', 'Encontro', 'Gingado', 'Brasil', 'Alegria'
  ];

  const MODS_FALLBACK = ['Forró Pé Descalço', 'Samba de Gafieira', 'Forró Roots', 'Zumba'];
  const PROFS_FALLBACK = ['Ani Gâlíoti', 'Danilo Marano', 'Mari Meireles', 'Renato Almeida'];

  const modsItems = $derived(
    modalidades.length > 0 ? modalidades.map(m => m.nome) : MODS_FALLBACK
  );
  const profsItems = $derived(
    professores.length > 0 ? professores.map(p => p.nome) : PROFS_FALLBACK
  );

  type Line = {
    items: string[];
    speed: number; // px/s (negativo = direita p/ esquerda)
    fontClass: 'serif' | 'italic';
    sizeClass: 'lg' | 'md' | 'xl';
    accentClass: 'ink' | 'terracota' | 'coral' | 'ocre';
  };

  const lines: Line[] = $derived([
    { items: modsItems, speed: -38, fontClass: 'serif', sizeClass: 'xl', accentClass: 'ink' },
    { items: VIBES.slice(0, 8), speed: 28, fontClass: 'italic', sizeClass: 'md', accentClass: 'terracota' },
    { items: profsItems, speed: -50, fontClass: 'serif', sizeClass: 'lg', accentClass: 'ink' },
    { items: VIBES.slice(4), speed: 32, fontClass: 'italic', sizeClass: 'md', accentClass: 'coral' }
  ]);

  let trackEls: (HTMLElement | null)[] = $state([]);
  let raf = 0;

  onMount(() => {
    let lastY = window.scrollY;
    let lastT = performance.now();
    let scrollBoost = 0;
    const offsets: number[] = trackEls.map(() => 0);

    function tick(t: number) {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;
      // Decay exponencial do boost (~ meia-vida ~ 200ms)
      scrollBoost *= Math.exp(-dt * 5);

      trackEls.forEach((el, i) => {
        if (!el) return;
        const line = lines[i];
        const dir = Math.sign(line.speed);
        const speed = line.speed + dir * scrollBoost * 3;
        offsets[i] += speed * dt;

        // half = largura de uma cópia (track tem 2 cópias)
        const half = el.scrollWidth / 2;
        if (half > 0) {
          if (offsets[i] <= -half) offsets[i] += half;
          else if (offsets[i] >= 0) offsets[i] -= half;
        }
        el.style.transform = `translate3d(${offsets[i]}px, 0, 0)`;
      });

      raf = requestAnimationFrame(tick);
    }

    function onScroll() {
      const y = window.scrollY;
      const dy = Math.abs(y - lastY);
      lastY = y;
      scrollBoost = Math.min(scrollBoost + dy * 0.3, 60);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  });
</script>

<section class="mq" aria-hidden="true">
  <div class="mq__lines">
    {#each lines as line, idx}
      <div class="mq__line mq__line--{line.sizeClass} mq__line--{line.accentClass}">
        <div class="mq__track {line.fontClass === 'italic' ? 'is-italic' : 'is-serif'}" bind:this={trackEls[idx]}>
          {#each [...line.items, ...line.items, ...line.items] as item, i}
            <span class="mq__word">{item}</span>
            <span class="mq__dot" aria-hidden="true"></span>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .mq {
    margin: 60px 0;
    padding: 18px 0;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    overflow: hidden;
    background: var(--creme);
    position: relative;
  }
  .mq::before, .mq::after {
    content: "";
    position: absolute;
    top: 0; bottom: 0;
    width: 80px;
    z-index: 2;
    pointer-events: none;
  }
  .mq::before {
    left: 0;
    background: linear-gradient(90deg, var(--creme) 0%, transparent 100%);
  }
  .mq::after {
    right: 0;
    background: linear-gradient(-90deg, var(--creme) 0%, transparent 100%);
  }

  .mq__lines {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .mq__line {
    overflow: hidden;
    padding: 6px 0;
  }
  .mq__track {
    display: flex;
    align-items: center;
    gap: 48px;
    white-space: nowrap;
    will-change: transform;
    /* Sem animation CSS — controle por JS via requestAnimationFrame */
  }
  .mq__track.is-serif {
    font-family: var(--serif);
    font-weight: 300;
    letter-spacing: -0.02em;
  }
  .mq__track.is-italic {
    font-family: var(--italic);
    font-style: italic;
    font-weight: 400;
  }

  /* Tamanhos */
  .mq__line--md .mq__track { font-size: 30px; gap: 36px; }
  .mq__line--lg .mq__track { font-size: 42px; gap: 44px; }
  .mq__line--xl .mq__track { font-size: 56px; gap: 56px; }

  /* Acentos / cores */
  .mq__line--ink .mq__track { color: var(--ink); }
  .mq__line--terracota .mq__track { color: var(--terracota); }
  .mq__line--coral .mq__track { color: var(--coral); }
  .mq__line--ocre .mq__track { color: var(--ocre); }

  .mq__word { display: inline-block; }
  .mq__dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.45;
    flex-shrink: 0;
  }
  .mq__line--xl .mq__dot { width: 10px; height: 10px; }
  .mq__line--md .mq__dot { width: 6px; height: 6px; }

  @media (max-width: 760px) {
    .mq { margin: 40px 0; padding: 12px 0; }
    .mq__line--md .mq__track { font-size: 22px; gap: 28px; }
    .mq__line--lg .mq__track { font-size: 30px; gap: 32px; }
    .mq__line--xl .mq__track { font-size: 38px; gap: 40px; }
    .mq__lines { gap: 2px; }
    .mq::before, .mq::after { width: 40px; }
  }
</style>
