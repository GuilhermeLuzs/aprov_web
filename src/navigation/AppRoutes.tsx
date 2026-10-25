import { BrowserRouter, Route, Routes } from 'react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { LandingScreen } from '../screens';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
