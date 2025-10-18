import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="flex justify-between items-center py-4 px-6 bg-gray-900 text-white">
      <Link href="/" className="text-xl font-bold">Fortheweebs</Link>
      <div className="space-x-4 hidden sm:block">
        <Link href="/create">Create</Link>
        <Link href="/govern">Govern</Link>
        <Link href="/lore">Lore</Link>
      </div>
      <button className="sm:hidden">☰</button>
    </nav>
  );
}
