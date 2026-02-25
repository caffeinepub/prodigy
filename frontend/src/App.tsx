import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  redirect,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import BookDetail from './pages/BookDetail';
import Reader from './pages/Reader';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthorProfile from './pages/AuthorProfile';
import About from './pages/About';

// v2
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

// Root route with layout
const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  validateSearch: (search: Record<string, unknown>) => ({
    genre: typeof search.genre === 'string' ? search.genre : undefined,
  }),
  component: Browse,
});

const bookDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book/$bookId',
  component: BookDetail,
});

const readerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reader/$bookId',
  component: Reader,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
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

const authorProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/author/$authorName',
  component: AuthorProfile,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  bookDetailRoute,
  readerRoute,
  uploadRoute,
  dashboardRoute,
  adminRoute,
  authorProfileRoute,
  aboutRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
