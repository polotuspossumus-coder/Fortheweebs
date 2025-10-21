import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppFlow from "./AppFlow.jsx";
import { LegalDocuments } from "./components/LegalDocuments.jsx";

export default function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppFlow />} />
        <Route path="/legal" element={<LegalDocuments />} />
      </Routes>
    </BrowserRouter>
  );
}
