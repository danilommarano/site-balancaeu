<!-- BalancaEu — Professor: Perfil (Fase 15) -->
<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let nome = $state(data.perfil.nome);
  let telefone = $state(data.perfil.telefone);
  let bio = $state(data.perfil.bio);
  let especialidades = $state(data.perfil.especialidades.join(', '));
</script>

<svelte:head>
  <title>Perfil — Professor — BalancaEu</title>
</svelte:head>

<div>
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white mb-1">Meu Perfil</h1>
    <p class="text-zinc-500 text-sm">Gerencie seus dados e informações públicas</p>
  </div>

  <!-- Feedback -->
  {#if form?.success}
    <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-4 py-3 mb-6 text-sm">
      <span class="material-symbols-outlined text-[18px]">check_circle</span>
      {form.message}
    </div>
  {/if}
  {#if form?.error}
    <div class="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
      <span class="material-symbols-outlined text-[18px]">error</span>
      {form.error}
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Profile form -->
    <div class="lg:col-span-2">
      <form method="POST" action="?/salvar" use:enhance>
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div class="p-5 border-b border-zinc-800 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-blue-400">edit</span>
            <h2 class="text-sm font-semibold text-white">Dados do Perfil</h2>
          </div>
          <div class="p-5 space-y-5">
            <!-- Nome -->
            <div>
              <label for="nome" class="block text-xs text-zinc-400 mb-1.5">Nome completo</label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                bind:value={nome}
                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <!-- Email (read-only) -->
            <div>
              <label for="email" class="block text-xs text-zinc-400 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                disabled
                value={data.perfil.email}
                class="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
              />
              <p class="text-[10px] text-zinc-600 mt-1">O email não pode ser alterado.</p>
            </div>

            <!-- Telefone -->
            <div>
              <label for="telefone" class="block text-xs text-zinc-400 mb-1.5">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                bind:value={telefone}
                placeholder="(11) 99999-9999"
                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <!-- Bio -->
            <div>
              <label for="bio" class="block text-xs text-zinc-400 mb-1.5">Biografia</label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                bind:value={bio}
                placeholder="Conte um pouco sobre você, sua experiência com dança..."
                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              ></textarea>
              <p class="text-[10px] text-zinc-600 mt-1">Será exibida na página pública da escola.</p>
            </div>

            <!-- Especialidades -->
            <div>
              <label for="especialidades" class="block text-xs text-zinc-400 mb-1.5">Especialidades</label>
              <input
                id="especialidades"
                name="especialidades"
                type="text"
                bind:value={especialidades}
                placeholder="Forró, Samba de Gafieira, Zouk"
                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p class="text-[10px] text-zinc-600 mt-1">Separe por vírgula.</p>
            </div>
          </div>

          <!-- Save -->
          <div class="p-5 border-t border-zinc-800 flex justify-end">
            <button
              type="submit"
              class="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">save</span>
              Salvar Alterações
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Sidebar: preview + stats -->
    <div class="space-y-6">
      <!-- Profile preview -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-purple-400">visibility</span>
            Preview Público
          </h3>
        </div>
        <div class="p-5 text-center">
          <div class="w-20 h-20 mx-auto bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
            {#if data.perfil.imagemUrl}
              <img src={data.perfil.imagemUrl} alt={nome} class="w-full h-full rounded-full object-cover" />
            {:else}
              <span class="material-symbols-outlined text-blue-400 text-[32px]">person</span>
            {/if}
          </div>
          <h4 class="text-base font-semibold text-white">{nome || 'Seu nome'}</h4>
          <p class="text-xs text-zinc-500 mt-1 mb-3">Professor</p>
          {#if bio}
            <p class="text-xs text-zinc-400 mb-3 leading-relaxed">{bio}</p>
          {/if}
          {#if especialidades}
            <div class="flex flex-wrap gap-1.5 justify-center">
              {#each especialidades.split(',').map(s => s.trim()).filter(s => s) as esp}
                <span class="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{esp}</span>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Quick stats -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-teal-400">info</span>
            Informações
          </h3>
        </div>
        <div class="divide-y divide-zinc-800/50">
          <div class="px-5 py-3 flex items-center justify-between">
            <span class="text-xs text-zinc-400">Modalidades</span>
            <span class="text-xs text-white">{data.modalidades.length > 0 ? data.modalidades.join(', ') : '—'}</span>
          </div>
          <div class="px-5 py-3 flex items-center justify-between">
            <span class="text-xs text-zinc-400">Disponibilidades</span>
            <div class="flex items-center gap-2">
              <span class="text-xs text-white">{data.totalDisponibilidades} horário(s)</span>
              <a href="/professor/disponibilidade" class="text-[10px] text-primary hover:underline">Editar</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
