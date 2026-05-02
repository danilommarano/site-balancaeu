const PROFS = [
  { name: "Ani Gâlíoti", badge: "Mestra", tags: "Samba de Gafieira · Dança de Salão", bio: "Profissional com forte formação em dança de salão brasileira." },
  { name: "Danilo Marano", badge: "Mestre", tags: "Forró Roots · Forró Pé de Serra", bio: "Apaixonado pela tradição nordestina e pela dança enraizada na cultura popular." },
  { name: "Mari Meireles", badge: "Mestra", tags: "Forró Roots · Footwork", bio: "Dançarina há mais de uma década, especialista em footwork e técnica feminina." },
  { name: "Renato Almeida", badge: "Mestre", tags: "Samba de Gafieira · Salão", bio: "Herdeiro da escola carioca tradicional dos salões." },
];

function Professores() {
  return (
    <section className="sec-prof" id="professores">
      <div className="container">
        <Reveal className="sec-prof__head">
          <div>
            <div className="eyebrow">Mestres do movimento</div>
            <h2 className="sec-prof__title">Quem <em>conduz</em> sua evolução.</h2>
          </div>
          <p className="sec-prof__intro">Nossa equipe é formada por artistas apaixonados e profissionais sensíveis ao seu tempo e ritmo.</p>
        </Reveal>
        <Reveal stagger className="prof-grid">
          {PROFS.map((p) => (
            <article className="prof-card" key={p.name}>
              <div className="prof-card__img">
                <span className="prof-card__badge">{p.badge}</span>
                <div className="prof-card__placeholder"><PersonIcon /></div>
              </div>
              <h3 className="prof-card__name">{p.name}</h3>
              <div className="prof-card__tags">{p.tags}</div>
              <p className="prof-card__bio">{p.bio}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
Object.assign(window, { Professores });
