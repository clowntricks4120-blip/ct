import React, { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import './AdBlockGate.css';

const ADMIN_PATH = '/control-portal-ct';

// Cosmetic blocking test. This cannot reliably identify every browser, DNS,
// extension, or network-level blocker. A blocked ad request alone is not proof.
function checkOnce() {
  return new Promise((resolve) => {
    const names = ['adsbox ad-banner ad-unit', 'advertisement ad-container'];
    const baits = names.map((className) => {
      const el = document.createElement('div');
      el.className = className;
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:absolute;left:-9999px;top:0;width:12px;height:12px;pointer-events:none;';
      document.body.appendChild(el);
      return el;
    });
    // Give filter styles time to apply before measuring.
    window.setTimeout(() => {
      let blocked = false;
      try {
        blocked = baits.some((el) => {
          if (!el.isConnected) return true;
          const cs = window.getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return cs.display === 'none' || cs.visibility === 'hidden' ||
            cs.opacity === '0' || r.width === 0 || r.height === 0;
        });
      } catch {
        blocked = false; // Fail open on browser errors, not as proof of blocking.
      } finally {
        baits.forEach((el) => el.remove());
      }
      resolve(blocked);
    }, 300);
  });
}

async function checkAdBlocking() {
  // Two passes reduce transient false negatives; neither is conclusive.
  const first = await checkOnce();
  if (first) return true;
  return checkOnce();
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
    checkAdBlocking()
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
          <><h1>Checking your browser</h1><p>Please wait a moment…</p><div className="ct-gate-spinner" aria-label="Checking" /></>
        ) : (
          <>
            <h1>Ad Blocker Detected</h1>
            <p>Advertisements help keep Clown Tricks free. Please disable ad blocking for this website, then try again.</p>
            <button type="button" className="ct-gate-retry" onClick={retry}>
              <RefreshCw size={18} aria-hidden="true" /> I've Disabled Ad Blocker — Retry
            </button>
            <small>If you already disabled it, check your browser's built-in protection or DNS filtering and retry.</small>
          </>
        )}
      </section>
    </div>
  );
}
