import React from 'react';
import './AdUnits.css';

// Publisher-provided snippets. Each iframe owns its own `atOptions` global.
// Keep intrusive formats (popunder/social bar/smartlink) disabled by default.
const UNITS = {
  mobile: { key: 'bc7edf687d275b253a7333dee0bfb342', width: 320, height: 50 },
  desktop: { key: '3051c0543ae398e3c48f677e93512df6', width: 728, height: 90 },
  rectangle: { key: '02cbf7b4d5bbefd12651b02b34743b11', width: 300, height: 250 },
  wide: { key: '22c87d4152504ad9948f1523f17c1d0f', width: 468, height: 60 },
  skyscraper: { key: '506b399cbd35530fdc0b238b3eed7384', width: 160, height: 600 },
  halfskyscraper: { key: '685cf425d92cd14807a4f3825e665dfc', width: 160, height: 300 },
};
const NATIVE_KEY = 'b3ab22ebc0d9aee79ab8d96cdbc43c5a';

function Banner({ type }) {
  const unit = UNITS[type];
  if (!unit) return null;
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;overflow:hidden"><script>var atOptions=${JSON.stringify({ key: unit.key, format: 'iframe', height: unit.height, width: unit.width, params: {} })};</script><script src="https://bellnewyork.org/22/${unit.key}"></script></body></html>`;
  return <iframe title={`Advertisement ${type}`} className="ct-ad-frame" width={unit.width} height={unit.height} loading="lazy" sandbox="allow-scripts allow-popups" referrerPolicy="strict-origin-when-cross-origin" srcDoc={html} />;
}

function NativeAd() {
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;overflow:hidden"><script async data-cfasync="false" src="https://bellnewyork.org/21/${NATIVE_KEY}"></script><div id="container-${NATIVE_KEY}"></div></body></html>`;
  return <iframe title="Native advertisement" className="ct-native-frame" loading="lazy" sandbox="allow-scripts allow-popups" referrerPolicy="strict-origin-when-cross-origin" srcDoc={html} />;
}

export default function AdSlot({ placement = 'general', type = 'rectangle' }) {
  if (import.meta.env.VITE_AD_SLOTS_ENABLED === 'false') return null;
  if (type === 'responsive') return <aside className="ct-ad-placement" aria-label="Advertisement" data-ad-placement={placement}><small>Advertisement</small><div className="ct-ad-desktop"><Banner type="desktop" /></div><div className="ct-ad-mobile"><Banner type="mobile" /></div></aside>;
  return <aside className="ct-ad-placement" aria-label="Advertisement" data-ad-placement={placement}><small>Advertisement</small>{type === 'native' ? <NativeAd /> : <Banner type={type} />}</aside>;
}
