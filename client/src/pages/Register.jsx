import { useState } from "react";

function Register({setPage}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
    name,
    email,
    password
  }),
    });

    const data = await res.json();

    if (!data.error) {
      setPage("login");
    } else {
      alert(data.error);
    }
  };

  return (
  <div className="auth-wrapper">
    <div className="auth-card">
      <h2 className="auth-title">Create Account</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <input
            type="text"
            required
            placeholder=" "
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
          <label>Name</label>
        </div>

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
          Register
        </button>

        <p className="auth-footer">
          Already have an account?
          <span onClick={() => setPage("login")}>
            Login here
          </span>
        </p>
      </form>
    </div>
  </div>
);
}

export default Register;