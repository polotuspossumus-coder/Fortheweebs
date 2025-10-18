import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { trackPageView } from '../../lib/analytics';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  useEffect(() => {
    trackPageView(router.pathname);
  }, [router.pathname]);

  return <Component {...pageProps} />;
}

export default MyApp;
