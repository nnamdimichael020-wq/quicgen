import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, ShieldCheck, Sun, X } from 'lucide-react';
import { categories, tools } from '../data/tools';
import { useTheme } from '../context/ThemeContext';
import PrivacyDialog from './PrivacyDialog';
import ToolSearch from './ToolSearch';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const closeMenu = () => setMobileOpen(false);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('.site-header .tool-search-input')?.focus();
      } else if (event.key === '/' && !isTyping) {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('.site-header .tool-search-input')?.focus();
      } else if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close the dropdown panel when clicking outside the header, so desktop and mobile
  // both get a natural dismiss without leaving an empty-looking overlay.
  useEffect(() => {
    if (!mobileOpen) return;
    const onDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && headerRef.current?.contains(target)) return;
      setMobileOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true } as AddEventListenerOptions);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [mobileOpen]);

  const toggleLabel = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
  const themeButton = (compact = false) => <button
    type="button"
    className={`theme-toggle ${compact ? 'mobile-theme-toggle' : ''}`}
    onClick={toggleTheme}
    aria-label={toggleLabel}
    title={toggleLabel}
  >
    <span className="theme-toggle-icon">{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</span>
    <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
  </button>;

  return <>
    <header ref={headerRef} className="site-header">
      <div className="header-inner page-wrap">
        <Link to="/" className="brand" aria-label="QuicGen home" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true"><span>q</span><i/></span><span className="brand-name">Quic<span>Gen</span></span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/#tools">Explore tools</NavLink>
          <NavLink to="/blog">Blog &amp; guides</NavLink>
          <NavLink to="/help">How it works</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        <ToolSearch onSelect={closeMenu}/>
        <div className="header-actions">
          <button type="button" className="nav-privacy desktop-privacy" onClick={() => setPrivacyOpen(true)} title="Privacy & local data settings"><ShieldCheck size={16}/><span>Private by design</span></button>
          {themeButton()}
          <button type="button" className="mobile-menu icon-button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? 'Close tools and site menu' : 'Open tools and site menu'} aria-expanded={mobileOpen} aria-controls="mobile-site-menu">
            {mobileOpen ? <X size={21}/> : <Menu size={21}/>}
          </button>
        </div>
      </div>
      <div id="mobile-site-menu" className={`mobile-menu-panel ${mobileOpen ? 'mobile-menu-panel-open' : ''}`} aria-hidden={!mobileOpen} inert={!mobileOpen ? true : undefined}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-utility">
            <span className="mobile-menu-heading">QUICGEN — FULL MENU</span>
            <div className="mobile-menu-utility-actions">
              {themeButton(true)}
              <button type="button" className="mobile-menu-privacy" onClick={() => { setPrivacyOpen(true); closeMenu(); }}><ShieldCheck size={16}/> Privacy settings</button>
            </div>
          </div>
          <div className="mobile-menu-primary-links" aria-label="Pages">
            <Link to="/blog" onClick={closeMenu}>Blog &amp; guides</Link>
            <Link to="/topics" onClick={closeMenu}>Browse topics</Link>
            <Link to="/help" onClick={closeMenu}>Help / How it works</Link>
            <Link to="/about" onClick={closeMenu}>About QuicGen</Link>
            <Link to="/privacy" onClick={closeMenu}>Privacy policy</Link>
          </div>
          <div className="mobile-menu-tools" aria-label="All tools by category">
            <div className="mobile-menu-tools-heading"><strong>All tools</strong><Link to="/#tools" onClick={closeMenu}>Browse the toolbox <span aria-hidden="true">→</span></Link></div>
            {categories.map((category) => {
              const categoryTools = tools.filter((tool) => tool.category === category.name);
              if (!categoryTools.length) return null;
              return <section className="mobile-menu-category" key={category.name}>
                <h2>{category.name}</h2>
                <div>{categoryTools.map((tool) => {
                  const Icon = tool.icon;
                  return <Link to={`/${tool.slug}`} key={tool.slug} onClick={closeMenu}>
                    <span className={`mobile-menu-tool-icon accent-${tool.accent}`}><Icon size={15}/></span><span>{tool.title}</span>
                  </Link>;
                })}</div>
              </section>;
            })}
          </div>
        </div>
      </div>
    </header>
    <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
  </>;
}
