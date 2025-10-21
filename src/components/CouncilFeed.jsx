import React, { useEffect, useState } from "react";
import "./CouncilFeed.css";

export default function CouncilFeed() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("/api/council-log")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  return (
    <section className="council-feed">
      <h2>🧠 AI Council Activity</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            <strong>{event.timestamp}</strong> — {event.type}: {event.details}
          </li>
        ))}
      </ul>
    </section>
  );
}
