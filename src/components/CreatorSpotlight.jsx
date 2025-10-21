import React from 'react';

const CreatorSpotlight = ({ creator, broadcastRitual }) => (
  <div className="creator-spotlight-card">
    <img className="avatar" src={creator.image} alt={creator.name} />
    <h3 className="title">{creator.name}</h3>
    <span className={`badge badge-${creator.tier}`}>{creator.tier}</span>
    <div className="metrics">
      {Object.entries(creator.metrics || {}).map(([key, value]) => (
        <div key={key} className="metric">
          <strong>{key}:</strong> {value}
        </div>
      ))}
    </div>
    <button className="ritual-btn" onClick={broadcastRitual}>Drop Ritual</button>
  </div>
);

export default CreatorSpotlight;
