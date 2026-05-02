<!-- BalancaEu — Meu QR Code & Reconhecimento Facial -->
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

  const metodoLabels: Record<string, string> = {
    QR_CODE: 'QR Code',
    MANUAL: 'Manual',
    FACIAL: 'Facial'
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

      descriptors = [...descriptors, Array.from(detection.descriptor) as number[]];
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
  <title>Check-in — Balança Eu</title>
</svelte:head>

<div class="page-head">
  <h1 class="page-title">Check-<em>in</em></h1>
  <p class="page-sub">QR Code e reconhecimento facial para entrada na escola.</p>
</div>

{#if !data.temPlano}
  <div class="alert" style="margin-bottom: 20px;">
    <div class="alert__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>
    </div>
    <div class="alert__body">
      <strong>Sem plano ativo</strong>
      <p>Você precisa de um plano ativo para fazer check-in. <a href="/aluno/plano">Ver planos</a></p>
    </div>
  </div>
{/if}

<div class="tabs" style="margin-bottom: 20px;">
  <button type="button" class="tab {activeTab === 'qrcode' ? 'is-active' : ''}" onclick={() => { activeTab = 'qrcode'; pararCamera(); faceStatus = 'idle'; }}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v3M14 21h3M21 18v3h-3"/></svg>
    QR Code
  </button>
  <button type="button" class="tab {activeTab === 'facial' ? 'is-active' : ''}" onclick={() => activeTab = 'facial'}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/><path d="M3 3l3 3M21 3l-3 3M3 21l3-3M21 21l-3-3" opacity=".4"/></svg>
    Reconhecimento Facial
  </button>
</div>

<div class="checkin-grid">
  {#if activeTab === 'qrcode'}
    <div class="qr-card">
      <div class="card__title" style="justify-content: center;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v3M14 21h3M21 18v3h-3"/></svg>
        QR Code de Acesso
      </div>
      <div class="qr-frame">
        <!-- svelte-ignore a11y_missing_attribute -->
        <img src="/api/qrcode" width="220" height="220" style="display:block;" />
      </div>
      {#if data.planoNome}
        <div class="qr-hint">Plano: <strong>{data.planoNome}</strong></div>
      {/if}
      <div class="qr-hint">Mostre este QR Code na recepção da escola.</div>
    </div>
  {:else}
    <div class="card" style="background: var(--creme-warm);">
      <div class="card__head">
        <div class="card__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
          Cadastro Facial
        </div>
      </div>

      {#if data.temRostoCadastrado && faceStatus === 'idle'}
        <div class="empty-state">
          <div class="empty-state__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
          </div>
          <p><strong>Rosto cadastrado</strong> ({data.totalDescritores} amostra(s))</p>
          <p style="font-size: 12px; color: var(--ink-mute); margin-top: 6px;">Seu reconhecimento facial está ativo. Ao chegar na escola, basta olhar para a câmera da recepção.</p>
          <div style="display: flex; gap: 8px; justify-content: center; margin-top: 14px;">
            <button type="button" class="btn btn--ghost btn--sm" onclick={iniciarRegistroFacial}>Recadastrar</button>
            <button type="button" class="btn btn--ghost btn--sm" onclick={removerRosto} style="border-color: var(--danger); color: var(--danger);">Remover</button>
          </div>
        </div>
      {:else if faceStatus === 'idle'}
        <div class="empty-state">
          <div class="empty-state__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
          </div>
          <p><strong>Cadastre seu rosto</strong></p>
          <p style="font-size: 12px; color: var(--ink-mute); margin-top: 6px;">Com o reconhecimento facial, seu check-in será automático ao chegar na escola.</p>
          <button type="button" class="btn btn--primary" style="margin-top: 14px;" onclick={iniciarRegistroFacial}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Iniciar Cadastro
          </button>
          <p style="font-size: 11px; color: var(--ink-mute); margin-top: 10px;">Seus dados faciais são armazenados de forma segura e usados apenas para check-in.</p>
        </div>
      {:else if faceStatus === 'loading'}
        <div class="empty-state">
          <p>{faceMessage}</p>
        </div>
      {:else}
        <div style="position: relative; border-radius: 14px; overflow: hidden; margin-bottom: 12px;">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video bind:this={videoEl} style="width: 100%; display: block; background: #000; transform: scaleX(-1);" playsinline></video>
          <canvas bind:this={canvasEl} style="display: none;"></canvas>
          {#if faceStatus === 'capturing' || faceStatus === 'saving'}
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">Processando...</div>
          {/if}
        </div>

        <div style="display: flex; gap: 6px; margin-bottom: 12px;">
          {#each Array(5) as _, i}
            <div style="flex: 1; height: 6px; border-radius: 3px; background: {i < capturedCount ? 'var(--success)' : 'var(--line)'};"></div>
          {/each}
        </div>

        <p style="font-size: 12px; color: var(--ink-soft); text-align: center; margin-bottom: 14px;">{faceMessage}</p>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn--primary btn--full" onclick={capturarRosto} disabled={faceStatus !== 'ready' || capturedCount >= 5}>
            Capturar ({capturedCount}/5)
          </button>
          {#if capturedCount >= 3}
            <button type="button" class="btn btn--coral btn--full" onclick={salvarDescritores} disabled={faceStatus === 'saving'}>
              Salvar
            </button>
          {/if}
        </div>

        <div style="display: flex; gap: 8px; margin-top: 8px;">
          {#if capturedCount > 0}
            <button type="button" class="btn btn--ghost btn--sm btn--full" onclick={resetarCaptura}>Recomeçar</button>
          {/if}
          <button type="button" class="btn btn--ghost btn--sm btn--full" style="border-color: var(--danger); color: var(--danger);" onclick={() => { pararCamera(); faceStatus = 'idle'; }}>
            Cancelar
          </button>
        </div>
      {/if}
    </div>
  {/if}

  <div class="card" style="background: var(--creme-warm);">
    <div class="card__head">
      <div class="card__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        Histórico de Check-ins
      </div>
    </div>
    {#if data.checkins.length === 0}
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        </div>
        <p>Nenhum check-in registrado.</p>
      </div>
    {:else}
      <div class="upcoming__list">
        {#each data.checkins as checkin}
          <div class="upcoming-row">
            <div class="upcoming-info">
              <h4>{formatDateTime(checkin.timestamp)}</h4>
              <p>{metodoLabels[checkin.metodo] ?? checkin.metodo}</p>
            </div>
            <div class="upcoming-time">{formatRelative(checkin.timestamp)}</div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
