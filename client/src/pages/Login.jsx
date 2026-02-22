import { useState } from "react";

function Login({ setIsAuthenticated, setPage }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("${import.meta.env.vite_api_url}/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.accessToken) {
  localStorage.setItem("accessToken", data.accessToken);
localStorage.setItem("refreshToken", data.refreshToken);
setIsAuthenticated(true);
} else {
  if (data.error === "User not found") {
    alert("User not found. Please register.");
    setPage("register");
  } else {
    alert(data.error || "Login failed");
  }
}
  };

  return (
  <div className="auth-wrapper">
    <div className="auth-card">
      <h2 className="auth-title">Welcome Back</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <input
            type="email"
            required
            placeholder=" "
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
          <label>Email</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            required
            placeholder=" "
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          <label>Password</label>
        </div>

        <button className="auth-btn" type="submit">
          Login
        </button>

        <p className="auth-footer">
          Don’t have an account?
          <span onClick={() => setPage("register")}>
            Register here
          </span>
        </p>
      </form>
    </div>
  </div>
);
}

export default Login;