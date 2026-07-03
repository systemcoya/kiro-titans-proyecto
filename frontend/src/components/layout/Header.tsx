import { Activity } from 'lucide-react';

/**
 * Encabezado de la aplicación con título y área de usuario.
 * Muestra el branding "Rastreador de Costos IA — Cockpit Estratégico".
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-6 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <Activity size={22} className="text-primary" />
        <h1 className="text-base font-semibold text-foreground">
          FiNNova AI — Gestión Estratégica de Costos
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-medium text-primary-foreground">SB</span>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Estrategia Tecnológica
          </span>
        </div>
      </div>
    </header>
  );
}
