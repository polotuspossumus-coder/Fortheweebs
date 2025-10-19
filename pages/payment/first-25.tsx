import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

export default function First25Payment() {
  useEffect(() => {
    const initiateCheckout = async () => {
      const stripe = await stripePromise;
      const res = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'first-25', amount: 10000 }), // $100
      });
      const session = await res.json();
  await (stripe as any)?.redirectToCheckout({ sessionId: session.id });
    };

    initiateCheckout();
  }, []);

  return (
    <section className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-lg">Redirecting to secure payment…</p>
    </section>
  );
}
