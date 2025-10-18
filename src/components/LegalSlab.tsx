import Link from 'next/link';

const LegalSlab = () => {
  return (
    <section className="legal-slab">
      <h1>📜 Fortheweebs Legal Protocol</h1>
      <p>
        These documents form the sovereign legal backbone of Fortheweebs. All creators, validators, and founders are bound by these terms. Each link is versioned, queryable, and globally accessible.
      </p>

      <ul>
        <li>
          <strong>Terms of Service:</strong>{' '}
          <Link href="/legal/terms-of-service.pdf" target="_blank" rel="noopener noreferrer">
            View Document
          </Link>
        </li>
        <li>
          <strong>Privacy Policy:</strong>{' '}
          <Link href="/legal/privacy-policy.pdf" target="_blank" rel="noopener noreferrer">
            View Document
          </Link>
        </li>
        <li>
          <strong>Creator Agreement:</strong>{' '}
          <Link href="/legal/creator-agreement.pdf" target="_blank" rel="noopener noreferrer">
            View Document
          </Link>
        </li>
        <li>
          <strong>Validator Protocol:</strong>{' '}
          <Link href="/legal/validator-protocol.pdf" target="_blank" rel="noopener noreferrer">
            View Document
          </Link>
        </li>
        <li>
          <strong>Profit Structure & Access:</strong>{' '}
          <Link href="/legal/profit-access-structure.pdf" target="_blank" rel="noopener noreferrer">
            View Document
          </Link>
        </li>
      </ul>

      <p>
        All documents are hosted in the <code>/public/legal/</code> directory and protected by permanent redirects via <code>vercel.json</code>. Any broken link triggers instant escalation.
      </p>
    </section>
  );
};

export default LegalSlab;
