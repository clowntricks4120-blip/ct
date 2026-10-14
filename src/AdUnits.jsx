import React, { useEffect, useRef } from 'react';
import './AdUnits.css';

// Publisher-supplied ad codes. Do not sandbox or nest banner scripts in srcDoc.
const UNITS = {
  mobile: { key: 'bc7edf687d275b253a7333dee0bfb342', width: 320, height: 50 },
  desktop: { key: '3051c0543ae398e3c48f677e93512df6', width: 728, height: 90 },
  rectangle: { key: '02cbf7b4d5bbefd12651b02b34743b11', width: 300, height: 250 },
  wide: { key: '22c87d4152504ad9948f1523f17c1d0f', width: 468, height: 60 },
  skyscraper: { key: '506b399cbd35530fdc0b238b3eed7384', width: 160, height: 600 },
  halfskyscraper: { key: '685cf425d92cd14807a4f3825e665dfc', width: 160, height: 300 },
};
const NATIVE_KEY = 'b3ab22ebc0d9aee79ab8d96cdbc43c5a';

// The provider's banner code uses the global atOptions variable. Serialize
// initialization so two simultaneously mounted React placements do not clash.
let bannerQueue = Promise.resolve();
function queueBannerLoad(target, unit, isCancelled) {
  const run = () => new Promise(resolve => {
    if (isCancelled() || !target.isConnected) return resolve();
    window.atOptions = { key: unit.key, format: 'iframe', height: unit.height, width: unit.width, params: {} };
    const script = document.createElement('script');
    script.src = `https://bellnewyork.org/22/${unit.key}`;
    script.async = false;
    script.referrerPolicy = 'strict-origin-when-cross-origin';
    let finished = false;
    const finish = () => { if (!finished) { finished = true; clearTimeout(timeout); resolve(); } };
    script.onload = finish;
    script.onerror = finish;
    const timeout = setTimeout(finish, 12000);
    target.appendChild(script);
  });
  bannerQueue = bannerQueue.catch(() => {}).then(run);
}

function Banner({ type }) {
  const host = useRef(null);
  const unit = UNITS[type];
  useEffect(() => {
    if (!unit || !host.current) return;
    const element = host.current;
    let cancelled = false;
    queueBannerLoad(element, unit, () => cancelled);
    return () => { cancelled = true; element.replaceChildren(); };
  }, [unit]);
  if (!unit) return null;
  return <div ref={host} className="ct-ad-direct" style={{ width: unit.width, minHeight: unit.height, maxWidth: '100%' }} />;
}

function NativeAd() {
  const host = useRef(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const container = document.createElement('div');
    container.id = `container-${NATIVE_KEY}`;
    element.appendChild(container);
    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = `https://bellnewyork.org/21/${NATIVE_KEY}`;
    element.insertBefore(script, container);
    return () => { element.replaceChildren(); };
  }, []);
  return <div ref={host} className="ct-native-direct" />;
}

export default function AdSlot({ placement = 'general', type = 'rectangle' }) {
  if (import.meta.env.VITE_AD_SLOTS_ENABLED === 'false') return null;
  if (type === 'responsive') return <aside className="ct-ad-placement" aria-label="Advertisement" data-ad-placement={placement}><small>Advertisement</small><div className="ct-ad-desktop"><Banner type="desktop" /></div><div className="ct-ad-mobile"><Banner type="mobile" /></div></aside>;
  return <aside className="ct-ad-placement" aria-label="Advertisement" data-ad-placement={placement}><small>Advertisement</small>{type === 'native' ? <NativeAd /> : <Banner type={type} />}</aside>;
}
