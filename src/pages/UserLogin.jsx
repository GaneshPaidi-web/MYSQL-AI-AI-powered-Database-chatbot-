import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./UserLogin.css";function UserLogin() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Hardcoded Admin Login
        if (form.email === "admin@sql.com" && form.password === "admin") {
            localStorage.setItem("token", "admin-token-mock");
            localStorage.setItem("user", JSON.stringify({
                id: "507f1f77bcf86cd799439011",
                name: "Administrator",
                email: "admin@sql.com",
                isAdmin: true
            }));
            navigate("/connect-db");
            setLoading(false);
            return;
        } else {
            alert("Invalid Admin Credentials");
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>MySQL AI</h1>
                    <h2>Admin Login</h2>
                    <p>Log in to access your SQL AI Dashboard</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter Administrator Email Address"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? "Please wait..." : "Log In"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UserLogin;
