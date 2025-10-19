import { useEffect } from 'react';
import { useRouter } from 'next/router';
// import { trackPageView } from '../../lib/analytics';

import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
  // trackPageView(router.pathname); // Removed: not defined in analytics
  }, [router.pathname]);

  return <Component {...pageProps} />;
}

export default MyApp;
