import createBundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});
export default withBundleAnalyzer({});
