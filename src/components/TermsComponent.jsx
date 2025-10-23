import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const TERMS_PATH = "/legal/terms-of-service.md";

export default function TermsComponent() {
  const [terms, setTerms] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(TERMS_PATH)
      .then((res) => {
        if (!res.ok) throw new Error("Terms of Service not found");
        return res.text();
      })
      .then(setTerms)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!terms) return <p>Loading terms...</p>;
  return <ReactMarkdown>{terms}</ReactMarkdown>;
}
