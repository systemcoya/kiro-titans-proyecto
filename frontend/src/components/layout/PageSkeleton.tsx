/**
 * Skeleton de carga para páginas lazy-loaded.
 * Se muestra mientras React.lazy resuelve el módulo.
 */
export function PageSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="mt-2 h-4 w-72 bg-muted rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-lg" />
        </div>
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
