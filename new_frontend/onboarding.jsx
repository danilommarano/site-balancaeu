const MODULES = [
  { id: "forro-pd", num: "01", label: "Tradição", title: "Forró Pé Descalço", desc: "Método próprio de graduações — do Azul Iniciante à Preta Avançada.", meta: ["3x/sem", "Graduado"] },
  { id: "forro-roots", num: "02", label: "Raiz", title: "Forró Roots", desc: "Forró nordestino tradicional. Passo marcado, giros e caminhadas.", meta: ["2x/sem", "Aberto"] },
  { id: "samba", num: "03", label: "Elegância", title: "Samba de Gafieira", desc: "O samba dos salões cariocas. Técnica, musicalidade e conexão em dupla.", meta: ["3x/sem", "Níveis"] },
  { id: "zumba", num: "04", label: "Energia", title: "Zumba", desc: "Fitness com ritmos latinos para suar, extravasar e sorrir de verdade.", meta: ["2x/sem", "Livre"] },
];

const HORARIOS = {
  "Segunda": [
    { time: "19:30", slots: [null, null, { mod: "samba", title: "Samba de Gafieira", level: "Iniciante", prof: "Ani Gâlíoti" }] },
    { time: "20:30", slots: [null, null, { mod: "samba", title: "Samba de Gafieira", level: "Intermediário", prof: "Renato Almeida" }] },
  ],
  "Terça": [
    { time: "19:30", slots: [{ mod: "forro-pd", title: "Forró Pé Descalço", level: "Azul", prof: "Equipe PD" }, null, { mod: "forro-roots", title: "Forró Roots", level: "Iniciante", prof: "Danilo Marano" }] },
    { time: "20:30", slots: [{ mod: "forro-pd", title: "Forró Pé Descalço", level: "Branca", prof: "Equipe PD" }, { mod: "zumba", title: "Zumba", level: "Open", prof: "Mari" }, null] },
  ],
  "Quarta": [
    { time: "19:00", slots: [{ mod: "zumba", title: "Zumba", level: "Open", prof: "Mari" }, null, null] },
    { time: "20:00", slots: [null, { mod: "samba", title: "Samba de Gafieira", level: "Avançado", prof: "Ani Gâlíoti" }, { mod: "forro-roots", title: "Forró Roots", level: "Intermediário", prof: "Danilo Marano" }] },
  ],
  "Quinta": [
    { time: "19:30", slots: [{ mod: "forro-pd", title: "Forró Pé Descalço", level: "Azul", prof: "Equipe PD" }, null, { mod: "forro-roots", title: "Forró Roots", level: "Footwork", prof: "Mari Meireles" }] },
    { time: "20:30", slots: [{ mod: "forro-pd", title: "Forró Pé Descalço", level: "Preta", prof: "Equipe PD" }, { mod: "samba", title: "Samba de Gafieira", level: "Intermediário", prof: "Renato Almeida" }, null] },
  ],
  "Sexta": [
    { time: "19:00", slots: [null, { mod: "zumba", title: "Zumba", level: "Open", prof: "Mari" }, null] },
  ],
  "Sábado": [
    { time: "10:00", slots: [{ mod: "forro-roots", title: "Workshop Forró", level: "Aberto", prof: "Danilo Marano" }, null, null] },
    { time: "15:00", slots: [null, { mod: "samba", title: "Masterclass Samba", level: "Intermediário+", prof: "Ani Gâlíoti" }, null] },
  ],
};
const DIAS_OB = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const ENCOURAGE = {
  0: "",
  1: "Bom começo. Um ritmo já é um mundo. 💃",
  2: "Dois ritmos — seu corpo vai agradecer.",
  3: "Três? Você veio mesmo pra dançar. ",
  4: "Tudo! Bem-vinda(o) à casa por inteiro. 🔥",
};

