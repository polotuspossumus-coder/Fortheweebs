function ValidatorTimeline({ logs }) {
  return (
    <ul className="timeline">
      {logs.map((log, i) => (
        <li key={i}>
          <strong>{log.action}</strong> by {log.userId} at {new Date(log.timestamp).toLocaleString()}
        </li>
      ))}
    </ul>
  );
}

export default ValidatorTimeline;
