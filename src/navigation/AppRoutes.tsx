import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { PanelLayout } from '../layouts/PanelLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import {
  CompanySignUpScreen,
  LandingScreen,
  LoginScreen,
  PasswordRecoveryScreen,
} from '../screens';
import { RequireRole } from './RequireRole';

const CompanyLandingScreen = lazy(() => import('../screens/Public/CompanyLanding/CompanyLandingScreen'));
const CompanyOverviewScreen = lazy(() => import('../screens/Company/Overview/CompanyOverviewScreen'));
const CatalogScreen = lazy(() => import('../screens/Company/Catalog/CatalogScreen'));
const ItemFormScreen = lazy(() => import('../screens/Company/Catalog/ItemFormScreen'));
const CoinsScreen = lazy(() => import('../screens/Company/Coins/CoinsScreen'));
const CouponsScreen = lazy(() => import('../screens/Company/Coupons/CouponsScreen'));
const MasterOverviewScreen = lazy(() => import('../screens/Master/Overview/MasterOverviewScreen'));
const AccountSearchScreen = lazy(() => import('../screens/Master/Search/AccountSearchScreen'));
const CustomerAccountScreen = lazy(() => import('../screens/Master/Search/CustomerAccountScreen'));
const CompanyAccountScreen = lazy(() => import('../screens/Master/Search/CompanyAccountScreen'));

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingScreen />} />
        </Route>

        <Route element={<PublicLayout audience="empresas" />}>
          <Route
            path="empresas"
            element={
              <Suspense fallback={null}>
                <CompanyLandingScreen />
              </Suspense>
            }
          />
          <Route path="login" element={<LoginScreen />} />
          <Route path="cadastro" element={<CompanySignUpScreen />} />
          <Route path="recuperar-senha" element={<PasswordRecoveryScreen />} />
        </Route>

        <Route element={<PanelLayout />}>
          <Route
            path="empresa"
            element={
              <RequireRole role="empresa">
                <Suspense fallback={null}>
                  <CompanyOverviewScreen />
                </Suspense>
              </RequireRole>
            }
          />
          <Route
            path="empresa/catalogo"
            element={
              <RequireRole role="empresa">
                <Suspense fallback={null}>
                  <CatalogScreen />
                </Suspense>
              </RequireRole>
            }
          />
          {['empresa/catalogo/novo/:kind', 'empresa/catalogo/:id/editar'].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <RequireRole role="empresa">
                  <Suspense fallback={null}>
                    <ItemFormScreen />
                  </Suspense>
                </RequireRole>
              }
            />
          ))}
          <Route
            path="empresa/moedas"
            element={
              <RequireRole role="empresa">
                <Suspense fallback={null}>
                  <CoinsScreen />
                </Suspense>
              </RequireRole>
            }
          />
          <Route
            path="empresa/cupons"
            element={
              <RequireRole role="empresa">
                <Suspense fallback={null}>
                  <CouponsScreen />
                </Suspense>
              </RequireRole>
            }
          />
          <Route
            path="master"
            element={
              <RequireRole role="master">
                <Suspense fallback={null}>
                  <MasterOverviewScreen />
                </Suspense>
              </RequireRole>
            }
          />
          <Route
            path="master/busca"
            element={
              <RequireRole role="master">
                <Suspense fallback={null}>
                  <AccountSearchScreen />
                </Suspense>
              </RequireRole>
            }
          />
          <Route
            path="master/busca/clientes/:id"
            element={
              <RequireRole role="master">
                <Suspense fallback={null}>
                  <CustomerAccountScreen />
                </Suspense>
              </RequireRole>
            }
          />
          <Route
            path="master/busca/empresas/:id"
            element={
              <RequireRole role="master">
                <Suspense fallback={null}>
                  <CompanyAccountScreen />
                </Suspense>
              </RequireRole>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