/* ----- Step 1 ----- */
function StepModules({ selected, toggle }) {
  return (
    <div className="ob-screen">
      <div className="ob-screen__eyebrow">Passo 1 de 3</div>
      <h1 className="ob-screen__title">Quais <em>módulos</em> fazem seu corpo pulsar?</h1>
      <p className="ob-screen__sub">Pode escolher quantos quiser — cada um vira uma trilha dentro da sua conta, com sua própria graduação e ritmo.</p>

      <div className="ob-mods">
        {MODULES.map((m) => {
          const isSel = selected.includes(m.id);
          return (
            <div key={m.id} className={"ob-mod" + (isSel ? " is-selected" : "")} onClick={() => toggle(m.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(m.id); } }}>
              <div className="ob-mod__bg"></div>
              <div className="ob-mod__shade"></div>
              <span className="ob-mod__num">{m.num}</span>
              <div className="ob-mod__check">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
              </div>
              <div className="ob-mod__content">
                <span className="ob-mod__label">{m.label}</span>
                <h3 className="ob-mod__title">{m.title}</h3>
                <p className="ob-mod__desc">{m.desc}</p>
                <div className="ob-mod__meta">
                  {m.meta.map((x, i) => <span key={i}>· {x}</span>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="ob-encourage" aria-live="polite">
        {selected.length > 0 && <span className="ob-encourage__kiss">{ENCOURAGE[selected.length] || ENCOURAGE[4]}</span>}
      </div>
    </div>
  );
}

/* ----- Step 2 ----- */
function StepSchedule({ selected, schedules, setSchedule }) {
  const [activeMod, setActiveMod] = React.useState(selected[0]);
  const [dia, setDia] = React.useState("Terça");

  React.useEffect(() => {
    if (!selected.includes(activeMod)) setActiveMod(selected[0]);
  }, [selected]);

  const modMeta = MODULES.find((m) => m.id === activeMod);
  const linhas = HORARIOS[dia] || [];
  const picked = schedules[activeMod];

  // disable days where this module has no classes
  const dayHas = (d) => (HORARIOS[d] || []).some((r) => r.slots.some((s) => s && s.mod === activeMod));

  return (
    <div className="ob-screen">
      <div className="ob-screen__eyebrow">Passo 2 de 3</div>
      <h1 className="ob-screen__title">Agende seu <em>nivelamento</em></h1>
      <p className="ob-screen__sub">Escolha um horário de nivelamento para cada módulo. Um mestre avalia seu ponto de partida.</p>

      <div className="ob-info-banner">
        <div className="ob-info-banner__icon">!</div>
        <p>Essa é <strong>apenas a aula de nivelamento</strong> — o professor vai avaliar você. Depois, você pode ser alocado(a) em outra turma com outro horário. E se não se adaptar, tem direito a uma <strong>aula experimental gratuita</strong>.</p>
      </div>

      <div className="ob-sched">
        <div className="ob-mod-tabs">
          {selected.map((id) => {
            const m = MODULES.find((x) => x.id === id);
            const done = !!schedules[id];
            return (
              <button key={id} className={"ob-mod-tab" + (id === activeMod ? " is-active" : "") + (done ? " is-done" : "")} onClick={() => setActiveMod(id)}>
                <span className="ob-mod-tab__status"></span>
                {m.title}
                {done && <span style={{ fontSize: 10, opacity: 0.8 }}>✓</span>}
              </button>
            );
          })}
        </div>

        <div className="ob-days">
          {DIAS_OB.map((d) => (
            <button key={d} className={"ob-day" + (d === dia ? " is-active" : "")} disabled={!dayHas(d)} onClick={() => setDia(d)}>{d.slice(0, 3)}</button>
          ))}
        </div>

        <div className="ob-grid">
          <div className="ob-grid__head">
            <div>Horário</div><div>Sala 1</div><div>Sala 2</div><div>Sala 3</div>
          </div>
          {linhas.map((linha, i) => (
            <div className="ob-grid__row" key={i}>
              <div className="ob-grid__time">{linha.time}</div>
              {linha.slots.map((slot, j) => {
                if (!slot) return <div key={j} className="ob-slot ob-slot--empty">—</div>;
                const matches = slot.mod === activeMod;
                const isPicked = picked && picked.dia === dia && picked.time === linha.time && picked.sala === j;
                return (
                  <button
                    key={j}
                    className={"ob-slot " + (matches ? "ob-slot--match" : "ob-slot--wrong") + (isPicked ? " is-picked" : "")}
                    data-sala={`Sala ${j + 1}`}
                    onClick={() => { if (matches) setSchedule(activeMod, { dia, time: linha.time, sala: j, slot }); }}
                    disabled={!matches}
                  >
                    <div className="ob-slot__check">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
                    </div>
                    <div className="ob-slot__title">{slot.title}</div>
                    <div className="ob-slot__meta">{slot.level} · {slot.prof}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----- Step 3 ----- */
function StepAccount({ selected, schedules, onSubmit, form, setForm }) {
  return (
    <div className="ob-screen">
      <div className="ob-screen__eyebrow">Passo 3 de 3</div>
      <h1 className="ob-screen__title">Crie sua <em>conta</em></h1>
      <p className="ob-screen__sub">Último passo — seus nivelamentos já estão reservados.</p>

      <div className="ob-account">
        <form className="ob-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="ob-field">
            <label>Nome completo</label>
            <input type="text" placeholder="Como devemos te chamar?" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="ob-field">
            <label>E-mail</label>
            <input type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="ob-field">
            <label>Celular (WhatsApp)</label>
            <input type="tel" placeholder="(11) 90000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="ob-field ob-field--row">
            <div>
              <label>Senha</label>
              <input type="password" placeholder="mínimo 8 caracteres" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} required />
            </div>
            <div>
              <label>Confirmar</label>
              <input type="password" placeholder="repita a senha" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn btn--primary ob-form__submit">
            Finalizar e reservar nivelamentos <Arrow />
          </button>
          <p className="ob-form__login">Já tem conta? <a href="#login">Fazer login</a></p>
        </form>

        <aside className="ob-summary">
          <h3>Seu resumo</h3>
          <div className="ob-summary__list">
            {selected.map((id) => {
              const m = MODULES.find((x) => x.id === id);
              const s = schedules[id];
              return (
                <div className="ob-summary-item" key={id}>
                  <h4>Nivelamento</h4>
                  <div className="ob-summary-item__mod">{m.title}</div>
                  {s ? (
                    <div className="ob-summary-item__sched">
                      <span>📅 {s.dia.slice(0,3)}</span>
                      <span>🕐 {s.time}</span>
                      <span>Sala {s.sala + 1}</span>
                    </div>
                  ) : (
                    <div className="ob-summary-item__sched" style={{ color: "var(--ink-mute)" }}>Sem horário</div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ----- Success ----- */
function StepSuccess({ name, selected, schedules }) {
  React.useEffect(() => {
    const emojis = ["✨", "💃", "🎉", "🌟", "🪩", "🎶"];
    const timers = [];
    for (let i = 0; i < 50; i++) {
      const t = setTimeout(() => {
        const el = document.createElement("div");
        el.className = "confetti";
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = Math.random() * 100 + "vw";
        el.style.animationDuration = 2 + Math.random() * 2 + "s";
        el.style.fontSize = 18 + Math.random() * 14 + "px";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4500);
      }, i * 50);
      timers.push(t);
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  const firstName = (name || "").split(" ")[0] || "você";
  return (
    <div className="ob-success">
      <div className="ob-success__badge">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
      </div>
      <h1 className="ob-success__title">Pronto, {firstName}. <em>A casa te espera.</em></h1>
      <p className="ob-success__sub">
        Enviamos os detalhes dos seus nivelamentos no e-mail e WhatsApp. A partir de agora, tudo o que você precisa está no portal do aluno.
      </p>
      <div className="ob-success__actions">
        <a href="#portal" className="btn btn--primary">Entrar no portal <Arrow /></a>
        <a href="Landing.html" className="btn btn--outline">Voltar para o site</a>
      </div>
    </div>
  );
}

/* ----- Root ----- */
function Onboarding() {
  const [step, setStep] = React.useState(0); // 0,1,2 = steps, 3 = success
  const [selected, setSelected] = React.useState([]);
  const [schedules, setSchedules] = React.useState({});
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", pass: "", confirm: "" });

  const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const setSchedule = (id, sch) => setSchedules((m) => ({ ...m, [id]: sch }));
  const removeMod = (id) => {
    setSelected((s) => s.filter((x) => x !== id));
    setSchedules((m) => { const n = { ...m }; delete n[id]; return n; });
  };

  const canNextStep0 = selected.length > 0;
  const canNextStep1 = selected.every((id) => schedules[id]);
  const canSubmit = form.name && form.email && form.phone && form.pass && form.pass === form.confirm && form.pass.length >= 8;

  const next = () => {
    if (step === 0 && canNextStep0) setStep(1);
    else if (step === 1 && canNextStep1) setStep(2);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = () => {
    if (canSubmit) setStep(3);
  };

  // Top bar
  const STEP_LABELS = ["Módulos", "Nivelamento", "Conta"];
  const showBottom = step <= 2;

  return (
    <div className="ob">
      <div className="ob-top">
        <a href="Landing.html" className="ob-top__logo">
          <span className="ob-top__mark">B</span>
          <span>balança<b>eu</b></span>
        </a>
        <div className="ob-steps">
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              <div className={"ob-step-dot" + (step > i ? " is-done" : "") + (step === i ? " is-active" : "")}>
                <div className="ob-step-dot__num">
                  {step > i ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
                  ) : i + 1}
                </div>
                <span className="ob-step-dot__label">{STEP_LABELS[i]}</span>
              </div>
              {i < 2 && <div className={"ob-step-line" + (step > i ? " is-full" : "")}></div>}
            </React.Fragment>
          ))}
        </div>
        <a href="#login" className="ob-top__login">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h5v18h-5"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Já tenho conta
        </a>
      </div>

      <div className="ob-stage">
        {step === 0 && <StepModules selected={selected} toggle={toggle} />}
        {step === 1 && <StepSchedule selected={selected} schedules={schedules} setSchedule={setSchedule} />}
        {step === 2 && <StepAccount selected={selected} schedules={schedules} onSubmit={submit} form={form} setForm={setForm} />}
        {step === 3 && <StepSuccess name={form.name} selected={selected} schedules={schedules} />}
      </div>

      {showBottom && (
        <div className="ob-bottom">
          <div className="ob-bottom__count">
            {step === 0 ? (
              <>
                <strong>{selected.length}</strong> selecionado{selected.length !== 1 ? "s" : ""}
                <div className="ob-bottom__chips">
                  {selected.map((id) => {
                    const m = MODULES.find((x) => x.id === id);
                    return (
                      <span className="ob-bottom__chip" key={id}>
                        {m.title}
                        <button onClick={() => removeMod(id)} aria-label={`Remover ${m.title}`}>×</button>
                      </span>
                    );
                  })}
                </div>
              </>
            ) : step === 1 ? (
              <>
                <strong>{Object.keys(schedules).length}/{selected.length}</strong> nivelamentos marcados
              </>
            ) : (
              <span style={{ color: "var(--ink-mute)", fontSize: 13 }}>Quase lá — preencha seus dados para confirmar.</span>
            )}
          </div>
          <div className="ob-bottom__actions">
            {step > 0 && (
              <button className="ob-back" onClick={back}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Voltar
              </button>
            )}
            {step < 2 && (
              <button className="ob-next" onClick={next} disabled={(step === 0 && !canNextStep0) || (step === 1 && !canNextStep1)}>
                Continuar <Arrow />
              </button>
            )}
            {step === 2 && (
              <button className="ob-next" onClick={submit} disabled={!canSubmit}>
                Finalizar <Arrow />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<Onboarding />);
