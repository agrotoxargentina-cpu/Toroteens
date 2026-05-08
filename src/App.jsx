import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { SetupPage } from './pages/SetupPage';
import { ScannerPage } from './pages/ScannerPage';
import { ConfigPage } from './pages/ConfigPage';
import { HistorialPage } from './pages/HistorialPage';

function RequireAuth({ children }) {
  const nombre = localStorage.getItem('guardaNombre');
  if (!nombre) return <Navigate to="/" replace />;
  return children;
}

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-svh">
      {children}
      <NavBar />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SetupPage />} />
        <Route
          path="/scanner"
          element={
            <RequireAuth>
              <Layout>
                <ScannerPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/config"
          element={
            <RequireAuth>
              <Layout>
                <ConfigPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/historial"
          element={
            <RequireAuth>
              <Layout>
                <HistorialPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
