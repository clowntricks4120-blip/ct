import React, { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import './AdBlockGate.css';

const ADMIN_PATH = '/control-portal-ct';

/**
 * A local bait check detects cosmetic filtering, not every ad blocker.
 * Never use an ad-network request as the sole signal: network failures and
 * unfilled ad inventory do not imply blocking.
 */
function checkCosmeticBlocking() {
  return new Promise((resolve) => {
    const bait = document.createElement('div');
    bait.className = 'adsbox ad-banner ad-unit text-ad';
    bait.setAttribute('aria-hidden', 'true');
    bait.style.cssText = 'position:absolute!important;left:-10000px!important;top:0!important;width:10px!important;height:10px!important;pointer-events:none!important;';
    document.body.appendChild(bait);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          const style = window.getComputedStyle(bait);
          const rect = bait.getBoundingClientRect();
          resolve(style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0);
        } catch {
          resolve(false);
        } finally {
          bait.remove();
        }
      });
    });
  });
}

export default function AdBlockGate({ children }) {
  const [status, setStatus] = useState('checking');
  const [attempt, setAttempt] = useState(0);
  const admin = window.location.pathname === ADMIN_PATH ||
    window.location.pathname.startsWith(ADMIN_PATH + '/');

  const retry = useCallback(() => {
    setStatus('checking');
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    if (admin) return;
    let cancelled = false;
    checkCosmeticBlocking()
      .then((blocked) => { if (!cancelled) setStatus(blocked ? 'blocked' : 'allowed'); })
      .catch(() => { if (!cancelled) setStatus('allowed'); });
    return () => { cancelled = true; };
  }, [admin, attempt]);

  if (admin || status === 'allowed') return children;

  return (
    <div className="ct-gate-screen">
      <section className="ct-gate-card" role="status" aria-live="polite">
        <div className="ct-gate-icon"><ShieldAlert size={30} aria-hidden="true" /></div>
        {status === 'checking' ? (
          <>
            <h1>Checking your browser</h1>
            <p>Please wait a moment…</p>
            <div className="ct-gate-spinner" aria-label="Checking" />
          </>
        ) : (
          <>
            <h1>Ad Blocker Detected</h1>
            <p>Advertisements help keep Clown Tricks free. Please disable ad blocking for this website, then try again.</p>
            <button type="button" className="ct-gate-retry" onClick={retry}>
              <RefreshCw size={18} aria-hidden="true" />
              I've Disabled Ad Blocker — Retry
            </button>
            <small>If you already disabled it, check your browser's built-in protection or DNS filtering and retry.</small>
          </>
        )}
      </section>
    </div>
  );
}
