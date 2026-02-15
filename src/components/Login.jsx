import { useState } from "react";
import API from "../api/api";
import { useAuth } from "../auth/AuthContext";

function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await API.post("/api/auth/login", {
        email,
        password,
      });

      const receivedToken = res.data?.token ?? res.data?.data?.token;
      if (!receivedToken) throw new Error("Token not found");

      const userData = res.data?.user ?? res.data?.data?.user ?? null;
      login(receivedToken, userData);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>WealthWise</h1>
        <p style={styles.subtitle}>Track. Grow. Succeed.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eye}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            style={styles.button}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
  },
  card: {
    width: "400px",
    padding: "40px",
    borderRadius: "18px",
    background: "#111827",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  title: {
    textAlign: "center",
    color: "#ffffff",
    marginBottom: "6px",
    fontSize: "28px",
  },
  subtitle: {
    textAlign: "center",
    color: "#9ca3af",
    marginBottom: "30px",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    color: "#cbd5e1",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #374151",
    backgroundColor: "#1f2937",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },
  passwordWrapper: {
    position: "relative",
    width: "100%",
  },
  eye: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "16px",
  },
  button: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #3b82f6)",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    background: "#7f1d1d",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "13px",
    color: "#fecaca",
  },
};
