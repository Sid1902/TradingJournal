import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Journal from "./pages/Journal";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";

function App() {
  const [page, setPage] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on app load
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setIsAuthenticated(true);
      setPage("journal");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setPage("login");
  };

  // If user is not authenticated
  if (!isAuthenticated) {
    return page === "register" ? (
      <Register setPage={setPage} />
    ) : (
      <Login
        setIsAuthenticated={setIsAuthenticated}
        setPage={setPage}
      />
    );
  }

  // Routing logic
  let CurrentPage;
  if (page === "journal") CurrentPage = <Journal />;
  else if (page === "dashboard") CurrentPage = <Dashboard />;
  else if (page === "portfolio") CurrentPage = <Portfolio />;
  else CurrentPage = <Home />;

  return (
    <Layout setPage={setPage} logout={logout}>
      {CurrentPage}
    </Layout>
  );
}

export default App;