import { BrowserRouter, Route, Routes } from 'react-router';
import { LandingScreen } from '../screens';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
