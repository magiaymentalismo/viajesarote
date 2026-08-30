import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Users,
  Wifi,
  Sparkles,
  Heart,
  ArrowRight,
} from 'lucide-react';

interface ShareRoomModalProps {
  onClose: () => void;
}

export const ShareRoomModal: React.FC<ShareRoomModalProps> = ({ onClose }) => {
  const { trip, joinTripByCode, activeOnlinePartners, isOnline } = useTrip();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [joinStatus, setJoinStatus] = useState<string | null>(null);

  const inviteCode = trip.inviteCode || 'ITALIA-2026';
  const shareableUrl = `${window.location.origin}${window.location.pathname}?join=${inviteCode}`;

  const p1 = trip.partners[0];
  const p2 = trip.partners[1];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setJoinStatus('Conectando al viaje privado...');
    const ok = await joinTripByCode(inputCode.trim().toUpperCase());
    if (ok) {
      setJoinStatus('¡Conectado exitosamente!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setJoinStatus('No se encontró el viaje o el código es incorrecto.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-[#FBF9F5] rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-lg w-full p-6 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#FAF6E9] text-[#D4A373] border border-[#EBE3CD]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#434338]">
                Vincular Viaje con tu Pareja
              </h3>
              <p className="text-xs text-[#737260]">
                Tu viaje es 100% privado. Solo quien tenga tu código o enlace puede ingresar.
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

        <div className="space-y-5 mt-5">
          {/* Active Partners Presence Status */}
          <div className="p-4 bg-[#FAF6E9] rounded-2xl border border-[#EBE3CD] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#434338] uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#5A5A40]" />
                Viajeros de este Viaje
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#5A5A40]">
                <span className="w-2 h-2 rounded-full bg-[#5A5A40] animate-pulse" />
                Sincronizado en la Nube
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white rounded-2xl border border-[#E5E0D5] shadow-2xs flex items-center gap-2">
                <span className="text-xl">{p1.avatarEmoji}</span>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#434338] truncate">{p1.name}</div>
                  <div className="text-[10px] text-[#5A5A40] font-semibold">
                    ● Viajero 1
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#E5E0D5] shadow-2xs flex items-center gap-2">
                <span className="text-xl">{p2.avatarEmoji}</span>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#434338] truncate">{p2.name}</div>
                  <div className="text-[10px] text-[#D4A373] font-semibold">
                    ● Viajero 2
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invitation Code */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#434338] uppercase">
              Código Privado de tu Viaje
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white font-mono font-black text-base text-[#434338] px-4 py-2.5 rounded-2xl border border-[#D9D1B9] text-center tracking-widest">
                {inviteCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2.5 bg-[#5A5A40] hover:bg-[#434338] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {copiedCode ? <Check className="w-4 h-4 text-[#E9EDC6]" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Share Link Direct */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#434338] uppercase">
              Enlace Directo para Enviar por WhatsApp
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 text-xs px-3 py-2.5 rounded-2xl border border-[#D9D1B9] bg-white text-[#737260] truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-[#D4A373] hover:bg-[#c29364] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}
              </button>
            </div>
            <p className="text-[11px] text-[#737260]">
              Cuando tu pareja abra este enlace en su navegador o móvil, entrará automáticamente a este mismo viaje privado.
            </p>
          </div>

          {/* Join Another Trip with Code */}
          <div className="pt-4 border-t border-[#EFEDE7] space-y-3">
            <div className="text-xs font-bold text-[#434338] uppercase">
              ¿Te invitaron a otro viaje? Ingresa su código aquí:
            </div>
            <form onSubmit={handleJoinByCode} className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: VIAJE-4821"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                className="flex-1 text-xs uppercase font-mono font-bold px-3 py-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold rounded-2xl cursor-pointer shadow-sm"
              >
                Unirme
              </button>
            </form>
            {joinStatus && (
              <p className="text-xs text-[#8A5A2B] font-semibold">{joinStatus}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
