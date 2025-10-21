import createBundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: typeof process !== 'undefined' ? process.env.ANALYZE === 'true' : false,
});
export default withBundleAnalyzer({});
