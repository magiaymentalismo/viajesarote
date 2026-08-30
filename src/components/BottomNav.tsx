import React from 'react';
import { ActiveTab } from './CountdownHeader';
import { useTrip } from '../context/TripContext';
import {
  Route,
  Receipt,
  MapPin,
  Luggage,
  Heart,
  Calendar,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenPartnerModal?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { trip, activePartnerId } = useTrip();

  // Badges calculation
  const pendingExpensesCount = trip.expenses.filter(e => e.status === 'pendiente').length;
  const unreadMessagesCount = trip.messages.filter(
    m => !m.isRead && m.toPartnerId === activePartnerId
  ).length;
  const uncompletedTasksCount = trip.tasks.filter(t => !t.completed).length;

  const navItems: {
    id: ActiveTab;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'itinerario',
      label: 'Itinerario',
      shortLabel: 'Itinerario',
      icon: <Route className="w-5 h-5" />,
      badge: trip.cities.length > 0 ? trip.cities.length : undefined,
    },
    {
      id: 'gastos',
      label: 'Gastos & Cuentas',
      shortLabel: 'Gastos',
      icon: <Receipt className="w-5 h-5" />,
      badge: pendingExpensesCount > 0 ? pendingExpensesCount : undefined,
    },
    {
      id: 'sitios',
      label: 'Sitios & Mapa',
      shortLabel: 'Sitios',
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      id: 'equipaje-docs',
      label: 'Equipaje & Docs',
      shortLabel: 'Equipaje',
      icon: <Luggage className="w-5 h-5" />,
      badge: uncompletedTasksCount > 0 ? uncompletedTasksCount : undefined,
    },
    {
      id: 'buzon',
      label: 'Recuerdos & Buzón',
      shortLabel: 'Recuerdos',
      icon: <Heart className="w-5 h-5" />,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Barra de Navegación Principal"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#F5F2ED]/95 backdrop-blur-xl border-t border-[#D9D1B9] px-2 sm:px-6 py-2 shadow-[0_-4px_24px_rgba(67,67,56,0.08)] transition-all"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around gap-1">
        {navItems.map(item => {
          const isActive =
            activeTab === item.id || (item.id === 'buzon' && activeTab === 'galeria');
          return (
            <button
              key={item.id}
              id={`btn-bottom-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 sm:px-3 rounded-2xl transition-all duration-200 cursor-pointer min-h-[48px] ${
                isActive
                  ? 'bg-[#5A5A40] text-white shadow-md shadow-[#5A5A40]/25 scale-100'
                  : 'text-[#737260] hover:text-[#434338] hover:bg-[#E9E5D9]/60'
              }`}
            >
              {/* Icon with relative badge */}
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2 px-1.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-black rounded-full border ${
                      isActive
                        ? 'bg-[#D4A373] text-white border-white'
                        : 'bg-[#5A5A40] text-white border-[#F5F2ED]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-bold mt-1 tracking-tight truncate max-w-full ${
                  isActive ? 'text-white' : 'text-[#5A5A40]'
                }`}
              >
                {item.shortLabel}
              </span>

              {/* Little Active indicator dot on mobile */}
              {isActive && (
                <span className="w-1 h-1 bg-[#E9EDC6] rounded-full absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
