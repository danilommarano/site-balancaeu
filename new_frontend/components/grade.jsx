const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const GRADE = {
  Segunda: [
    { time: "19:30 – 20:30", slots: [null, null, { title: "Samba de Gafieira", level: "Iniciante", prof: "Ani Gâlíoti" }] },
    { time: "20:30 – 21:40", slots: [null, null, { title: "Samba de Gafieira", level: "Intermediário", prof: "Renato Almeida" }] },
  ],
  Terça: [
    { time: "19:30 – 20:30", slots: [{ title: "Forró Pé Descalço", level: "Azul", prof: "Equipe PD" }, null, { title: "Forró Roots", level: "Iniciante", prof: "Danilo Marano" }] },
    { time: "20:30 – 21:40", slots: [{ title: "Forró Pé Descalço", level: "Branca", prof: "Equipe PD" }, { title: "Zumba", level: "Open", prof: "Mari" }, null] },
  ],
  Quarta: [
    { time: "19:00 – 20:00", slots: [{ title: "Zumba", level: "Open", prof: "Mari" }, null, null] },
    { time: "20:00 – 21:10", slots: [null, { title: "Samba de Gafieira", level: "Avançado", prof: "Ani Gâlíoti" }, { title: "Forró Roots", level: "Intermediário", prof: "Danilo Marano" }] },
  ],
  Quinta: [
    { time: "19:30 – 20:30", slots: [{ title: "Forró Pé Descalço", level: "Azul", prof: "Equipe PD" }, null, { title: "Footwork Feminino", level: "Open", prof: "Mari Meireles" }] },
    { time: "20:30 – 21:40", slots: [{ title: "Forró Pé Descalço", level: "Preta", prof: "Equipe PD" }, { title: "Samba de Gafieira", level: "Intermediário", prof: "Renato Almeida" }, null] },
  ],
  Sexta: [
    { time: "19:00 – 20:00", slots: [null, { title: "Zumba", level: "Open", prof: "Mari" }, null] },
    { time: "20:00 – 22:00", slots: [{ title: "Baile livre", level: "Todos os níveis", prof: "Mestres da casa" }, { title: "Baile livre", level: "Todos os níveis", prof: "Mestres da casa" }, { title: "Baile livre", level: "Todos os níveis", prof: "Mestres da casa" }] },
  ],
  Sábado: [
    { time: "10:00 – 11:30", slots: [{ title: "Workshop Forró", level: "Aberto", prof: "Danilo Marano" }, null, null] },
    { time: "15:00 – 17:00", slots: [null, { title: "Masterclass Samba", level: "Intermediário+", prof: "Ani Gâlíoti" }, null] },
  ],
};

function Grade() {
  const [dia, setDia] = React.useState("Terça");
  const linhas = GRADE[dia] || [];
  return (
    <section className="sec-grade" id="grade">
      <div className="container">
        <Reveal className="sec-grade__head">
          <div className="eyebrow">Nossa agenda</div>
          <h2 className="sec-grade__title">Grade de <em>aulas.</em></h2>
        </Reveal>
        <Reveal className="days">
          {DIAS.map((d) => (
            <button key={d} className={"day-pill" + (d === dia ? " is-active" : "")} onClick={() => setDia(d)}>
              {d}
            </button>
          ))}
        </Reveal>
        <Reveal className="grade-table">
          <div className="grade-table__header">
            <div>Horário</div>
            <div>Sala 1</div>
            <div>Sala 2</div>
            <div>Sala 3</div>
          </div>
          {linhas.map((linha, i) => (
            <div className="grade-row" key={i}>
              <div className="grade-time">{linha.time}</div>
              {linha.slots.map((slot, j) => (
                slot ? (
                  <div className="grade-slot is-filled" key={j} data-sala={`Sala ${j + 1}`}>
                    <div className="grade-slot__title">{slot.title}</div>
                    <div className="grade-slot__level">{slot.level}</div>
                    <div className="grade-slot__prof">Prof. {slot.prof}</div>
                  </div>
                ) : (
                  <div className="grade-slot" key={j}>—</div>
                )
              ))}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
Object.assign(window, { Grade });
