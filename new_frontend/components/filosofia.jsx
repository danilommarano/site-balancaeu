function Filosofia() {
  return (
    <section className="sec-filosofia" id="filosofia">
      <div className="container">
        <Reveal>
          <div className="eyebrow">Balança Eu</div>
          <h2 className="sec-filosofia__title">
            Um <em>espaço</em> de encontro, arte e identidade.
          </h2>
        </Reveal>
        <Reveal stagger className="sec-filosofia__grid">
          <div className="sec-filosofia__col">
            <p>No Balança Eu, acreditamos que o corpo é nosso primeiro território. Não ensinamos apenas passos; cultivamos a percepção de si através do ritmo e da expressão artística.</p>
          </div>
          <div className="sec-filosofia__col">
            <p>Nossa casa é um refúgio contemporâneo onde a tradição e a inovação se abraçam para criar novas linguagens corporais e conexões humanas profundas.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
Object.assign(window, { Filosofia });
