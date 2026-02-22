function Navbar({ setPage, logout }) {
  return (
    <div
      style={{
        background: "#243c84",
        color: "white",
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontWeight: "bold" }}>
        Trading Journal
      </div>

      <div style={{ display: "flex", gap: "15px" }}>
        <button onClick={() => setPage("journal")}>
          Journal
        </button>
        <button onClick={() => setPage("dashboard")}>
          Dashboard
        </button>
        <button onClick={() => setPage("portfolio")}>
          Portfolio
        </button>
        <button onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;