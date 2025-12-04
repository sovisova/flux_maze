import { Download } from 'lucide-react';

export function DownloadSessionButton() {
  // Hide in production - check at render time
  if (import.meta.env.PROD) {
    return null;
  }

  const handleDownload = () => {
    const session = window.__RRWEB_SESSION__;

    if (!session) {
      console.warn('No session data available to download');
      return;
    }

    const { sessionId, startedAt, events } = session;
    const data = {
      sessionId,
      startedAt,
      events,
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${sessionId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Use inline styles as fallback to ensure visibility
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 999999,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '9999px',
    background: 'linear-gradient(to right, #7c3aed, #4f46e5)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  };

  return (
    <button
      onClick={handleDownload}
      style={buttonStyle}
      title="Download session recording"
    >
      <Download style={{ width: '16px', height: '16px' }} />
      <span>Download Session</span>
    </button>
  );
}

export default DownloadSessionButton;

