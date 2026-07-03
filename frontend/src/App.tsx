import { lazy, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

/** Error boundary to prevent white screen crashes */
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <p className="text-red-600 font-medium">Error al cargar el módulo</p>
          <p className="text-sm text-gray-500 mt-2">{this.state.error}</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="mt-4 px-4 py-2 border rounded hover:bg-gray-100 text-sm">Recargar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy-loaded feature pages
const ExecutivePage = lazy(() => import('@/features/executive/ExecutivePage'));
const AISpendPage = lazy(() => import('@/features/ai-spend/AISpendPage'));
const UnitEconomicsPage = lazy(() => import('@/features/unit-economics/UnitEconomicsPage'));
const ShowbackPage = lazy(() => import('@/features/showback/ShowbackPage'));
const AlertsPage = lazy(() => import('@/features/alerts/AlertsPage'));
const MegaBillPage = lazy(() => import('@/features/megabill/MegaBillPage'));
const SimulatorPage = lazy(() => import('@/features/simulator/SimulatorPage'));
const GovernancePage = lazy(() => import('@/features/governance/GovernancePage'));
const SelfFundingPage = lazy(() => import('@/features/self-funding/SelfFundingPage'));
const CostAvoidancePage = lazy(() => import('@/features/cost-avoidance/CostAvoidancePage'));
const TaggingPage = lazy(() => import('@/features/tagging/TaggingPage'));
const AnomaliesPage = lazy(() => import('@/features/anomalies/AnomaliesPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

/** Loading fallback for lazy-loaded pages. */
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-muted-foreground">Cargando módulo...</div>
    </div>
  );
}

/**
 * Root application component with layout shell and routing.
 * All feature pages are lazy-loaded for code splitting.
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
              <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/executive" replace />} />
                  <Route path="/executive" element={<ExecutivePage />} />
                  <Route path="/ai-spend" element={<AISpendPage />} />
                  <Route path="/showback" element={<ShowbackPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/simulator" element={<SimulatorPage />} />
                </Routes>
              </Suspense>
              </ErrorBoundary>
            </main>
          </div>
        </div>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
