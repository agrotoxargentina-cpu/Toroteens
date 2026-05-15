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
      <NavBar />
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-6 py-6">
        {children}
      </div>
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
