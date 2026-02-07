function Header() {
  return (
    <header className="header">
      <div className="logo-row">
        <img
          src="/assets/wefi-logo.png"
          alt="WEFI logo"
          className="logo wefi"
          loading="lazy"
        />
        <img
          src="/assets/excellency-logo.png"
          alt="Excellency logo"
          className="logo excellency"
          loading="lazy"
        />
      </div>
      <div className="header-line" aria-hidden="true" />
    </header>
  )
}

export default Header
