// Add this to your custom _document.js or _app.js for Next.js analytics
import { useEffect } from 'react';

const PlausibleScript = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', 'fortheweebs.com');
    script.src = 'https://plausible.io/js/script.js';
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return null;
};

export default PlausibleScript;
