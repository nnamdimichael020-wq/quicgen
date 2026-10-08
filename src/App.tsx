import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ToolPage from './pages/ToolPage';
import { AboutPage, HelpPage, NotFoundPage, PrivacyPage } from './pages/StaticPages';

export default function App() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' }));
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <Header/>
    <div id="main-content" tabIndex={-1}>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/about" element={<AboutPage/>}/>
        <Route path="/privacy" element={<PrivacyPage/>}/>
        <Route path="/help" element={<HelpPage/>}/>
        <Route path="/not-found" element={<NotFoundPage/>}/>
        <Route path="/:slug" element={<ToolPage/>}/>
        <Route path="*" element={<NotFoundPage/>}/>
      </Routes>
    </div>
    <Footer/>
  </>;
}
