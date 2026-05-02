function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={"nav" + (scrolled ? " is-scrolled" : "")}>
      <div className="container nav__inner">
        <a href="#top" className="nav__logo" aria-label="Balança Eu — início">
          <span className="nav__logo-mark">B</span>
          <span className="nav__logo-name">balança<b>eu</b></span>
        </a>
        <div className="nav__menu">
          <a href="#filosofia">Filosofia</a>
          <a href="#modulos">Módulos</a>
          <a href="#professores">Professores</a>
          <a href="#grade">Grade</a>
          <a href="#agenda">Agenda</a>
          <a href="#caminho">Como funciona</a>
        </div>
        <div className="nav__actions">
          <a href="comecar.html" className="btn btn--primary btn--sm">
            Matricule-se <Arrow size={14} />
          </a>
        </div>
      </div>
    </nav>
  );
}
Object.assign(window, { Nav });
