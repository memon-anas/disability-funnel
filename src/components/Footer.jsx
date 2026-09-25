import { SITE } from '../config/site.js';
export default function Footer() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} {SITE.brand}</span>
      <nav aria-label="Legal"><a href={SITE.termsUrl} target="_blank" rel="noreferrer">Terms</a><a href={SITE.privacyUrl} target="_blank" rel="noreferrer">Privacy Policy</a></nav>
    </footer>
  );
}
