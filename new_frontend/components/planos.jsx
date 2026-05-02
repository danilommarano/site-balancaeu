const PLANOS = [
  {
    name: "Experimental",
    tagline: "Para começar sem compromisso",
    price: "0",
    per: "1ª aula grátis",
    features: [
      "Uma aula experimental em qualquer módulo",
      "Avaliação de nível com um mestre",
      "Tour completo pela casa",
    ],
    cta: "Agendar aula",
    featured: false,
  },
  {
    name: "Módulo Único",
    tagline: "Mergulhe em uma modalidade",
    price: "240",
    per: "/mês",
    features: [
      "Até 8 aulas mensais no módulo escolhido",
      "Acesso ao portal do aluno",
      "Participação em rodas e bailes internos",
      "Progressão por graduação",
    ],
    cta: "Matricular agora",
    featured: true,
  },
  {
    name: "Passe Livre",
    tagline: "Transite por todas as linguagens",
    price: "380",
    per: "/mês",
    features: [
      "Aulas ilimitadas em todos os módulos",
      "Acesso ao portal + conteúdos exclusivos",
      "Desconto em workshops e masterclasses",
      "Ingresso VIP em eventos da casa",
      "Mentoria individual com um mestre",
    ],
    cta: "Quero o Passe Livre",
    featured: false,
  },
];

function Planos() {
  return (
    <section className="sec-planos" id="planos">
      <div className="container">
        <Reveal className="sec-planos__head">
          <div className="eyebrow">Planos</div>
          <h2 className="sec-planos__title">Seu <em>ritmo</em>, seu plano.</h2>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", marginTop: 16, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            Três formas de viver a Balança Eu. Sem fidelidade. Você escolhe como dançar.
          </p>
        </Reveal>
        <Reveal stagger className="planos-grid">
          {PLANOS.map((p) => (
            <article className={"plano" + (p.featured ? " is-featured" : "")} key={p.name}>
              <h3 className="plano__name">{p.name}</h3>
              <p className="plano__tagline">{p.tagline}</p>
              <div className="plano__price">
                <span className="cur">R$</span>
                <span className="val">{p.price}</span>
                <span className="per">{p.per}</span>
              </div>
              <ul className="plano__list">
                {p.features.map((f, i) => (
                  <li key={i}><Check /><span>{f}</span></li>
                ))}
              </ul>
              <div className="plano__cta">
                <a href="#matricula" className={"btn " + (p.featured ? "btn--coral" : "btn--primary")}>
                  {p.cta} <Arrow />
                </a>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
Object.assign(window, { Planos });
