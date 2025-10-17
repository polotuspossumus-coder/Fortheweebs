import React, { useState } from "react";

const CreatorSignup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [reserved, setReserved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email })
      });
      const result = await response.json();
      if (result.success) {
        setReserved(true);
      } else {
        setError(result.error || "Signup failed");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8, background: "rgba(255,255,255,0.05)" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Reserve Your Creator Spot</h2>
      {reserved ? (
        <div style={{ color: "#22c55e", fontWeight: 600, textAlign: "center" }}>
          <strong>Success!</strong> Your spot is reserved.<br />You will be notified when the platform launches.
        </div>
      ) : (
        <form onSubmit={handleSubmit} aria-label="Creator signup form" autoComplete="on">
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="username" style={{ fontWeight: 500 }}>Username<br />
              <input id="username" name="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }} autoComplete="username" aria-required="true" aria-label="Username" />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" style={{ fontWeight: 500 }}>Email<br />
              <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }} autoComplete="email" aria-required="true" aria-label="Email" />
            </label>
          </div>
          {error && <div style={{ color: "#ef4444", marginBottom: 12, textAlign: "center" }}>{error}</div>}
          <button type="submit" style={{ width: "100%", padding: 10, background: loading ? "#a5b4fc" : "#007bff", color: "#fff", border: "none", borderRadius: 4, fontWeight: 600, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer" }} disabled={loading}>{loading ? "Reserving..." : "Reserve Spot"}</button>
        </form>
      )}
    </div>
  );
};

export default CreatorSignup;
