function Caminho() {
  return (
    <section className="sec-caminho" id="caminho">
      <div className="container">
        <Reveal className="caminho__head">
          <div className="eyebrow">Seu caminho</div>
          <h2 className="caminho__title">Como <em>começa</em> a sua jornada.</h2>
          <p className="caminho__sub">
            Cada modalidade tem seu próprio ritmo, sua própria graduação e sua própria mensalidade. Você monta a jornada no seu tempo.
          </p>
        </Reveal>

        <Reveal stagger className="caminho__steps">
          <div className="caminho-step">
            <div className="caminho-step__num">01</div>
            <div className="caminho-step__line"></div>
            <h3>Escolha seus <em>módulos</em></h3>
            <p>Forró, samba, zumba — quantos quiser. Cada um vira uma trilha dentro da sua conta.</p>
          </div>
          <div className="caminho-step">
            <div className="caminho-step__num">02</div>
            <div className="caminho-step__line"></div>
            <h3>Faça seu <em>nivelamento</em></h3>
            <p>Um mestre avalia seu ponto de partida em uma aula experimental gratuita.</p>
          </div>
          <div className="caminho-step">
            <div className="caminho-step__num">03</div>
            <div className="caminho-step__line"></div>
            <h3>Dance no <em>seu</em> tempo</h3>
            <p>Mensalidade por modalidade escolhida. Sem fidelidade, sem pegadinha.</p>
          </div>
        </Reveal>

        <Reveal className="caminho__cta">
          <a href="comecar.html" className="btn btn--primary btn--lg">
            Começar minha jornada <Arrow />
          </a>
          <p className="caminho__cta-note">
            Aula experimental gratuita · Valores apresentados na página de cada modalidade
          </p>
        </Reveal>
      </div>
    </section>
  );
}
Object.assign(window, { Caminho });
