import React, { useEffect, useMemo, useState } from 'react';
import { Clock, ExternalLink, Trash2, RefreshCcw } from 'lucide-react';
import Button from '../components/Button';
import '../styles/History.css';

const HISTORY_CACHE_KEY = 'verity.history.cache.v1';

function safeParseJSON(value, fallback) {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatDateTime(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const History = () => {
  const [items, setItems] = useState(() => {
    const cached = safeParseJSON(localStorage.getItem(HISTORY_CACHE_KEY), []);
    return Array.isArray(cached) ? cached : [];
  });
  const [isExtensionConnected, setIsExtensionConnected] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = new Date(a?.visitedAt || 0).getTime();
      const tb = new Date(b?.visitedAt || 0).getTime();
      return tb - ta;
    });
  }, [items]);

  const syncFromExtension = () => {
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.postMessage(
      { type: 'VERITY_HISTORY_REQUEST', source: 'verity-frontend', requestId },
      window.location.origin
    );
  };

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'VERITY_HISTORY_RESPONSE' && data.source === 'verity-extension') {
        setIsExtensionConnected(true);
        const incoming = Array.isArray(data.payload) ? data.payload : [];
        setItems(incoming);
        localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(incoming));
        setLastSyncAt(new Date().toISOString());
      }
    };

    window.addEventListener('message', onMessage);
    syncFromExtension();

    return () => window.removeEventListener('message', onMessage);
  }, []);

  const handleClear = () => {
    setItems([]);
    localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify([]));
  };

  return (
    <div className="page">
      <section className="history-hero">
        <div className="history-hero-header">
          <div className="history-title-row">
            <Clock className="history-icon" />
            <h1 className="page-title">History</h1>
          </div>
          <p className="page-subtitle">
            A timeline of domains analyzed by the Verity extension on your device.
          </p>
        </div>

        <div className="history-actions">
          <Button variant="secondary" onClick={syncFromExtension} className="history-action-btn">
            <RefreshCcw size={16} /> Sync from extension
          </Button>
          <Button variant="secondary" onClick={handleClear} className="history-action-btn">
            <Trash2 size={16} /> Clear cache
          </Button>
        </div>

        <div className="history-meta">
          <div className={`history-pill ${isExtensionConnected ? 'ok' : 'warn'}`}>
            {isExtensionConnected ? 'Extension connected' : 'Extension not detected (showing cached history)'}
          </div>
          {lastSyncAt && (
            <div className="history-pill subtle">
              Last sync: {formatDateTime(lastSyncAt)}
            </div>
          )}
        </div>
      </section>

      <section className="history-content">
        {sortedItems.length === 0 ? (
          <div className="history-empty">
            <h2>No history yet</h2>
            <p>
              Browse a few sites with the extension enabled, then come back here and hit “Sync from extension”.
            </p>
          </div>
        ) : (
          <div className="history-grid">
            {sortedItems.map((h, idx) => (
              <div className="history-card" key={`${h.domain || 'unknown'}-${h.visitedAt || idx}`}>
                <div className="history-card-top">
                  <div className="history-domain">{h.domain || 'Unknown domain'}</div>
                  <div className={`history-score ${h.score >= 80 ? 'high' : h.score >= 50 ? 'medium' : 'low'}`}>
                    {typeof h.score === 'number' ? h.score : '--'}
                    <span className="history-score-max">/100</span>
                  </div>
                </div>

                <div className="history-card-mid">
                  <div className="history-row">
                    <span className="history-label">Category</span>
                    <span className="history-value">{h.category || '—'}</span>
                  </div>
                  <div className="history-row">
                    <span className="history-label">Visited</span>
                    <span className="history-value">{h.visitedAt ? formatDateTime(h.visitedAt) : '—'}</span>
                  </div>
                  <div className="history-reason">{h.reason || '—'}</div>
                </div>

                <div className="history-card-bottom">
                  {h.url ? (
                    <a className="history-link" href={h.url} target="_blank" rel="noreferrer">
                      Open page <ExternalLink size={16} />
                    </a>
                  ) : (
                    <span className="history-link disabled">No URL saved</span>
                  )}
                  <div className={`history-badge ${h.apiVerified ? 'ok' : 'subtle'}`}>
                    {h.apiVerified ? 'API verified' : 'Local scoring'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default History;

