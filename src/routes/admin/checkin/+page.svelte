<!-- Pulso — Admin: Check-in (QR + Facial + Manual) -->
<script lang="ts">
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  let activeTab = $state<'camera' | 'facial' | 'manual'>('facial');
  let feedback = $state<{ success?: boolean; message?: string; error?: string } | null>(null);
  let processando = $state(false);
  let buscaManual = $state('');

  // QR state
  let cameraAtiva = $state(false);
  let videoEl = $state<HTMLVideoElement | null>(null);
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let scanInterval = $state<ReturnType<typeof setInterval> | null>(null);
  let ultimoPayload = $state('');

  // Facial state
  let faceVideoEl = $state<HTMLVideoElement | null>(null);
  let faceCanvasEl = $state<HTMLCanvasElement | null>(null);
  let faceStatus = $state<'idle' | 'loading' | 'scanning' | 'matched'>('idle');
  let faceMessage = $state('');
  let faceApi: any = null;
  let faceStream: MediaStream | null = null;
  let faceDb: { userId: string; nome: string; descriptors: Float32Array[] }[] = [];
  let faceScanInterval: ReturnType<typeof setInterval> | null = null;
  let ultimoFaceMatch = $state('');

  const metodoLabels: Record<string, { label: string; icon: string; color: string }> = {
    QR_CODE: { label: 'QR Code', icon: 'qr_code_2', color: 'text-blue-400 bg-blue-400/10' },
    MANUAL: { label: 'Manual', icon: 'person', color: 'text-amber-400 bg-amber-400/10' },
    FACIAL: { label: 'Facial', icon: 'face', color: 'text-purple-400 bg-purple-400/10' }
  };

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // ─── QR Camera ────────────────────────────────────────
  async function iniciarCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoEl) {
        videoEl.srcObject = stream;
        await videoEl.play();
        cameraAtiva = true;
        iniciarScan();
      }
    } catch {
      feedback = { error: 'Não foi possível acessar a câmera.' };
    }
  }

  function pararCamera() {
    if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
    if (videoEl?.srcObject) {
      (videoEl.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoEl.srcObject = null;
    }
    cameraAtiva = false;
  }

  function iniciarScan() {
    if (scanInterval) clearInterval(scanInterval);
    scanInterval = setInterval(async () => {
      if (!videoEl || !canvasEl || processando) return;
      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      ctx.drawImage(videoEl, 0, 0);
      try {
        if ('BarcodeDetector' in window) {
          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await detector.detect(canvasEl);
          if (barcodes.length > 0) {
            const payload = barcodes[0].rawValue;
            if (payload && payload !== ultimoPayload) {
              ultimoPayload = payload;
              await registrarCheckin(payload, 'QR_CODE');
            }
          }
        }
      } catch { /* BarcodeDetector not supported */ }
    }, 500);
  }

  // ─── Facial Recognition ───────────────────────────────
  async function iniciarFacial() {
    faceStatus = 'loading';
    faceMessage = 'Carregando modelos de IA...';

    try {
      faceApi = await import('@vladmandic/face-api');
      await Promise.all([
        faceApi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceApi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
        faceApi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);

      faceMessage = 'Carregando banco de rostos...';
      const res = await fetch('/api/face');
      const { faces } = await res.json();

      if (!faces || faces.length === 0) {
        faceStatus = 'idle';
        faceMessage = 'Nenhum aluno cadastrou reconhecimento facial ainda.';
        return;
      }

      // Build face database with Float32Arrays
      faceDb = faces.map((f: { userId: string; nome: string; descriptors: number[][] }) => ({
        userId: f.userId,
        nome: f.nome,
        descriptors: f.descriptors.map((d: number[]) => new Float32Array(d))
      }));

      faceMessage = `${faceDb.length} aluno(s) no banco. Iniciando câmera...`;

      faceStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      if (faceVideoEl) {
        faceVideoEl.srcObject = faceStream;
        await faceVideoEl.play();
      }

      faceStatus = 'scanning';
      faceMessage = `Escaneando... (${faceDb.length} aluno(s) cadastrado(s))`;
      iniciarScanFacial();
    } catch (e) {
      faceStatus = 'idle';
      faceMessage = 'Erro ao inicializar reconhecimento facial.';
      console.error(e);
    }
  }

  function pararFacial() {
    if (faceScanInterval) { clearInterval(faceScanInterval); faceScanInterval = null; }
    if (faceStream) { faceStream.getTracks().forEach(t => t.stop()); faceStream = null; }
    if (faceVideoEl) faceVideoEl.srcObject = null;
    faceStatus = 'idle';
    faceMessage = '';
  }

  function iniciarScanFacial() {
    if (faceScanInterval) clearInterval(faceScanInterval);

    faceScanInterval = setInterval(async () => {
      if (!faceVideoEl || !faceCanvasEl || !faceApi || processando) return;
      if (faceVideoEl.videoWidth === 0) return;

      try {
        const detection = await faceApi
          .detectSingleFace(faceVideoEl, new faceApi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        // Draw overlay
        const ctx = faceCanvasEl.getContext('2d');
        if (ctx) {
          faceCanvasEl.width = faceVideoEl.videoWidth;
          faceCanvasEl.height = faceVideoEl.videoHeight;
          ctx.clearRect(0, 0, faceCanvasEl.width, faceCanvasEl.height);

          if (detection) {
            const box = detection.detection.box;
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // Match against database
            let bestMatch: { userId: string; nome: string; distance: number } | null = null;

            for (const entry of faceDb) {
              for (const stored of entry.descriptors) {
                const distance = faceApi.euclideanDistance(detection.descriptor, stored);
                if (distance < 0.5 && (!bestMatch || distance < bestMatch.distance)) {
                  bestMatch = { userId: entry.userId, nome: entry.nome, distance };
                }
              }
            }

            if (bestMatch && bestMatch.userId !== ultimoFaceMatch) {
              ultimoFaceMatch = bestMatch.userId;
              // Draw green box for match
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 4;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
              ctx.fillStyle = '#10b981';
              ctx.font = 'bold 16px sans-serif';
              ctx.fillText(bestMatch.nome, box.x + 4, box.y - 8);

              await registrarCheckin(`pulso:_:${bestMatch.userId}`, 'FACIAL');

              // Reset after cooldown
              setTimeout(() => { ultimoFaceMatch = ''; }, 8000);
            }
          }
        }
      } catch {
        // Detection frame error, continue
      }
    }, 800);
  }

  // ─── Shared ───────────────────────────────────────────
  async function registrarCheckin(payload: string, metodo: string) {
    if (processando) return;
    processando = true;
    feedback = null;

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, metodo })
      });
      const result = await res.json();
      if (result.success) {
        feedback = { success: true, message: result.message };
        await invalidateAll();
      } else {
        feedback = { error: result.error };
      }
    } catch {
      feedback = { error: 'Erro ao processar check-in.' };
    } finally {
      processando = false;
      setTimeout(() => { ultimoPayload = ''; }, 5000);
    }
  }

  async function checkinManual(userId: string) {
    if (processando) return;
    processando = true;
    feedback = null;
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: `pulso:_:${userId}`, metodo: 'MANUAL' })
      });
      const result = await res.json();
      if (result.success) {
        feedback = { success: true, message: result.message };
        buscaManual = '';
        await invalidateAll();
      } else {
        feedback = { error: result.error };
      }
    } catch {
      feedback = { error: 'Erro ao processar check-in.' };
    } finally {
      processando = false;
    }
  }

  let alunosFiltrados = $derived(
    buscaManual.length >= 2
      ? data.alunos.filter((a: { id: string; nome: string; email: string }) =>
          a.nome.toLowerCase().includes(buscaManual.toLowerCase()) ||
          a.email.toLowerCase().includes(buscaManual.toLowerCase())
        ).slice(0, 10)
      : []
  );

  function pararTudo() {
    pararCamera();
    pararFacial();
  }

  $effect(() => {
    return () => pararTudo();
  });
