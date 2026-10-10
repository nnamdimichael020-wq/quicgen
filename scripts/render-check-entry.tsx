import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '../src/context/ThemeContext';
import ToolPage from '../src/pages/ToolPage';
import HomePage from '../src/pages/HomePage';
import { BlogIndexPage, GuidePage, TopicsIndexPage, TopicPage } from '../src/pages/BlogPages';
import { AboutPage, HelpPage, PrivacyPage } from '../src/pages/StaticPages';
import { tools } from '../src/data/tools';
import { guides } from '../src/data/guides';
import { topics } from '../src/data/topics';

function renderAt(path: string, routePath: string, element: ReactElement): string {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <Routes>
          <Route path={routePath} element={element}/>
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

export function renderRoute(path: string): string {
  if (path === '/') return renderAt(path, '/', <HomePage/>);
  if (path === '/blog') return renderAt(path, '/blog', <BlogIndexPage/>);
  if (path.startsWith('/blog/')) return renderAt(path, '/blog/:slug', <GuidePage/>);
  if (path === '/topics') return renderAt(path, '/topics', <TopicsIndexPage/>);
  if (path.startsWith('/topics/')) return renderAt(path, '/topics/:slug', <TopicPage/>);
  if (path === '/about') return renderAt(path, '/about', <AboutPage/>);
  if (path === '/help') return renderAt(path, '/help', <HelpPage/>);
  if (path === '/privacy') return renderAt(path, '/privacy', <PrivacyPage/>);
  return renderAt(path, '/:slug', <ToolPage/>);
}

export function routeList(): string[] {
  return [
    '/',
    ...tools.map((tool) => `/${tool.slug}`),
    '/about', '/privacy', '/help', '/blog', '/topics',
    ...guides.map((guide) => `/blog/${guide.slug}`),
    ...topics.map((topic) => `/topics/${topic.slug}`),
  ];
}

export { tools };
