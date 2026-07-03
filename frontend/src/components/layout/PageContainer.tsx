import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

/**
 * Contenedor de página con padding, max-width y diseño responsivo.
 * Provee estructura consistente para todas las páginas del cockpit.
 */
export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
