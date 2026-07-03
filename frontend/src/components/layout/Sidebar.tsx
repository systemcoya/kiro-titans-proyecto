import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Calculator,
  Users,
  Bell,
  FileText,
  TrendingUp,
  Shield,
  PiggyBank,
  ShieldCheck,
  LayoutDashboard,
  Tags,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard Ejecutivo', path: '/executive', icon: <LayoutDashboard size={20} /> },
  { label: 'Gasto IA', path: '/ai-spend', icon: <BarChart3 size={20} /> },
  { label: 'Unit Economics', path: '/unit-economics', icon: <Calculator size={20} /> },
  { label: 'Showback', path: '/showback', icon: <Users size={20} /> },
  { label: 'Alertas', path: '/alerts', icon: <Bell size={20} /> },
  { label: 'MegaBill', path: '/megabill', icon: <FileText size={20} /> },
  { label: 'Simulador', path: '/simulator', icon: <TrendingUp size={20} /> },
  { label: 'Gobernanza', path: '/governance', icon: <Shield size={20} /> },
  { label: 'Self-Funding', path: '/self-funding', icon: <PiggyBank size={20} /> },
  { label: 'Costos Evitados', path: '/cost-avoidance', icon: <ShieldCheck size={20} /> },
  { label: 'Etiquetado', path: '/tagging', icon: <Tags size={20} /> },
  { label: 'Anomalías', path: '/anomalies', icon: <AlertTriangle size={20} /> },
];

/**
 * Barra lateral de navegación con enlaces a los 12 módulos del cockpit.
 * Responsiva: oculta en móvil con botón toggle, colapsable en desktop.
 */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Botón hamburguesa solo visible en móvil */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-md bg-card border border-border text-muted-foreground md:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Overlay para cerrar en móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col h-screen bg-card border-r border-border transition-all duration-200',
          // Desktop: estática con colapso
          'hidden md:flex',
          collapsed ? 'md:w-16' : 'md:w-64'
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onNavClick={() => setMobileOpen(false)}
        />
      </aside>

      {/* Sidebar móvil (drawer) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-card border-r border-border transition-transform duration-200 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Cockpit FinOps</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Navegación principal">
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )
                  }
                  title={item.label}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

/** Contenido interno del sidebar para desktop */
function SidebarContent({
  collapsed,
  onToggleCollapse,
  onNavClick,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavClick: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <span className="text-sm font-semibold text-foreground truncate">
            Cockpit FinOps
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2" aria-label="Navegación principal">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
                title={item.label}
              >
                {item.icon}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