</script>

<svelte:head>
  <title>Check-in — Admin — Pulso</title>
</svelte:head>

<div>
  <div class="flex items-start justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Check-in</h1>
      <p class="text-zinc-500 text-sm">Registre a entrada dos alunos na escola</p>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
      <span class="text-xs text-zinc-400">Hoje: </span>
      <span class="text-sm font-bold text-white">{data.checkinsHoje.length}</span>
      <span class="text-xs text-zinc-500"> check-in(s)</span>
    </div>
  </div>

  <!-- Feedback -->
  {#if feedback?.success}
    <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-4 py-3 mb-6 text-sm animate-pulse">
      <span class="material-symbols-outlined text-[18px]">check_circle</span>
      {feedback.message}
    </div>
  {/if}
  {#if feedback?.error}
    <div class="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
      <span class="material-symbols-outlined text-[18px]">error</span>
      {feedback.error}
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Left: Scanner -->
    <div>
      <!-- Tabs -->
      <div class="flex gap-1 mb-4 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        <button
          onclick={() => { pararTudo(); activeTab = 'facial'; }}
          class="px-3 py-2 rounded-md text-sm font-medium transition-all {activeTab === 'facial' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'}"
        >
          <span class="material-symbols-outlined text-[16px] align-middle mr-1">face</span>
          Facial
        </button>
        <button
          onclick={() => { pararTudo(); activeTab = 'camera'; }}
          class="px-3 py-2 rounded-md text-sm font-medium transition-all {activeTab === 'camera' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'}"
        >
          <span class="material-symbols-outlined text-[16px] align-middle mr-1">qr_code_scanner</span>
          QR Code
        </button>
        <button
          onclick={() => { pararTudo(); activeTab = 'manual'; }}
          class="px-3 py-2 rounded-md text-sm font-medium transition-all {activeTab === 'manual' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'}"
        >
          <span class="material-symbols-outlined text-[16px] align-middle mr-1">search</span>
          Manual
        </button>
      </div>

      <!-- FACIAL TAB -->
      {#if activeTab === 'facial'}
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div class="p-5 border-b border-zinc-800">
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-purple-400">face</span>
              Reconhecimento Facial
            </h2>
          </div>
          <div class="p-5">
            {#if faceStatus === 'idle'}
              <div class="flex flex-col items-center py-8">
                <div class="w-20 h-20 bg-purple-600/15 rounded-2xl flex items-center justify-center mb-4">
                  <span class="material-symbols-outlined text-4xl text-purple-400">face</span>
                </div>
                <p class="text-zinc-500 text-sm mb-1 text-center">Check-in automático por reconhecimento facial</p>
                {#if faceMessage}
                  <p class="text-xs text-amber-400 mb-3 text-center">{faceMessage}</p>
                {/if}
                <button
                  onclick={iniciarFacial}
                  class="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  <span class="material-symbols-outlined text-[18px]">videocam</span>
                  Iniciar Reconhecimento
                </button>
                <p class="text-[10px] text-zinc-600 mt-3 text-center">
                  Os alunos precisam ter cadastrado seu rosto na área do aluno.
                </p>
              </div>

            {:else if faceStatus === 'loading'}
              <div class="text-center py-8">
                <span class="material-symbols-outlined text-3xl text-purple-400 animate-spin mb-3">progress_activity</span>
                <p class="text-sm text-zinc-400">{faceMessage}</p>
              </div>

            {:else}
              <!-- Scanning -->
              <div class="relative rounded-lg overflow-hidden mb-3">
                <!-- svelte-ignore a11y_media_has_caption -->
                <video bind:this={faceVideoEl} class="w-full rounded-lg bg-black" playsinline style="transform: scaleX(-1);"></video>
                <canvas bind:this={faceCanvasEl} class="absolute inset-0 w-full h-full pointer-events-none" style="transform: scaleX(-1);"></canvas>
                {#if processando}
                  <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span class="material-symbols-outlined text-white text-3xl animate-spin">progress_activity</span>
                  </div>
                {/if}
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-zinc-400 flex items-center gap-1.5">
                  <span class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  {faceMessage}
                </p>
                <button
                  onclick={pararFacial}
                  class="flex items-center gap-2 text-xs text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <span class="material-symbols-outlined text-[14px]">videocam_off</span>
                  Parar
                </button>
              </div>
            {/if}
          </div>
        </div>

      <!-- QR TAB -->
      {:else if activeTab === 'camera'}
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div class="p-5 border-b border-zinc-800">
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-blue-400">qr_code_scanner</span>
              Leitor de QR Code
            </h2>
          </div>
          <div class="p-5">
            {#if !cameraAtiva}
              <div class="flex flex-col items-center py-8">
                <div class="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                  <span class="material-symbols-outlined text-4xl text-zinc-600">qr_code_scanner</span>
                </div>
                <p class="text-zinc-500 text-sm mb-4 text-center">Ative a câmera para ler o QR Code do aluno</p>
                <button
                  onclick={iniciarCamera}
                  class="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <span class="material-symbols-outlined text-[18px]">videocam</span>
                  Ativar Câmera
                </button>
              </div>
            {:else}
              <div class="relative rounded-lg overflow-hidden mb-3">
                <!-- svelte-ignore a11y_media_has_caption -->
                <video bind:this={videoEl} class="w-full rounded-lg bg-black" playsinline></video>
                <canvas bind:this={canvasEl} class="hidden"></canvas>
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="w-48 h-48 border-2 border-emerald-400/50 rounded-2xl"></div>
                </div>
                {#if processando}
                  <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span class="material-symbols-outlined text-white text-3xl animate-spin">progress_activity</span>
                  </div>
                {/if}
              </div>
              <button onclick={pararCamera} class="flex items-center gap-2 text-xs text-zinc-500 hover:text-red-400 transition-colors">
                <span class="material-symbols-outlined text-[14px]">videocam_off</span>
                Parar câmera
              </button>
            {/if}
          </div>
        </div>

      <!-- MANUAL TAB -->
      {:else}
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div class="p-5 border-b border-zinc-800">
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-amber-400">person_search</span>
              Check-in Manual
            </h2>
          </div>
          <div class="p-5">
            <div class="mb-4">
              <label for="busca-aluno" class="block text-xs text-zinc-400 mb-1.5">Buscar aluno por nome ou email</label>
              <input
                id="busca-aluno"
                type="text"
                bind:value={buscaManual}
                placeholder="Digite pelo menos 2 caracteres..."
                class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary"
              />
            </div>

            {#if alunosFiltrados.length > 0}
              <div class="space-y-1.5 max-h-[300px] overflow-y-auto">
                {#each alunosFiltrados as aluno}
                  <button
                    onclick={() => checkinManual(aluno.id)}
                    disabled={processando}
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left disabled:opacity-50"
                  >
                    <div class="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined text-zinc-400 text-[14px]">person</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-white truncate">{aluno.nome}</p>
                      <p class="text-[10px] text-zinc-500 truncate">{aluno.email}</p>
                    </div>
                    <span class="material-symbols-outlined text-emerald-400 text-[18px]">login</span>
                  </button>
                {/each}
              </div>
            {:else if buscaManual.length >= 2}
              <p class="text-zinc-500 text-sm text-center py-4">Nenhum aluno encontrado.</p>
            {:else}
              <p class="text-zinc-600 text-xs text-center py-4">Digite o nome ou email do aluno para buscar.</p>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Right: Today's check-ins -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="p-5 border-b border-zinc-800">
        <h2 class="text-sm font-semibold text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-emerald-400">list</span>
          Check-ins de Hoje
          <span class="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full ml-auto">{data.checkinsHoje.length}</span>
        </h2>
      </div>
      {#if data.checkinsHoje.length === 0}
        <div class="p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-zinc-700 mb-2">door_front</span>
          <p class="text-zinc-500 text-sm">Nenhum check-in registrado hoje.</p>
        </div>
      {:else}
        <div class="divide-y divide-zinc-800/50 max-h-[500px] overflow-y-auto">
          {#each data.checkinsHoje as checkin}
            {@const met = metodoLabels[checkin.metodo] ?? metodoLabels.MANUAL}
            <div class="px-5 py-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-emerald-600/15 rounded-full flex items-center justify-center">
                  <span class="material-symbols-outlined text-emerald-400 text-[14px]">check</span>
                </div>
                <div>
                  <p class="text-sm text-white">{checkin.aluno}</p>
                  <p class="text-[10px] text-zinc-500">{checkin.email}</p>
                </div>
              </div>
              <div class="text-right flex items-center gap-2">
                <span class="text-[10px] font-medium px-1.5 py-0.5 rounded {met.color}">{met.label}</span>
                <span class="text-xs text-zinc-400">{formatTime(checkin.timestamp)}</span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
