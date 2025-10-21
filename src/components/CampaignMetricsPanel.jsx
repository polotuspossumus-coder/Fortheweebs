import React from 'react';

const Metric = ({ label, value }) => (
  <div className="metric-item">
    <span className="metric-label">{label}:</span>
    <span className="metric-value">{value}</span>
  </div>
);

const CampaignMetricsPanel = ({ campaign }) => (
  <div className="campaign-metrics-panel">
    <Metric label="Views" value={campaign.views} />
    <Metric label="Conversions" value={campaign.conversions} />
    <Metric label="Profit" value={`$${campaign.profit}`} />
  </div>
);

export default CampaignMetricsPanel;
