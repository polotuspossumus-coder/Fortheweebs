import React, { useState } from "react";

const CreatorSignup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [reserved, setReserved] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
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
        alert(result.error || "Signup failed");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Reserve Your Creator Spot</h2>
      {reserved ? (
        <div style={{ color: "green" }}>
          <strong>Success!</strong> Your spot is reserved. You will be notified when the platform launches.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>Username<br />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: "100%" }} />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Email<br />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%" }} />
            </label>
          </div>
          <button type="submit" style={{ width: "100%", padding: 10, background: "#007bff", color: "#fff", border: "none", borderRadius: 4 }}>Reserve Spot</button>
        </form>
      )}
    </div>
  );
};

export default CreatorSignup;
