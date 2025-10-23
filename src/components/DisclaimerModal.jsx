import React from "react";

/**
 * Modal disclaimer for content ratings and parental opt-in.
 * @param onAccept - Callback when user accepts the disclaimer
 */
export default function DisclaimerModal({ onAccept }) {
  return (
    <div className="modal disclaimer-modal">
      <p>
        Fortheweebs includes content across all ratings. <br />
        <strong>Adult access requires parental opt-in.</strong>
      </p>
      <button onClick={onAccept}>I Understand</button>
    </div>
  );
}
