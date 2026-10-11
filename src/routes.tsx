import { createBrowserRouter } from 'react-router';
import { HomePage } from '@page/HomePage';

export const router = createBrowserRouter(
  [{ path: '/', element: <HomePage /> }],
  { basename: import.meta.env.BASE_URL },
);
