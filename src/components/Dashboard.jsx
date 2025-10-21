import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Fortheweebs Sovereign Panel</h1>
      <nav>
        <ul>
          <li><Link to="/payment">Payment Panel</Link></li>
          <li><Link to="/ban">Ban Dashboard</Link></li>
          <li><Link to="/graveyard">Graveyard</Link></li>
          <li><Link to="/governance">Governance</Link></li>
          <li><Link to="/campaigns">Campaigns</Link></li>
          <li><Link to="/ledger">Ledger</Link></li>
        </ul>
      </nav>
    </div>
  );
}
