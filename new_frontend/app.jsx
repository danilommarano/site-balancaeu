function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Filosofia />
      <Modulos />
      <Professores />
      <Grade />
      <Depoimentos />
      <Galeria />
      <Agenda />
      <Caminho />
      <FAQ />
      <Local />
      <CTAFinal />
      <Footer />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
