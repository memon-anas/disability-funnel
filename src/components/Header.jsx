import { SITE } from '../config/site.js';
export default function Header() {
  const r = SITE.rating;
  return (
    <header className="site-header">
      <a className="brand" href="/"><img src="/logo.svg" width="36" height="36" alt="" /><span>{SITE.brand}</span></a>
      <p className="trust">
        {r ? <><span className="stars" aria-hidden="true">★★★★★</span> <strong>{r.score}</strong> from {r.count.toLocaleString()} reviews on {r.source}</> : 'Private. Takes about 2 minutes.'}
      </p>
    </header>
  );
}
