<!-- BalancaEu — Admin: Check-in (QR + Facial + Manual) -->
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
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 4;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
              ctx.fillStyle = '#10b981';
              ctx.font = 'bold 16px sans-serif';
              ctx.fillText(bestMatch.nome, box.x + 4, box.y - 8);

              await registrarCheckin(`pulso:_:${bestMatch.userId}`, 'FACIAL');

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

  function setTab(tab: 'camera' | 'facial' | 'manual') {
    pararTudo();
    activeTab = tab;
  }

  $effect(() => {
    return () => pararTudo();
  });
</script>

<svelte:head>
  <title>Check-in — Admin · Balança Eu</title>
</svelte:head>

<div class="page-head">
  <div>
    <h1 class="page-title">Check-<em>in</em></h1>
    <p class="page-sub">Registre a entrada dos alunos na escola</p>
  </div>
  <div style="font-size:12px; color:var(--text-mute); background:var(--surface); border:1px solid var(--line); padding:10px 14px; border-radius:10px;">
    Hoje: <strong style="color:var(--coral);">{data.checkinsHoje.length}</strong> check-in(s)
  </div>
</div>

{#if feedback?.success}
  <div class="card" style="border-color: var(--success); margin-bottom: 16px;">
    <p style="color: var(--success); font-size: 13px;">✓ {feedback.message}</p>
  </div>
{/if}
{#if feedback?.error}
  <div class="card" style="border-color: var(--danger); margin-bottom: 16px;">
    <p style="color: var(--danger); font-size: 13px;">✗ {feedback.error}</p>
  </div>
{/if}

<div style="display:flex; justify-content: space-between; align-items:center; gap:20px; margin-bottom:18px;">
  <div class="tabs">
    <button class="tab {activeTab === 'facial' ? 'is-active-plum' : ''}" onclick={() => setTab('facial')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
      Facial
    </button>
    <button class="tab {activeTab === 'camera' ? 'is-active' : ''}" onclick={() => setTab('camera')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      QR Code
    </button>
    <button class="tab {activeTab === 'manual' ? 'is-active' : ''}" onclick={() => setTab('manual')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      Manual
    </button>
  </div>
</div>

<div class="two-col two-col--3-2" style="margin-top:0;">
  <div class="card">
    {#if activeTab === 'facial'}
      <div class="card__head">
        <div class="card__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="plum"><circle cx="12" cy="9" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
          Reconhecimento Facial
        </div>
      </div>
      {#if faceStatus === 'idle'}
        <div class="checkin-visual">
          <div class="checkin-visual__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="4"/><path d="M4 22c0-4 4-7 8-7s8 3 8 7"/><path d="M3 3h3v3M21 3h-3v3M3 21h3v-3M21 21h-3v-3"/></svg>
          </div>
          <p>Check-in automático por reconhecimento facial</p>
          {#if faceMessage}
            <p style="color: var(--warning); font-size: 12px; margin-top: 6px;">{faceMessage}</p>
          {/if}
          <button class="btn btn--plum" onclick={iniciarFacial}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Iniciar Reconhecimento
          </button>
          <div style="margin-top:14px; font-size:11px; color:var(--text-mute);">Os alunos precisam ter cadastrado seu rosto na área do aluno.</div>
        </div>
      {:else if faceStatus === 'loading'}
        <div class="checkin-visual">
          <p>{faceMessage}</p>
        </div>
      {:else}
        <div style="position:relative; padding: 14px;">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video bind:this={faceVideoEl} style="width:100%; border-radius:10px; background:#000; transform: scaleX(-1);" playsinline></video>
          <canvas bind:this={faceCanvasEl} style="position:absolute; inset:14px; width:calc(100% - 28px); pointer-events:none; transform: scaleX(-1);"></canvas>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 0 14px 14px; font-size:12px; color: var(--text-mute);">
          <span>● {faceMessage}</span>
          <button class="btn btn--ghost btn--sm" onclick={pararFacial}>Parar</button>
        </div>
      {/if}

    {:else if activeTab === 'camera'}
      <div class="card__head">
        <div class="card__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="blue"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Leitor de QR Code
        </div>
      </div>
      {#if !cameraAtiva}
        <div class="checkin-visual">
          <div class="checkin-visual__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v3M14 21h3M21 18v3h-3"/></svg>
          </div>
          <p>Ative a câmera para ler o QR Code do aluno</p>
          <button class="btn btn--primary" onclick={iniciarCamera}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            Ativar Câmera
          </button>
        </div>
      {:else}
        <div style="position:relative; padding: 14px;">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video bind:this={videoEl} style="width:100%; border-radius:10px; background:#000;" playsinline></video>
          <canvas bind:this={canvasEl} style="display:none;"></canvas>
        </div>
        <div style="padding: 0 14px 14px;">
          <button class="btn btn--ghost btn--sm" onclick={pararCamera}>Parar câmera</button>
        </div>
      {/if}

    {:else}
      <div class="card__head">
        <div class="card__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ocre"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          Check-in Manual
        </div>
      </div>
      <div style="padding: 14px;">
        <div class="field">
          <label for="busca-aluno">Buscar aluno por nome ou email</label>
          <input id="busca-aluno" type="text" bind:value={buscaManual} placeholder="Digite pelo menos 2 caracteres..." />
        </div>

        {#if alunosFiltrados.length > 0}
          <div style="margin-top:10px; display:flex; flex-direction:column; gap:6px; max-height:300px; overflow-y:auto;">
            {#each alunosFiltrados as aluno}
              <button onclick={() => checkinManual(aluno.id)} disabled={processando}
                style="display:flex; align-items:center; gap:10px; padding:10px 12px; background:var(--surface); border:1px solid var(--line); border-radius:10px; cursor:pointer; text-align:left; color:var(--text);"
              >
                <div class="dot">{aluno.nome[0]}</div>
                <div style="flex:1; min-width:0;">
                  <div style="font-size:13px;">{aluno.nome}</div>
                  <div class="muted" style="font-size:11px;">{aluno.email}</div>
                </div>
                <span style="color: var(--success);">→</span>
              </button>
            {/each}
          </div>
        {:else if buscaManual.length >= 2}
          <p class="muted" style="text-align:center; padding:20px; font-size:12px;">Nenhum aluno encontrado.</p>
        {:else}
          <p class="muted" style="text-align:center; padding:20px; font-size:12px;">Digite o nome ou email do aluno para buscar.</p>
        {/if}
      </div>
    {/if}
  </div>

  <div class="card">
    <div class="card__head">
      <div class="card__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="coral"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
        Check-ins de Hoje
      </div>
      <div style="font-size:11px; color:var(--text-mute);">{data.checkinsHoje.length}</div>
    </div>
    {#if data.checkinsHoje.length === 0}
      <div class="empty" style="background:transparent; border:0; padding:40px 20px;">
        <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div>
        <p>Nenhum check-in registrado hoje.</p>
      </div>
    {:else}
      <div style="max-height:500px; overflow-y:auto;">
        {#each data.checkinsHoje as checkin}
          <div style="padding:10px 14px; display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--line);">
            <div class="dot" style="background:rgba(95,194,144,0.15); color: var(--success);">✓</div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:13px;">{checkin.aluno}</div>
              <div class="muted" style="font-size:11px;">{checkin.email}</div>
            </div>
            <div style="text-align:right;">
              <span class="badge" style="font-size:10px;">{checkin.metodo}</span>
              <div class="muted" style="font-size:11px; margin-top:2px;">{formatTime(checkin.timestamp)}</div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
