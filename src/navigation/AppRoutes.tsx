import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { PanelLayout } from '../layouts/PanelLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import {
  CompanyHomeScreen,
  CompanyLandingScreen,
  CompanySignUpScreen,
  LandingScreen,
  LoginScreen,
  MasterHomeScreen,
  PasswordRecoveryScreen,
} from '../screens';
import { RequireRole } from './RequireRole';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingScreen />} />
        </Route>

        <Route element={<PublicLayout audience="empresas" />}>
          <Route path="empresas" element={<CompanyLandingScreen />} />
          <Route path="login" element={<LoginScreen />} />
          <Route path="cadastro" element={<CompanySignUpScreen />} />
          <Route path="recuperar-senha" element={<PasswordRecoveryScreen />} />
        </Route>

        <Route element={<PanelLayout />}>
          <Route
            path="empresa"
            element={
              <RequireRole role="empresa">
                <CompanyHomeScreen />
              </RequireRole>
            }
          />
          <Route
            path="master"
            element={
              <RequireRole role="master">
                <MasterHomeScreen />
              </RequireRole>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
