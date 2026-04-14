<!-- BalancaEu — Perfil do Aluno -->
<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
</script>

<svelte:head>
  <title>Meu Perfil — BalancaEu</title>
</svelte:head>

<div>
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white mb-1">Meu Perfil</h1>
    <p class="text-zinc-500 text-sm">Gerencie seus dados pessoais e senha</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Dados Pessoais -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="p-5 border-b border-zinc-800">
        <h2 class="text-base font-semibold text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-emerald-400">person</span>
          Dados Pessoais
        </h2>
      </div>
      <form method="POST" action="?/update" use:enhance class="p-5 space-y-4">
        {#if form?.success}
          <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-4 py-3 text-sm">
            <span class="material-symbols-outlined text-[18px]">check_circle</span>
            {form.success}
          </div>
        {/if}
        {#if form?.error && !form?.senhaError}
          <div class="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
            <span class="material-symbols-outlined text-[18px]">error</span>
            {form.error}
          </div>
        {/if}

        <div>
          <label for="perfil-nome" class="block text-xs text-zinc-400 mb-1.5">Nome completo</label>
          <input
            id="perfil-nome"
            name="nome"
            type="text"
            required
            value={data.perfil.nome}
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label for="perfil-email" class="block text-xs text-zinc-400 mb-1.5">Email</label>
          <input
            id="perfil-email"
            name="email"
            type="email"
            required
            value={data.perfil.email}
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="perfil-telefone" class="block text-xs text-zinc-400 mb-1.5">Telefone</label>
            <input
              id="perfil-telefone"
              name="telefone"
              type="text"
              value={data.perfil.telefone ?? ''}
              placeholder="(11) 99999-9999"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label for="perfil-datanasc" class="block text-xs text-zinc-400 mb-1.5">Data de nascimento</label>
            <input
              id="perfil-datanasc"
              name="dataNasc"
              type="date"
              value={data.perfil.dataNasc}
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div class="pt-2">
          <button type="submit" class="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            Salvar alterações
          </button>
        </div>
      </form>
    </div>

    <!-- Alterar Senha -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="p-5 border-b border-zinc-800">
        <h2 class="text-base font-semibold text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-amber-400">lock</span>
          Alterar Senha
        </h2>
      </div>
      <form method="POST" action="?/senha" use:enhance class="p-5 space-y-4">
        {#if form?.senhaSuccess}
          <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-4 py-3 text-sm">
            <span class="material-symbols-outlined text-[18px]">check_circle</span>
            {form.senhaSuccess}
          </div>
        {/if}
        {#if form?.senhaError}
          <div class="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
            <span class="material-symbols-outlined text-[18px]">error</span>
            {form.senhaError}
          </div>
        {/if}

        <div>
          <label for="senha-atual" class="block text-xs text-zinc-400 mb-1.5">Senha atual</label>
          <input
            id="senha-atual"
            name="senhaAtual"
            type="password"
            required
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label for="senha-nova" class="block text-xs text-zinc-400 mb-1.5">Nova senha</label>
          <input
            id="senha-nova"
            name="novaSenha"
            type="password"
            required
            minlength="6"
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          />
          <p class="text-[10px] text-zinc-600 mt-1">Mínimo de 6 caracteres</p>
        </div>

        <div>
          <label for="senha-confirmar" class="block text-xs text-zinc-400 mb-1.5">Confirmar nova senha</label>
          <input
            id="senha-confirmar"
            name="confirmarSenha"
            type="password"
            required
            minlength="6"
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div class="pt-2">
          <button type="submit" class="bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
            Alterar senha
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Account Info -->
  <div class="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
    <h3 class="text-sm font-medium text-zinc-400 mb-3">Informações da conta</h3>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
      <div>
        <span class="text-zinc-600 text-xs">Membro desde</span>
        <p class="text-zinc-300">{new Date(data.perfil.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div>
        <span class="text-zinc-600 text-xs">Email</span>
        <p class="text-zinc-300">{data.perfil.email}</p>
      </div>
      <div>
        <span class="text-zinc-600 text-xs">Status</span>
        <p class="text-emerald-400 flex items-center gap-1">
          <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
          Ativo
        </p>
      </div>
    </div>
  </div>
</div>
