/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import React from 'react';
import PropTypes from 'prop-types';
import './FeatureDisabledBanner.css';

/**
 * Banner shown when features are disabled pending API keys
 */
function FeatureDisabledBanner({ features }) {
  // ALL USERS GET FULL ACCESS - Never show disabled banner
  return null;
}

FeatureDisabledBanner.propTypes = {
  features: PropTypes.array
};

export default FeatureDisabledBanner;

/**
 * Inline feature blocker for specific components
 */
export function FeatureBlocker({ feature, features, children }) {
  // ALL USERS GET FULL ACCESS - Feature locks disabled
  return children;
}

FeatureBlocker.propTypes = {
  feature: PropTypes.string,
  features: PropTypes.array,
  children: PropTypes.node
};
