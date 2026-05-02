function CTAFinal() {
  return (
    <section className="sec-cta-final" id="matricula">
      <div className="container sec-cta-final__content">
        <Reveal>
          <div className="eyebrow" style={{ color: "var(--coral)" }}>Sua vaga te espera</div>
          <h2 className="sec-cta-final__title">
            Seja parte do movimento. <em>Venha viver a experiência Balança Eu.</em>
          </h2>
          <p className="sec-cta-final__sub">
            Primeira aula por nossa conta. Vem sentir a casa, conhecer os mestres e descobrir qual ritmo balança você.
          </p>
          <div className="sec-cta-final__actions">
            <a href="comecar.html" className="btn btn--coral">Agendar aula experimental <Arrow /></a>
            <a href="#" className="btn" style={{ color: "var(--creme)", border: "1.5px solid rgba(248,241,233,0.4)" }}>Falar no WhatsApp <Arrow /></a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
Object.assign(window, { CTAFinal });
