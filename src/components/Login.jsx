import { useState } from "react";
import API from "../api/api";
import { useAuth } from "../auth/AuthContext";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Adjust this endpoint / payload to match your backend
      const res = await API.post("/api/auth/login", {
        email,
        password,
      });

      const receivedToken = res.data?.token ?? res.data?.data?.token;
      if (!receivedToken) {
        throw new Error("Token not found in response");
      }
      const userData = res.data?.user ?? res.data?.data?.user ?? null;
      login(receivedToken, userData);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="appShell">
      <main className="layout" style={{ maxWidth: 480, margin: "0 auto" }}>
        <header className="topbar" style={{ marginBottom: "2rem" }}>
          <div>
            <div className="brand">WealthWise</div>
            <div className="subtitle">Sign in to continue</div>
          </div>
        </header>

        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          {error && (
            <p className="error" style={{ color: "red", marginTop: "0.5rem" }}>
              {error}
            </p>
          )}

          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Login;

