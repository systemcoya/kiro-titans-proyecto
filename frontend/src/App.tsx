import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

/**
 * Componente raíz de la aplicación con shell de layout y enrutamiento.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/executive" replace />} />
                <Route path="/executive" element={<Placeholder title="Dashboard Ejecutivo" />} />
                <Route path="/ai-spend" element={<Placeholder title="Gasto IA" />} />
                <Route path="/unit-economics" element={<Placeholder title="Unit Economics" />} />
                <Route path="/showback" element={<Placeholder title="Showback" />} />
                <Route path="/alerts" element={<Placeholder title="Alertas" />} />
                <Route path="/megabill" element={<Placeholder title="MegaBill" />} />
                <Route path="/simulator" element={<Placeholder title="Simulador What-If" />} />
                <Route path="/governance" element={<Placeholder title="Gobernanza" />} />
                <Route path="/self-funding" element={<Placeholder title="Self-Funding" />} />
                <Route path="/cost-avoidance" element={<Placeholder title="Costos Evitados" />} />
                <Route path="/tagging" element={<Placeholder title="Etiquetado" />} />
                <Route path="/anomalies" element={<Placeholder title="Anomalías" />} />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

/** Componente placeholder para rutas aún no implementadas */
function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">Módulo en construcción</p>
      </div>
    </div>
  );
}

export default App;
