import { createBrowserRouter } from 'react-router';
import { HomePage } from '@page/HomePage';
import { StyleguidePage } from '@page/StyleguidePage';

// `/styleguide` n'existe qu'en développement.
const developmentRoutes = import.meta.env.DEV
  ? [{ path: '/styleguide', element: <StyleguidePage /> }]
  : [];

export const router = createBrowserRouter(
  [{ path: '/', element: <HomePage /> }, ...developmentRoutes],
  { basename: import.meta.env.BASE_URL },
);
