<!-- Pulso — Meu QR Code & Reconhecimento Facial -->
<script lang="ts">
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  let activeTab = $state<'qrcode' | 'facial'>('qrcode');

  // Face registration state
  let faceStatus = $state<'idle' | 'loading' | 'ready' | 'capturing' | 'saving' | 'error'>('idle');
  let faceMessage = $state('');
  let capturedCount = $state(0);
  let descriptors = $state<number[][]>([]);
  let videoEl = $state<HTMLVideoElement | null>(null);
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let faceApi: any = null;
  let stream: MediaStream | null = null;

  const metodoLabels: Record<string, { label: string; icon: string }> = {
    QR_CODE: { label: 'QR Code', icon: 'qr_code_2' },
    MANUAL: { label: 'Manual', icon: 'person' },
    FACIAL: { label: 'Facial', icon: 'face' }
  };

  function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatRelative(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Agora';
    if (mins < 60) return `${mins} min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  }

  async function iniciarRegistroFacial() {
    faceStatus = 'loading';
    faceMessage = 'Carregando modelos de reconhecimento facial...';
    capturedCount = 0;
    descriptors = [];

    try {
      faceApi = await import('@vladmandic/face-api');

      await Promise.all([
        faceApi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceApi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
        faceApi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);

      faceMessage = 'Modelos carregados. Iniciando câmera...';

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 } }
      });

      if (videoEl) {
        videoEl.srcObject = stream;
        await videoEl.play();
      }

      faceStatus = 'ready';
      faceMessage = 'Posicione seu rosto no centro e clique em "Capturar". Capture 3 a 5 fotos em ângulos diferentes.';
    } catch (e) {
      faceStatus = 'error';
      faceMessage = 'Erro ao inicializar. Verifique as permissões da câmera.';
      console.error(e);
    }
  }

  async function capturarRosto() {
    if (!faceApi || !videoEl || !canvasEl) return;
    faceStatus = 'capturing';
    faceMessage = 'Detectando rosto...';

    try {
      const detection = await faceApi
        .detectSingleFace(videoEl, new faceApi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        faceStatus = 'ready';
        faceMessage = 'Nenhum rosto detectado. Certifique-se de que seu rosto está bem iluminado e visível.';
        return;
      }

      // Draw detection on canvas for feedback
      const ctx = canvasEl.getContext('2d');
      if (ctx) {
        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        ctx.drawImage(videoEl, 0, 0);
        const box = detection.detection.box;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      }

      descriptors = [...descriptors, Array.from(detection.descriptor)];
      capturedCount = descriptors.length;
      faceStatus = 'ready';
      faceMessage = `Captura ${capturedCount}/5 realizada! ${capturedCount >= 3 ? 'Você já pode salvar ou capturar mais para maior precisão.' : `Capture mais ${3 - capturedCount} foto(s).`}`;
    } catch (e) {
      faceStatus = 'ready';
      faceMessage = 'Erro ao processar imagem. Tente novamente.';
      console.error(e);
    }
  }

  async function salvarDescritores() {
    if (descriptors.length < 3) return;
    faceStatus = 'saving';
    faceMessage = 'Salvando dados faciais...';

    try {
      const res = await fetch('/api/face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptors })
      });

      const result = await res.json();
      if (result.success) {
        faceMessage = result.message;
        pararCamera();
        faceStatus = 'idle';
        await invalidateAll();
      } else {
        faceStatus = 'ready';
        faceMessage = result.error || 'Erro ao salvar.';
      }
    } catch {
      faceStatus = 'ready';
      faceMessage = 'Erro de conexão ao salvar.';
    }
  }

  async function removerRosto() {
    if (!confirm('Tem certeza que deseja remover seus dados faciais?')) return;

    try {
      const res = await fetch('/api/face', { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        await invalidateAll();
      }
    } catch {
      // ignore
    }
  }

  function pararCamera() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    if (videoEl) videoEl.srcObject = null;
  }

  function resetarCaptura() {
    capturedCount = 0;
    descriptors = [];
    faceMessage = 'Posicione seu rosto no centro e clique em "Capturar". Capture 3 a 5 fotos em ângulos diferentes.';
  }

  $effect(() => {
    return () => pararCamera();
  });
</script>

<svelte:head>
  <title>Check-in — Pulso</title>
</svelte:head>

<div>
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white mb-1">Check-in</h1>
    <p class="text-zinc-500 text-sm">QR Code e reconhecimento facial para entrada na escola</p>
  </div>

  {#if !data.temPlano}
    <div class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-6 flex items-start gap-3">
      <span class="material-symbols-outlined text-amber-400 text-[22px] mt-0.5">warning</span>
      <div>
        <p class="text-sm font-medium text-amber-300">Sem plano ativo</p>
        <p class="text-xs text-amber-400/70 mt-1">Você precisa de um plano ativo para fazer check-in. <a href="/aluno/plano" class="underline hover:text-amber-300">Ver planos</a></p>
      </div>
    </div>
  {/if}

  <!-- Tabs -->
  <div class="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
    <button
      onclick={() => { activeTab = 'qrcode'; pararCamera(); faceStatus = 'idle'; }}
      class="px-4 py-2 rounded-md text-sm font-medium transition-all {activeTab === 'qrcode' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}"
    >
      <span class="material-symbols-outlined text-[16px] align-middle mr-1">qr_code_2</span>
      QR Code
    </button>
    <button
      onclick={() => activeTab = 'facial'}
      class="px-4 py-2 rounded-md text-sm font-medium transition-all {activeTab === 'facial' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}"
    >
      <span class="material-symbols-outlined text-[16px] align-middle mr-1">face</span>
      Reconhecimento Facial
    </button>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Left: QR or Facial -->
    {#if activeTab === 'qrcode'}
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800">
          <h2 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-emerald-400">qr_code_2</span>
            QR Code de Acesso
          </h2>
        </div>
        <div class="p-8 flex flex-col items-center">
          <div class="bg-zinc-800 rounded-2xl p-6 mb-4">
            <!-- svelte-ignore a11y_missing_attribute -->
            <img src="/api/qrcode" width="200" height="200" class="block" />
          </div>
          {#if data.planoNome}
            <p class="text-xs text-zinc-500">
              Plano: <span class="text-emerald-400 font-medium">{data.planoNome}</span>
            </p>
          {/if}
          <p class="text-[10px] text-zinc-600 mt-2 text-center">
            Mostre este QR Code na recepção da escola.
          </p>
        </div>
      </div>

    {:else}
      <!-- Facial Recognition Registration -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-zinc-800">
          <h2 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-blue-400">face</span>
            Cadastro Facial
          </h2>
          {#if data.temRostoCadastrado}
            <p class="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-[12px]">check_circle</span>
              Rosto cadastrado ({data.totalDescritores} amostra(s))
            </p>
          {/if}
        </div>

        <div class="p-5">
          {#if data.temRostoCadastrado && faceStatus === 'idle'}
            <!-- Already registered -->
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-emerald-600/15 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="material-symbols-outlined text-emerald-400 text-3xl">sentiment_satisfied</span>
              </div>
              <p class="text-sm text-white font-medium mb-1">Rosto cadastrado</p>
              <p class="text-xs text-zinc-500 mb-4">Seu reconhecimento facial está ativo. Ao chegar na escola, basta olhar para a câmera da recepção.</p>
              <div class="flex gap-2 justify-center">
                <button
                  onclick={iniciarRegistroFacial}
                  class="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span class="material-symbols-outlined text-[14px]">refresh</span>
                  Recadastrar
                </button>
                <button
                  onclick={removerRosto}
                  class="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-400/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span class="material-symbols-outlined text-[14px]">delete</span>
                  Remover
                </button>
              </div>
            </div>

          {:else if faceStatus === 'idle'}
            <!-- Not registered -->
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="material-symbols-outlined text-zinc-600 text-3xl">face</span>
              </div>
              <p class="text-sm text-white font-medium mb-1">Cadastre seu rosto</p>
              <p class="text-xs text-zinc-500 mb-4">Com o reconhecimento facial, seu check-in será automático ao chegar na escola.</p>
              <button
                onclick={iniciarRegistroFacial}
                class="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mx-auto"
              >
                <span class="material-symbols-outlined text-[18px]">photo_camera</span>
                Iniciar Cadastro
              </button>
              <p class="text-[10px] text-zinc-600 mt-3">Seus dados faciais são armazenados de forma segura e usados apenas para check-in.</p>
            </div>

          {:else if faceStatus === 'loading'}
            <div class="text-center py-8">
              <span class="material-symbols-outlined text-3xl text-blue-400 animate-spin mb-3">progress_activity</span>
              <p class="text-sm text-zinc-400">{faceMessage}</p>
            </div>

          {:else}
            <!-- Camera active -->
            <div class="relative rounded-lg overflow-hidden mb-3">
              <!-- svelte-ignore a11y_media_has_caption -->
              <video bind:this={videoEl} class="w-full rounded-lg bg-black mirror" playsinline style="transform: scaleX(-1);"></video>
              <canvas bind:this={canvasEl} class="hidden"></canvas>
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="w-40 h-48 border-2 border-blue-400/40 rounded-full"></div>
              </div>
              {#if faceStatus === 'capturing' || faceStatus === 'saving'}
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span class="material-symbols-outlined text-white text-3xl animate-spin">progress_activity</span>
                </div>
              {/if}
            </div>

            <!-- Progress -->
            <div class="flex gap-1.5 mb-3">
              {#each Array(5) as _, i}
                <div class="flex-1 h-1.5 rounded-full {i < capturedCount ? 'bg-emerald-500' : 'bg-zinc-800'}"></div>
              {/each}
            </div>

            <p class="text-xs text-zinc-400 mb-4 text-center">{faceMessage}</p>

            <div class="flex gap-2">
              <button
                onclick={capturarRosto}
                disabled={faceStatus !== 'ready' || capturedCount >= 5}
                class="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="material-symbols-outlined text-[16px]">photo_camera</span>
                Capturar ({capturedCount}/5)
              </button>
              {#if capturedCount >= 3}
                <button
                  onclick={salvarDescritores}
                  disabled={faceStatus === 'saving'}
                  class="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-[16px]">save</span>
                  Salvar
                </button>
              {/if}
            </div>

            <div class="flex gap-2 mt-2">
              {#if capturedCount > 0}
                <button onclick={resetarCaptura} class="flex-1 text-xs text-zinc-500 hover:text-white py-1.5 transition-colors">
                  Recomeçar
                </button>
              {/if}
              <button onclick={() => { pararCamera(); faceStatus = 'idle'; }} class="flex-1 text-xs text-red-400/70 hover:text-red-400 py-1.5 transition-colors">
                Cancelar
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Right: Check-in history -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="p-5 border-b border-zinc-800">
        <h2 class="text-sm font-semibold text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-blue-400">history</span>
          Histórico de Check-ins
        </h2>
      </div>
      {#if data.checkins.length === 0}
        <div class="p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-zinc-700 mb-2">door_front</span>
          <p class="text-zinc-500 text-sm">Nenhum check-in registrado.</p>
        </div>
      {:else}
        <div class="divide-y divide-zinc-800/50 max-h-[400px] overflow-y-auto">
          {#each data.checkins as checkin}
            {@const met = metodoLabels[checkin.metodo] ?? metodoLabels.MANUAL}
            <div class="px-5 py-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-emerald-600/15 rounded-lg flex items-center justify-center">
                  <span class="material-symbols-outlined text-emerald-400 text-[16px]">{met.icon}</span>
                </div>
                <div>
                  <p class="text-sm text-white">{formatDateTime(checkin.timestamp)}</p>
                  <p class="text-[10px] text-zinc-500">{met.label}</p>
                </div>
              </div>
              <span class="text-[10px] text-zinc-600">{formatRelative(checkin.timestamp)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
