import React from 'react';
import { useTrip } from '../context/TripContext';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Plane,
  FileText,
  DollarSign,
  Heart,
  Calendar,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { NotificationReminder } from '../types';

interface NotificationsModalProps {
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

const NOTIF_ICONS: Record<NotificationReminder['type'], React.ReactNode> = {
  document: <FileText className="w-4 h-4 text-[#D4A373]" />,
  flight: <Plane className="w-4 h-4 text-[#5A5A40]" />,
  payment: <DollarSign className="w-4 h-4 text-[#8A5A2B]" />,
  mailbox: <Heart className="w-4 h-4 text-[#D4A373]" />,
  countdown: <Calendar className="w-4 h-4 text-[#5A5A40]" />,
  reservation: <Sparkles className="w-4 h-4 text-[#D4A373]" />,
};

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  onClose,
  onNavigateTab,
}) => {
  const {
    trip,
    notificationPermission,
    requestNotificationPermission,
    markNotificationRead,
    clearAllNotifications,
  } = useTrip();

  const handleItemClick = (notif: NotificationReminder) => {
    markNotificationRead(notif.id);
    if (notif.targetTab) {
      onNavigateTab(notif.targetTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-[#FBF9F5] rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#E9EDC6] text-[#5A5A40]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#434338]">
                Centro de Notificaciones & Alertas
              </h3>
              <p className="text-xs text-[#737260]">
                Recordatorios de vuelos, documentos y gastos compartidos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8C8B79] hover:text-[#434338] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mt-4">
          {/* Web Push Notification Banner */}
          {notificationPermission !== 'granted' && (
            <div className="p-4 bg-[#FAF6E9] rounded-2xl border border-[#EBE3CD] space-y-2.5">
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <div className="text-xs text-[#434338]">
                  <strong>¿Activar Notificaciones Push?</strong> Reciban avisos en el móvil o navegador cuando su pareja anote un gasto, deje una carta o falte poco para el vuelo.
                </div>
              </div>
              <button
                onClick={requestNotificationPermission}
                className="w-full py-2 px-3 bg-[#5A5A40] hover:bg-[#434338] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Activar Notificaciones de Viaje
              </button>
            </div>
          )}

          {/* List of Notifications */}
          <div className="flex items-center justify-between text-xs text-[#737260] pt-1">
            <span>{trip.notifications.length} avisos</span>
            {trip.notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[#5A5A40] hover:text-[#434338] font-bold cursor-pointer underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {trip.notifications.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E0D5] text-[#737260]">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-[#8C8B79]" />
              <p className="text-xs font-bold text-[#434338] font-serif">¡Están al día!</p>
              <p className="text-[11px] text-[#737260] mt-0.5">
                No hay alertas ni recordatorios pendientes.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {trip.notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    notif.read
                      ? 'bg-white/60 border-[#E5E0D5] text-[#737260] opacity-75'
                      : 'bg-white border-[#D9D1B9] text-[#434338] shadow-xs ring-1 ring-[#5A5A40]/10'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[#F5F2ED] shrink-0">
                    {NOTIF_ICONS[notif.type] || <Bell className="w-4 h-4 text-[#D4A373]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-[#434338] truncate font-serif">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-[#8C8B79] shrink-0">
                        {new Date(notif.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#737260] mt-0.5 leading-relaxed">
                      {notif.body}
                    </p>
                    {notif.targetTab && (
                      <span className="inline-block text-[10px] font-bold text-[#5A5A40] mt-1">
                        Ir a la sección →
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
