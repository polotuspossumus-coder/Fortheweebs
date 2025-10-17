import { useEffect } from 'react';

export default function ImageEditor() {
  useEffect(() => {
    const iframe = document.getElementById('photopea');
    if (iframe) {
      iframe.onload = () => {
        iframe.contentWindow.postMessage({ type: 'open', url: '/sample.jpg' }, '*');
      };
    }
  }, []);

  return (
    <iframe
      id="photopea"
      src="https://www.photopea.com"
      width="100%"
      height="800px"
      title="Photopea Editor"
      style={{ border: 'none', borderRadius: '1rem', boxShadow: '0 2px 16px #38bdf8' }}
    />
  );
}
