import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, ShieldCheck } from 'lucide-react';
import { tools } from '../data/tools';

export default function Footer() {
  return <footer className="site-footer">
    <div className="footer-inner page-wrap">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Link to="/" className="brand" aria-label="QuicGen home"><span className="brand-mark" aria-hidden="true"><span>q</span><i/></span><span className="brand-name">Quic<span>Gen</span></span></Link>
          <p>Useful little tools.<br/>Thoughtfully made. Completely private.</p>
          <span className="footer-privacy"><ShieldCheck size={14}/>Your work never leaves your device</span>
        </div>
        <div className="footer-link-group"><strong>Popular tools</strong>{tools.slice(0, 5).map((tool) => <Link key={tool.slug} to={`/${tool.slug}`}>{tool.title}</Link>)}</div>
        <div className="footer-link-group"><strong>Explore</strong><Link to="/#tools">All tools</Link><Link to="/blog">Blog &amp; guides</Link><Link to="/topics">Browse topics</Link><Link to="/help">Help center</Link><Link to="/about">About QuicGen</Link></div>
        <div className="footer-link-group"><strong>Trust &amp; transparency</strong><Link to="/privacy">Privacy policy</Link><Link to="/help#privacy">Your data, explained</Link><Link to="/about">Our principles <ArrowUpRight size={13}/></Link></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} QuicGen. Free tools, no strings attached.</span><span>Made with <Heart size={13} fill="currentColor"/> for the little things.</span></div>
    </div>
  </footer>;
}
