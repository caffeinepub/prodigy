import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
} from '@tanstack/react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Genres from './pages/Genres';
import Browse from './pages/Browse';
import BookDetail from './pages/BookDetail';
import Reader from './pages/Reader';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthorProfile from './pages/AuthorProfile';
import About from './pages/About';

// Root route with layout
const rootRoute = createRootRoute({
  component: Layout,
});

// Page routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const genresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/genres',
  component: Genres,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: Browse,
  validateSearch: (search: Record<string, unknown>) => ({
    genre: typeof search.genre === 'string' ? search.genre : undefined,
  }),
});

const bookDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book/$id',
  component: BookDetail,
});

const readerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reader/$id',
  component: Reader,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: Upload,
});

const uploadEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload/$bookId',
  component: Upload,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const authorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/author/$principal',
  component: AuthorProfile,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  genresRoute,
  browseRoute,
  bookDetailRoute,
  readerRoute,
  uploadRoute,
  uploadEditRoute,
  dashboardRoute,
  adminRoute,
  authorRoute,
  aboutRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
