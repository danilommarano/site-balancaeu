function Local() {
  return (
    <section className="sec-local" id="local">
      <div className="container">
        <div className="local-grid">
          <Reveal className="local-info">
            <div className="eyebrow">Onde a gente dança</div>
            <h2>Nossa <em>casa.</em></h2>
            <p>Um sobrado reformado no coração de Pinheiros, com três salas de assoalho de madeira, pé-direito alto e janelões para a rua. Entra sol pela manhã, entra música à noite.</p>
            <div className="local-meta">
              <div className="local-meta__item">
                <h4>Endereço</h4>
                <p>Rua Cardeal Arcoverde, 1820<br/>Pinheiros · São Paulo</p>
              </div>
              <div className="local-meta__item">
                <h4>Como chegar</h4>
                <p>Metrô Faria Lima (4-amarela), 8 min a pé<br/>Estacionamento conveniado</p>
              </div>
              <div className="local-meta__item">
                <h4>Horário</h4>
                <p>Seg a Sex · 09h às 22h<br/>Sábado · 10h às 18h</p>
              </div>
              <div className="local-meta__item">
                <h4>Contato</h4>
                <p>(11) 94000-0000<br/>ola@balancaeu.com.br</p>
              </div>
            </div>
            <div style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#" className="btn btn--primary">Ver no Google Maps <Arrow /></a>
              <a href="#" className="btn btn--outline">Chamar no WhatsApp <Arrow /></a>
            </div>
          </Reveal>
          <Reveal className="local-map" aria-hidden="true">
            <div className="local-map__pin">
              <div className="local-map__pin-pulse"></div>
              <div className="local-map__pin-mark"></div>
            </div>
            <div className="local-map__label">Balança Eu · aqui</div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { Local });
