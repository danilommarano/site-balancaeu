<!-- BalancaEu — Landing Page -->
<script lang="ts">
  import PublicHeader from '$lib/components/landing/PublicHeader.svelte';
  import PublicFooter from '$lib/components/landing/PublicFooter.svelte';
  import HeroSection from '$lib/components/landing/HeroSection.svelte';
  import MarqueeStack from '$lib/components/landing/MarqueeStack.svelte';
  import FilosofiaSection from '$lib/components/landing/FilosofiaSection.svelte';
  import ModulosSection from '$lib/components/landing/ModulosSection.svelte';
  import ProfessoresSection from '$lib/components/landing/ProfessoresSection.svelte';
  import GradeSection from '$lib/components/landing/GradeSection.svelte';
  import DepoimentosSection from '$lib/components/landing/DepoimentosSection.svelte';
  import GaleriaSection from '$lib/components/landing/GaleriaSection.svelte';
  import AgendaSection from '$lib/components/landing/AgendaSection.svelte';
  import CaminhoSection from '$lib/components/landing/CaminhoSection.svelte';
  import FAQSection from '$lib/components/landing/FAQSection.svelte';
  import LocalSection from '$lib/components/landing/LocalSection.svelte';
  import CTAFinalSection from '$lib/components/landing/CTAFinalSection.svelte';

  let { data } = $props();
  const { cms, modalidades, professores, turmas, eventos } = data;
</script>

<svelte:head>
  <title>Balança Eu | Escola de Dança e Centro Cultural</title>
  <meta name="description" content="Um movimento que começa no corpo e transforma quem você é. Escola de dança com Forró, Samba, Zumba e Yoga." />
</svelte:head>

<PublicHeader {cms} />

<main>
  <HeroSection {cms} {modalidades} {professores} />
  <MarqueeStack {modalidades} {professores} />
  <FilosofiaSection {cms} />
  <ModulosSection {cms} {modalidades} />
  <ProfessoresSection {cms} {professores} />
  <GradeSection {cms} {turmas} />
  <DepoimentosSection {cms} />
  <GaleriaSection />
  <AgendaSection {cms} {eventos} />
  <CaminhoSection {cms} />
  <FAQSection {cms} />
  <LocalSection {cms} />
  <CTAFinalSection {cms} />
</main>

<PublicFooter {cms} />
