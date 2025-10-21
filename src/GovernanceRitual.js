import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import ledgerData from "./codename-timeline.json" with { type: "json" };
const actions = {
    ban: "🔨 Ban Proposal",
    crown: "👑 Crown Restoration",
    resurrect: "⚰️ Graveyard Resurrection"
};
export default function GovernanceRitual() {
    const [selected, setSelected] = useState(null);
    return (_jsxs("div", { className: "ritual", children: [_jsx("h1", { children: "\uD83D\uDEE1\uFE0F Vanguard Governance Rituals" }), _jsx("div", { className: "actions", children: Object.entries(actions).map(([key, label]) => (_jsx("button", { onClick: () => setSelected(key), children: label }, key))) }), selected && (_jsxs("div", { className: "form", children: [_jsx("h2", { children: actions[selected] }), _jsx("input", { type: "text", placeholder: "Enter user ID or artifact ID" }), _jsx("textarea", { placeholder: "Reason, context, or legacy note" }), _jsx("button", { children: "Submit Ritual" })] })), _jsxs("div", { className: "ledger", children: [_jsx("h2", { children: "\uD83D\uDCDC Legacy Timeline" }), _jsx("ul", { children: ledgerData.map((entry) => (_jsxs("li", { children: [_jsxs("h3", { children: [entry.codename, " (", entry.version, ")"] }), _jsxs("p", { children: [_jsx("strong", { children: "Date:" }), " ", entry.date] }), _jsx("p", { children: entry.summary })] }, entry.version))) })] })] }));
}
//# sourceMappingURL=GovernanceRitual.js.map