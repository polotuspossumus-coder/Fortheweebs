
// 🔓 Tier Definitions (outside component)
export const TIERS = {
  mythic: { label: 'Mythic Founder', price: 200, profit: 1.0 },
  standard: { label: 'Standard Founder', price: 200, profit: 1.0 },
  legacy: { label: 'Legacy Creator', price: 100, profit: 0.95 },
  supporter: { label: 'Supporter Creator', price: 50, profit: 0.85 },
  general: { label: 'General Access', price: 15, monthly: 5, profit: 0.80 },
};

// 🧠 Helper Functions (outside component)
const getTierDetails = (tier) => TIERS[tier] || {};
const handlePayment = async (tier) => {
  const res = await fetch('/payments/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier }),
  });
  const { url } = await res.json();
  window.location.href = url;
};

// 💳 Component
export default function PaymentPanel() {
  return (
    <div className="payment-panel">
      {Object.entries(TIERS).map(([key, tier]) => (
        <div key={key} className="tier-card">
          <h3>{tier.label}</h3>
          <p>Price: ${tier.price}{tier.monthly ? ` + $${tier.monthly}/mo` : ''}</p>
          <p>Profit Share: {tier.profit * 100}%</p>
          <button onClick={() => handlePayment(key)}>Pay & Activate</button>
        </div>
      ))}
    </div>
  );
}



