import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PostSuccessPrompt from './components/PostSuccessPrompt';
import { cancelPendingCalculationNotice } from './lib/utils';
const HomePage = lazy(() => import('./pages/HomePage'));
const ToolPage = lazy(() => import('./pages/ToolPage'));
const loadStaticPages = () => import('./pages/StaticPages');
const AboutPage = lazy(() => loadStaticPages().then((module) => ({ default: module.AboutPage })));
const HelpPage = lazy(() => loadStaticPages().then((module) => ({ default: module.HelpPage })));
const NotFoundPage = lazy(() => loadStaticPages().then((module) => ({ default: module.NotFoundPage })));
const PrivacyPage = lazy(() => loadStaticPages().then((module) => ({ default: module.PrivacyPage })));
const loadBlogPages = () => import('./pages/BlogPages');
const BlogIndexPage = lazy(() => loadBlogPages().then((module) => ({ default: module.BlogIndexPage })));
const GuidePage = lazy(() => loadBlogPages().then((module) => ({ default: module.GuidePage })));
const TopicPage = lazy(() => loadBlogPages().then((module) => ({ default: module.TopicPage })));
const TopicsIndexPage = lazy(() => loadBlogPages().then((module) => ({ default: module.TopicsIndexPage })));

export default function App() {
  const location = useLocation();
  useEffect(() => {
    cancelPendingCalculationNotice();
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
      <Suspense fallback={<div className="route-loading" role="status"><span className="loading-spinner"/>Opening your page…</div>}>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/about" element={<AboutPage/>}/>
        <Route path="/privacy" element={<PrivacyPage/>}/>
        <Route path="/help" element={<HelpPage/>}/>
        <Route path="/blog" element={<BlogIndexPage/>}/>
        <Route path="/blog/:slug" element={<GuidePage/>}/>
        <Route path="/topics" element={<TopicsIndexPage/>}/>
        <Route path="/topics/:slug" element={<TopicPage/>}/>
        <Route path="/not-found" element={<NotFoundPage/>}/>
        <Route path="/:slug" element={<ToolPage/>}/>
        <Route path="*" element={<NotFoundPage/>}/>
      </Routes>
      </Suspense>
    </div>
    <PostSuccessPrompt/>
    <Footer/>
  </>;
}
