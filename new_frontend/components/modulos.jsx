const MODULOS = [
  {
    num: "01",
    label: "Tradição",
    title: "Forró Pé Descalço",
    desc: "Método próprio de ensino com progressão por graduações — do Azul Iniciante à Preta Avançada.",
  },
  {
    num: "02",
    label: "Raiz",
    title: "Forró Roots",
    desc: "Forró tradicional nordestino: passo marcado, giros e caminhadas. A raiz que move o corpo.",
  },
  {
    num: "03",
    label: "Elegância",
    title: "Samba de Gafieira",
    desc: "O samba dos salões cariocas. Técnica, musicalidade e conexão em dupla.",
  },
  {
    num: "04",
    label: "Energia",
    title: "Zumba",
    desc: "Fitness com ritmos latinos para extravasar, suar e sorrir de verdade.",
  },
];

function Modulos() {
  return (
    <section className="sec-modulos" id="modulos">
      <div className="container">
        <Reveal className="sec-modulos__head">
          <h2 className="sec-modulos__title">Nossos <em>módulos.</em></h2>
          <p className="sec-modulos__intro">Quatro linguagens corporais, uma só escola. Explore cada modalidade e encontre o ritmo que vai te transformar.</p>
        </Reveal>
        <Reveal stagger className="modulo-grid">
          {MODULOS.map((m) => (
            <article className="modulo" key={m.num}>
              <div className="modulo__img"></div>
              <div className="modulo__pattern"></div>
              <div className="modulo__content">
                <div>
                  <div className="modulo__num">{m.num} / 04</div>
                  <span className="modulo__label">{m.label}</span>
                </div>
                <div>
                  <h3 className="modulo__title">{m.title}</h3>
                  <p className="modulo__desc">{m.desc}</p>
                  <div className="modulo__cta">Explorar módulo <Arrow size={14} /></div>
                </div>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
Object.assign(window, { Modulos });
