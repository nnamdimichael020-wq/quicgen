import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Moon, ShieldCheck, Sun, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PrivacyDialog from './PrivacyDialog';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);

  return <>
    <header className="site-header">
      <div className="header-inner page-wrap">
        <Link to="/" className="brand" aria-label="QuicGen home" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true"><span>q</span><i/></span><span className="brand-name">Quic<span>Gen</span></span>
        </Link>
        <nav className={`main-nav ${mobileOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/#tools" onClick={closeMenu}>Explore tools</NavLink>
          <NavLink to="/help" onClick={closeMenu}>How it works</NavLink>
          <NavLink to="/about" onClick={closeMenu}>About</NavLink>
          <button className="nav-privacy mobile-privacy" onClick={() => { setPrivacyOpen(true); closeMenu(); }}><ShieldCheck size={16}/>Privacy first</button>
        </nav>
        <div className="header-actions">
          <button className="nav-privacy desktop-privacy" onClick={() => setPrivacyOpen(true)} title="Privacy & local data settings"><ShieldCheck size={16}/><span>Private by design</span></button>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <span className="theme-toggle-icon">{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</span><span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button className="mobile-menu icon-button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={21}/> : <Menu size={21}/>}
          </button>
        </div>
      </div>
    </header>
    <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
  </>;
}
