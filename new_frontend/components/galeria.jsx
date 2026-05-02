function Galeria() {
  const items = [
    { cls: "gal-item--a", label: "Sala principal", video: true },
    { cls: "gal-item--b", label: "Baile de sexta" },
    { cls: "gal-item--c", label: "Aula de forró" },
    { cls: "gal-item--d", label: "Roda de samba" },
    { cls: "gal-item--e", label: "Workshop Pé Descalço", video: true },
    { cls: "gal-item--f", label: "Encerramento de módulo" },
  ];
  return (
    <section className="sec-galeria" id="galeria">
      <div className="container">
        <Reveal className="galeria-head">
          <div>
            <div className="eyebrow">A casa por dentro</div>
            <h2>Nossa <em>galeria</em> de movimentos.</h2>
          </div>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", maxWidth: 420, lineHeight: 1.6 }}>
            Um recorte dos bailes, aulas e encontros que acontecem por aqui — o que você vai viver quando chegar.
          </p>
        </Reveal>
        <Reveal stagger className="galeria-grid">
          {items.map((it, i) => (
            <div key={i} className={"gal-item " + it.cls + (it.video ? " is-video" : "")}>
              <span className="gal-item__label">{it.label}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
Object.assign(window, { Galeria });
