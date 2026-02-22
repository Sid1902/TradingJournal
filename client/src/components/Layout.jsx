function Layout({ children, setPage, logout }) {
  return (
    <div className="app-container">
      <div className="sidebar">
        <h2 className="logo">TradeDesk</h2>

        <div className="nav-item" onClick={() => setPage("journal")}>
          Journal
        </div>

        <div className="nav-item" onClick={() => setPage("dashboard")}>
          Dashboard
        </div>

        <div className="nav-item" onClick={() => setPage("portfolio")}>
          Portfolio
        </div>

        <div className="nav-item logout" onClick={logout}>
          Logout
        </div>
      </div>

      <div className="main-content">
        <div className="topbar">
          <div className="market-status">
            NIFTY 50 ↑ 0.84%
          </div>
        </div>

        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;