import { Line } from 'react-chartjs-2';

function CreatorAnalytics({ data }) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [{ label: 'Views', data: data.map(d => d.views), borderColor: 'purple' }],
  };

  return <Line data={chartData} />;
}

export default CreatorAnalytics;
