import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PageSkeleton } from '@/components/layout/PageSkeleton';

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
      staleTime: 5 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/executive" replace />} />
                  <Route path="/executive" element={<ExecutivePage />} />
                  <Route path="/ai-spend" element={<AISpendPage />} />
                  <Route path="/unit-economics" element={<UnitEconomicsPage />} />
                  <Route path="/showback" element={<ShowbackPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/megabill" element={<MegaBillPage />} />
                  <Route path="/simulator" element={<SimulatorPage />} />
                  <Route path="/governance" element={<GovernancePage />} />
                  <Route path="/self-funding" element={<SelfFundingPage />} />
                  <Route path="/cost-avoidance" element={<CostAvoidancePage />} />
                  <Route path="/tagging" element={<TaggingPage />} />
                  <Route path="/anomalies" element={<AnomaliesPage />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
