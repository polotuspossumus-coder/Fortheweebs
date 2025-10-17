import { Graph } from 'react-d3-graph';

export default function RemixTree({ data }) {
  const config = {
    nodeHighlightBehavior: true,
    node: { color: 'purple', size: 300 },
    link: { highlightColor: 'indigo' },
  };

  return <Graph id="remixTree" data={data} config={config} />;
}
