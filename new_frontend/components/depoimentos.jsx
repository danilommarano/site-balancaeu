const DEPOS = [
  { quote: "Entrei na Balança Eu achando que ia aprender passos. Saí de cada aula me conhecendo um pouco mais.", name: "Luiza Prado", role: "Aluna · Forró Pé Descalço", initial: "L" },
  { quote: "Os mestres têm um olhar único. Você não é só corpo aqui — é história, ritmo, presença.", name: "Caio Bernardes", role: "Aluno · Samba de Gafieira", initial: "C" },
  { quote: "Pela primeira vez em anos, o corpo virou um lugar seguro. A escola é cura, literalmente.", name: "Renata Oliveira", role: "Aluna · Zumba e Forró", initial: "R" },
  { quote: "A sala vira casa, a turma vira família. É raro encontrar esse tipo de acolhimento hoje.", name: "Tiago Monteiro", role: "Aluno · Forró Roots", initial: "T" },
];

function Depoimentos() {
  return (
    <section className="sec-depo">
      <div className="container">
        <Reveal className="sec-depo__head">
          <div>
            <div className="eyebrow" style={{ color: "var(--coral)" }}>Quem dança conta</div>
            <h2 className="sec-depo__title">O que os alunos <em>sentem.</em></h2>
          </div>
          <p style={{ color: "rgba(248,241,233,0.7)", fontSize: 16, maxWidth: 360 }}>
            Histórias reais de quem encontrou no movimento uma nova forma de habitar o corpo.
          </p>
        </Reveal>
        <Reveal stagger className="depo-track">
          {DEPOS.map((d) => (
            <article className="depo-card" key={d.name}>
              <div className="depo-card__quote-mark">"</div>
              <p className="depo-card__quote">{d.quote}</p>
              <div className="depo-card__author">
                <div className="depo-card__avatar">{d.initial}</div>
                <div>
                  <div className="depo-card__name">{d.name}</div>
                  <div className="depo-card__role">{d.role}</div>
                </div>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
Object.assign(window, { Depoimentos });
