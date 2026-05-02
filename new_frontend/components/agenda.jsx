const EVENTOS = [
  { day: "03", month: "Mai", title: "Baile de Forró — Pé na Estrada", sub: "Sala principal · 21h às 01h", tag: "Baile", tagCls: "" },
  { day: "10", month: "Mai", title: "Masterclass com Ani Gâlíoti", sub: "Samba de Gafieira · intermediário+", tag: "Workshop", tagCls: "is-ocre" },
  { day: "24", month: "Mai", title: "Roda de Samba Aberta", sub: "Quintal · entrada franca", tag: "Gratuito", tagCls: "is-ghost" },
  { day: "07", month: "Jun", title: "Festival Forró Roots — 3 dias", sub: "Programação completa · ingressos abertos", tag: "Festival", tagCls: "" },
];

function Agenda() {
  return (
    <section className="sec-agenda" id="agenda">
      <div className="container">
        <Reveal className="sec-agenda__head">
          <div className="eyebrow">Agenda cultural</div>
          <h2 className="sec-agenda__title">Próximos <em>eventos.</em></h2>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", marginTop: 16, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            Vibrações que transcendem as aulas regulares. Conheça nossa programação especial.
          </p>
        </Reveal>
        <Reveal stagger className="agenda-list">
          {EVENTOS.map((e, i) => (
            <div className="agenda-row" key={i}>
              <div className="agenda-date">
                {e.day}
                <small>{e.month}</small>
              </div>
              <div className="agenda-info">
                <h3>{e.title}</h3>
                <p>{e.sub}</p>
              </div>
              <span className={"agenda-tag " + e.tagCls}>{e.tag}</span>
              <a href="#" className="btn btn--outline btn--sm">Garantir vaga <Arrow size={12} /></a>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
Object.assign(window, { Agenda });
