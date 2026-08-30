import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Heart, Check, UserCheck, X, Sparkles, Edit3 } from 'lucide-react';
import { PartnerId } from '../types';

interface WhoAmIModalProps {
  onClose: () => void;
  isOpen: boolean;
  onSelectCallback?: (id: PartnerId) => void;
}

export const WhoAmIModal: React.FC<WhoAmIModalProps> = ({ onClose, isOpen, onSelectCallback }) => {
  const { trip, activePartnerId, setActivePartnerId, updateTripInfo } = useTrip();

  const [editingP1, setEditingP1] = useState(false);
  const [editingP2, setEditingP2] = useState(false);
  const [p1Name, setP1Name] = useState(trip.partners[0]?.name || 'Viajero 1');
  const [p1Emoji, setP1Emoji] = useState(trip.partners[0]?.avatarEmoji || '🧔');
  const [p2Name, setP2Name] = useState(trip.partners[1]?.name || 'Viajero 2');
  const [p2Emoji, setP2Emoji] = useState(trip.partners[1]?.avatarEmoji || '🌸');

  if (!isOpen) return null;

  const handleSelect = (id: PartnerId) => {
    setActivePartnerId(id);
    if (onSelectCallback) {
      onSelectCallback(id);
    }
    onClose();
  };

  const handleSavePartnerDetails = () => {
    const updatedPartners = [
      {
        ...trip.partners[0],
        name: p1Name.trim() || 'Viajero 1',
        avatarEmoji: p1Emoji || '🧔',
      },
      {
        ...trip.partners[1],
        name: p2Name.trim() || 'Viajero 2',
        avatarEmoji: p2Emoji || '🌸',
      },
    ] as [typeof trip.partners[0], typeof trip.partners[1]];

    updateTripInfo({ partners: updatedPartners });
    setEditingP1(false);
    setEditingP2(false);
  };

  const p1 = trip.partners[0];
  const p2 = trip.partners[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-[#FBF9F5] rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-md w-full p-6 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#FAF6E9] text-[#D4A373] border border-[#EBE3CD]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#434338]">
                ¿Quién sos vos en este viaje?
              </h3>
              <p className="text-xs text-[#737260]">
                Elegí tu perfil para registrar gastos, armar tu valija y enviarse notas.
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

        <div className="space-y-4 mt-5">
          {/* Partner 1 Card */}
          <div
            onClick={() => handleSelect('p1')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative group ${
              activePartnerId === 'p1'
                ? 'bg-white border-[#5A5A40] shadow-md ring-2 ring-[#5A5A40]/15'
                : 'bg-white/70 border-[#E5E0D5] hover:border-[#D4A373] hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F2ED] border border-[#D9D1B9] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                {p1.avatarEmoji}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C8B79] tracking-wider">
                  Viajero 1
                </span>
                <h4 className="text-base font-serif font-bold text-[#434338]">
                  {p1.name}
                </h4>
                {p1.nickname && (
                  <p className="text-xs text-[#737260] italic">"{p1.nickname}"</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activePartnerId === 'p1' ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#5A5A40] px-3 py-1.5 rounded-full shadow-xs">
                  <Check className="w-3.5 h-3.5" /> Sos vos
                </span>
              ) : (
                <span className="text-xs font-bold text-[#5A5A40] bg-[#E9EDC6] px-3 py-1.5 rounded-full group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
                  Elegir
                </span>
              )}
            </div>
          </div>

          {/* Partner 2 Card */}
          <div
            onClick={() => handleSelect('p2')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative group ${
              activePartnerId === 'p2'
                ? 'bg-white border-[#5A5A40] shadow-md ring-2 ring-[#5A5A40]/15'
                : 'bg-white/70 border-[#E5E0D5] hover:border-[#D4A373] hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F2ED] border border-[#D9D1B9] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                {p2.avatarEmoji}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C8B79] tracking-wider">
                  Viajero 2
                </span>
                <h4 className="text-base font-serif font-bold text-[#434338]">
                  {p2.name}
                </h4>
                {p2.nickname && (
                  <p className="text-xs text-[#737260] italic">"{p2.nickname}"</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activePartnerId === 'p2' ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#5A5A40] px-3 py-1.5 rounded-full shadow-xs">
                  <Check className="w-3.5 h-3.5" /> Sos vos
                </span>
              ) : (
                <span className="text-xs font-bold text-[#5A5A40] bg-[#E9EDC6] px-3 py-1.5 rounded-full group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
                  Elegir
                </span>
              )}
            </div>
          </div>

          {/* Edit Names Option */}
          <div className="pt-3 border-t border-[#EFEDE7]">
            {!editingP1 && !editingP2 ? (
              <button
                type="button"
                onClick={() => {
                  setEditingP1(true);
                  setEditingP2(true);
                }}
                className="w-full py-2 text-center text-xs font-bold text-[#5A5A40] hover:text-[#434338] hover:bg-[#FAF6E9] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Cambiar nombres o emojis de la pareja
              </button>
            ) : (
              <div className="space-y-3 p-3.5 bg-white rounded-2xl border border-[#D9D1B9]">
                <div className="text-xs font-bold text-[#434338] uppercase">
                  Editar Nombres & Emojis
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C8B79] mb-1">
                      Viajero 1
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={p1Emoji}
                        onChange={e => setP1Emoji(e.target.value)}
                        className="w-8 text-center text-base p-1 border rounded-lg bg-[#FAF6E9]"
                      />
                      <input
                        type="text"
                        value={p1Name}
                        onChange={e => setP1Name(e.target.value)}
                        className="flex-1 text-xs p-1.5 border rounded-lg font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C8B79] mb-1">
                      Viajero 2
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={p2Emoji}
                        onChange={e => setP2Emoji(e.target.value)}
                        className="w-8 text-center text-base p-1 border rounded-lg bg-[#FAF6E9]"
                      />
                      <input
                        type="text"
                        value={p2Name}
                        onChange={e => setP2Name(e.target.value)}
                        className="flex-1 text-xs p-1.5 border rounded-lg font-bold"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingP1(false);
                      setEditingP2(false);
                    }}
                    className="px-3 py-1 text-xs text-[#737260] hover:bg-[#E9E5D9] rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePartnerDetails}
                    className="px-4 py-1 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-lg"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
