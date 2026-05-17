import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./DBConnection.css"; function DBLogin({ setConnection }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    host: "localhost",
    user: "",
    password: "",
    database: "", // Now optional
    port: "3306"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (data.success) {
        setConnection(true);
        navigate("/dashboard");
      } else {
        alert("Connection Failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Server error. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>MySQL AI</h1>
        <h2>MYSQL Login</h2>
        <p>Enter your credentials to connect to the SQL engine</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-row">
            <input
              type="text"
              name="host"
              placeholder="Host (e.g. localhost)"
              value={form.host}
              onChange={handleChange}
              required
            />
            <input
              style={{ flex: "0 0 100px" }}
              type="text"
              name="port"
              placeholder="Port"
              value={form.port}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="text"
            name="user"
            placeholder="Username"
            value={form.user}
            onChange={handleChange}
            required
          />

          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>



          <button className="connect-btn" type="submit" disabled={loading}>
            {loading ? "Connecting..." : "Connect to MYSQL"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DBLogin;