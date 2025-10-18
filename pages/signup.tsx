import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

export default function Signup() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const onSubmit = () => {
    router.push('/payment');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-4">Create Your Account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm">
        <input {...register('username')} placeholder="Username" className="p-2 rounded bg-gray-800 text-white" required />
        <input {...register('email')} type="email" placeholder="Email" className="p-2 rounded bg-gray-800 text-white" required />
        <input {...register('password')} type="password" placeholder="Password" className="p-2 rounded bg-gray-800 text-white" required />
        <button type="submit" className="bg-blue-600 px-6 py-3 rounded">Sign Up & Continue</button>
      </form>
    </main>
  );
}
