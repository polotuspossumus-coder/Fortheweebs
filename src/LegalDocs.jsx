import Link from 'next/link';

const documents = [
  { title: 'Terms of Service', file: 'terms-of-service.pdf' },
  { title: 'Privacy Policy', file: 'privacy-policy.pdf' },
  { title: 'Creator Agreement', file: 'creator-agreement.pdf' },
  { title: 'Validator Protocol', file: 'validator-protocol.pdf' },
  { title: 'Profit Structure & Access', file: 'profit-access-structure.pdf' },
];

export default function LegalDocs() {
  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">📜 Legal Documents</h1>
      <p className="mb-4 max-w-xl">
        These documents define the sovereign backbone of Fortheweebs. All tiers, rituals, and governance chains are bound by these terms.
      </p>
      <ul className="space-y-4">
        {documents.map((doc) => (
          <li key={doc.file}>
            <Link
              href={`/legal/${doc.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-purple-400"
            >
              {doc.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
