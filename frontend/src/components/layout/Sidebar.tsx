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
 * Responsiva: colapsable en dispositivos móviles con botón de toggle.
 */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-card border-r border-border transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <span className="text-sm font-semibold text-foreground truncate">
            Cockpit FinOps
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
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
    </aside>
  );
}
