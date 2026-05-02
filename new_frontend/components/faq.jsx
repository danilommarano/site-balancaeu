const FAQS = [
  { q: "Preciso de experiência prévia para começar?", a: "Nenhuma. Metade dos nossos alunos nunca dançou antes. Nossa didática é pensada para iniciantes absolutos — a primeira aula já é um mergulho gostoso, sem julgamento." },
  { q: "Como funciona a progressão por graduações?", a: "No módulo Forró Pé Descalço adotamos um método por cores — Azul, Branca, Marrom e Preta. Você evolui no seu tempo, sendo avaliado por um mestre ao final de cada ciclo." },
  { q: "Preciso levar par para as aulas?", a: "Não. A maioria das nossas turmas trabalha com rodízio, e você dança com diferentes pessoas ao longo da aula. Isso acelera o aprendizado e cria conexões reais." },
  { q: "O que é o portal do aluno?", a: "É o sistema onde cada aluno acompanha suas aulas, graduações, presenças, mensalidades e recebe conteúdos exclusivos dos mestres. Professores e gestores também têm acesso, cada um com sua visão." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Não trabalhamos com fidelidade. Basta avisar até o dia 20 do mês para não ter cobrança no mês seguinte." },
  { q: "Tem vestiário, chuveiro, estacionamento?", a: "Temos vestiário completo, chuveiros quentes e convênio com estacionamento a 50 metros da escola. Também há bicicletário gratuito na calçada." },
];

function FAQ() {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="sec-faq" id="faq">
      <div className="container">
        <div className="faq-wrap">
          <Reveal>
            <div className="eyebrow">Perguntas frequentes</div>
            <h2 className="faq-wrap__title">Tudo que você <em>precisa saber.</em></h2>
            <p className="faq-wrap__sub">Se não encontrar a resposta aqui, chame a gente no WhatsApp. A gente responde rápido.</p>
          </Reveal>
          <Reveal className="faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className={"faq-item" + (open === i ? " is-open" : "")}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{f.q}</span>
                  <span className="faq-q__icon">+</span>
                </button>
                <div className="faq-a"><p>{f.a}</p></div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { FAQ });
