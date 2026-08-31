import React, { useState, useRef } from 'react';
import { useTrip } from '../context/TripContext';
import {
  Compass,
  Heart,
  Plus,
  Share2,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronDown,
  Users,
  Check,
  Download,
  Upload,
  KeyRound,
  Edit3,
} from 'lucide-react';
import { PartnerId } from '../types';

interface NavbarProps {
  onOpenNewTripModal: () => void;
  onOpenShareModal: () => void;
  onOpenNotificationsModal: () => void;
  onOpenEditTripModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTripModal,
  onOpenShareModal,
  onOpenNotificationsModal,
  onOpenEditTripModal,
}) => {
  const {
    trip,
    activePartnerId,
    setActivePartnerId,
    isOnline,
    isSyncing,
    exportTripJson,
    importTripJson,
  } = useTrip();

  const [isTripMenuOpen, setIsTripMenuOpen] = useState(false);
  const [isPartnerMenuOpen, setIsPartnerMenuOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePartner = trip.partners.find(p => p.id === activePartnerId) || trip.partners[0];
  const unreadNotifsCount = trip.notifications.filter(n => !n.read).length;

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importTripJson(content);
        if (success) {
          setImportStatus('¡Viaje importado correctamente!');
          setTimeout(() => {
            setImportStatus(null);
            setIsTripMenuOpen(false);
          }, 1500);
        } else {
          setImportStatus('Archivo JSON no válido.');
          setTimeout(() => setImportStatus(null), 3000);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F5F2ED]/95 backdrop-blur-md border-b border-[#D9D1B9] shadow-xs pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#5A5A40] text-white border-2 border-white shadow-sm">
              <Compass className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D4A373] rounded-full ring-2 ring-white" />
            </div>

            {/* Private Trip Details & Menu */}
            <div className="relative">
              <button
                id="btn-trip-selector"
                onClick={() => setIsTripMenuOpen(!isTripMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-left hover:bg-[#E9E5D9]/60 transition-colors group cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-widest flex items-center gap-1">
                    Viaje Privado • <span className="font-mono text-[#5A5A40]">{trip.inviteCode || 'ACTIVO'}</span>
                  </span>
                  <span className="text-sm font-serif font-bold text-[#434338] flex items-center gap-1.5 truncate max-w-[150px] sm:max-w-[240px]">
                    {trip.title}
                    <ChevronDown className="w-3.5 h-3.5 text-[#5A5A40] group-hover:translate-y-0.5 transition-transform" />
                  </span>
                </div>
              </button>

              {isTripMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-80 bg-white rounded-3xl shadow-xl border border-[#D9D1B9] p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-2 bg-[#FAF6E9] rounded-2xl border border-[#EBE3CD] mb-2">
                    <div className="text-[10px] font-bold text-[#D4A373] uppercase tracking-widest">
                      Viaje Actual
                    </div>
                    <div className="text-sm font-bold text-[#434338] font-serif truncate">
                      {trip.title}
                    </div>
                    <div className="text-xs text-[#737260] font-mono mt-0.5">
                      Código: <span className="font-bold text-[#5A5A40]">{trip.inviteCode}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <button
                      onClick={() => {
                        setIsTripMenuOpen(false);
                        onOpenShareModal();
                      }}
                      className="w-full text-left px-3 py-2 text-[#434338] hover:bg-[#F9F8F4] font-medium rounded-xl flex items-center gap-2.5 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-[#D4A373]" />
                      <span>Compartir enlace con mi pareja</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsTripMenuOpen(false);
                        onOpenEditTripModal();
                      }}
                      className="w-full text-left px-3 py-2 text-[#434338] hover:bg-[#F9F8F4] font-medium rounded-xl flex items-center gap-2.5 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-[#5A5A40]" />
                      <span>Editar detalles de este viaje</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsTripMenuOpen(false);
                        onOpenNewTripModal();
                      }}
                      className="w-full text-left px-3 py-2 text-[#434338] hover:bg-[#F9F8F4] font-medium rounded-xl flex items-center gap-2.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#5A5A40]" />
                      <span>Crear un nuevo viaje privado</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsTripMenuOpen(false);
                        onOpenShareModal();
                      }}
                      className="w-full text-left px-3 py-2 text-[#434338] hover:bg-[#F9F8F4] font-medium rounded-xl flex items-center gap-2.5 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-[#5A5A40]" />
                      <span>Unirme a otro viaje con código</span>
                    </button>

                    <div className="border-t border-[#EFEDE7] my-1 pt-1">
                      <button
                        onClick={() => {
                          exportTripJson();
                          setIsTripMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[#5A5A40] hover:bg-[#F9F8F4] rounded-xl flex items-center gap-2.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[#5A5A40]" />
                        <span>Descargar copia de seguridad (.json)</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full text-left px-3 py-2 text-[#5A5A40] hover:bg-[#F9F8F4] rounded-xl flex items-center gap-2.5 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-[#5A5A40]" />
                        <span>Restaurar viaje desde archivo</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                    </div>

                    {importStatus && (
                      <div className="p-2 text-center text-xs font-bold text-[#5A5A40] bg-[#E9EDC6] rounded-xl">
                        {importStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync & Real-time Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                !isOnline
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : isSyncing
                  ? 'bg-[#E9E5D9] text-[#434338] border border-[#D9D1B9]'
                  : 'bg-[#5A5A40] text-white shadow-xs'
              }`}
              title={
                !isOnline
                  ? 'Modo Offline: Los datos están guardados en tu dispositivo'
                  : 'Sincronizado en la nube'
              }
            >
              {!isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Modo Offline</span>
                </>
              ) : isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#5A5A40] animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#E9EDC6] animate-pulse" />
                  <span>En línea</span>
                </>
              )}
            </div>

            {/* Active Partner Switcher (Interactive Persona) */}
            <div className="relative">
              <button
                id="btn-active-partner-switcher"
                onClick={() => setIsPartnerMenuOpen(!isPartnerMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D9D1B9] bg-white hover:bg-[#F9F8F4] transition-colors text-xs font-semibold cursor-pointer shadow-xs"
                title="Cambiar quién está usando la app ahora"
              >
                <span className="text-base leading-none">{activePartner.avatarEmoji}</span>
                <span className="hidden md:inline text-[#737260]">Modo:</span>
                <span className="font-bold text-[#434338] truncate max-w-[80px]">
                  {activePartner.name}
                </span>
                <ChevronDown className="w-3 h-3 text-[#737260]" />
              </button>

              {isPartnerMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#D9D1B9] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsPartnerMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    ¿Quién eres en este momento?
                  </div>
                  {trip.partners.map(p => {
                    const isSelected = p.id === activePartnerId;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setActivePartnerId(p.id as PartnerId)}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-[#F9F8F4] transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#E9EDC6]/70 font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{p.avatarEmoji}</span>
                          <div>
                            <div className="font-bold text-[#434338] flex items-center gap-1.5">
                              {p.name}
                              {p.nickname && (
                                <span className="text-xs font-normal text-[#8C8B79]">
                                  ({p.nickname})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#737260]">
                              Compañero/a de viaje
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#5A5A40]" />}
                      </button>
                    );
                  })}
                  <div className="border-t border-[#EFEDE7] mt-2 pt-2 px-3 text-[11px] text-[#737260] leading-tight">
                    💡 Al cambiar de modo, las notas, gastos y checklists se registrarán automáticamente a tu nombre.
                  </div>
                </div>
              )}
            </div>

            {/* Share / Invite Partner Button */}
            <button
              id="btn-share-room-code"
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E9E5D9] hover:bg-[#D9D1B9] text-[#434338] text-xs font-bold transition-colors cursor-pointer border border-[#D9D1B9]"
              title="Vincular con tu pareja en tiempo real (Código o QR)"
            >
              <Share2 className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="hidden sm:inline">Vincular Pareja</span>
            </button>

            {/* Notifications Bell */}
            <button
              id="btn-notifications-center"
              onClick={onOpenNotificationsModal}
              className="relative p-2 rounded-xl text-[#434338] hover:bg-[#E9E5D9]/70 transition-colors cursor-pointer"
              title="Recordatorios y notificaciones de viaje"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-[#D4A373] rounded-full">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
