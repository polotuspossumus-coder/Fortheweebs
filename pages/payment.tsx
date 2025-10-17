import { useRouter } from 'next/router';

export default function Payment() {
  const router = useRouter();

  const handlePayment = () => {
    // Simulate payment success
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
      <div className="flex flex-col gap-4">
        <button onClick={handlePayment} className="bg-green-600 px-6 py-3 rounded">
          Pay $5/month – Basic Access
        </button>
        <button onClick={handlePayment} className="bg-blue-600 px-6 py-3 rounded">
          Pay $15/month – Premium Access
        </button>
      </div>
    </main>
  );
}
