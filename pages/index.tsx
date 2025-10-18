import React from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const handleAgree = () => {
    router.push('/signup');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to ForTheWeebs</h1>
      <div className="max-w-xl text-center mb-6">
        <p className="mb-4">Before you continue, please review and accept our legal documents to use the platform.</p>
        <div className="bg-gray-800 p-4 rounded mb-4">
          <h2 className="text-2xl font-semibold mb-2">Terms of Service</h2>
          <p className="text-sm">By using this site, you agree to our Terms of Service and Privacy Policy. Please read them carefully before proceeding.</p>
        </div>
        <button onClick={handleAgree} className="bg-blue-600 px-6 py-3 rounded text-white font-bold">I Agree & Continue</button>
      </div>
    </main>
  );
}
