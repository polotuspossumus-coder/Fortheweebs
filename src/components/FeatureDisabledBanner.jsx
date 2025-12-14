/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import PropTypes from 'prop-types';
import './FeatureDisabledBanner.css';

/**
 * Banner shown when features are disabled pending API keys
 */
function FeatureDisabledBanner() {
  // ALL USERS GET FULL ACCESS - Never show disabled banner
  return null;
}

FeatureDisabledBanner.propTypes = {};

export default FeatureDisabledBanner;

/**
 * Inline feature blocker for specific components
 */
export function FeatureBlocker({ children }) {
  // ALL USERS GET FULL ACCESS - Feature locks disabled
  return children;
}

FeatureBlocker.propTypes = {
  children: PropTypes.node
};
