import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { X, Edit3, Heart, Trash2 } from 'lucide-react';

interface EditTripModalProps {
  onClose: () => void;
}

export const EditTripModal: React.FC<EditTripModalProps> = ({ onClose }) => {
  const { trip, updateTripInfo } = useTrip();

  const [title, setTitle] = useState(trip.title);
  const [subtitle, setSubtitle] = useState(trip.subtitle);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);
  const [currency, setCurrency] = useState(trip.currency);
  const [coverImage, setCoverImage] = useState(trip.coverImage);

  const [p1Name, setP1Name] = useState(trip.partners[0].name);
  const [p1Emoji, setP1Emoji] = useState(trip.partners[0].avatarEmoji);
  const [p2Name, setP2Name] = useState(trip.partners[1].name);
  const [p2Emoji, setP2Emoji] = useState(trip.partners[1].avatarEmoji);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateTripInfo({
      title: title.trim(),
      subtitle: subtitle.trim(),
      startDate,
      endDate,
      currency,
      coverImage: coverImage.trim() || trip.coverImage,
      partners: [
        {
          ...trip.partners[0],
          name: p1Name.trim() || 'Él',
          avatarEmoji: p1Emoji,
        },
        {
          ...trip.partners[1],
          name: p2Name.trim() || 'Ella',
          avatarEmoji: p2Emoji,
        },
      ],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-[#FBF9F5] rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-lg w-full p-6 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#E9EDC6] text-[#5A5A40]">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#434338]">
                Editar Información del Viaje
              </h3>
              <p className="text-xs text-[#737260]">
                Actualiza nombres, fechas, moneda o la foto de portada
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
              Nombre del Viaje *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-2xl border border-[#D9D1B9] bg-white font-bold text-[#434338]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
              Subtítulo / Lema
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
            />
          </div>

          <div className="p-4 bg-[#FAF6E9] rounded-2xl border border-[#EBE3CD] space-y-3">
            <div className="text-xs font-bold text-[#434338] uppercase">
              Nombres de la Pareja
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-2xl border border-[#D9D1B9] shadow-2xs space-y-1.5">
                <span className="text-[10px] text-[#8C8B79] uppercase font-bold block">Viajero 1</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    title="Emoji viajero 1"
                    value={p1Emoji}
                    onChange={e => setP1Emoji(e.target.value)}
                    className="w-10 h-10 text-center text-xl shrink-0 border border-[#D9D1B9] rounded-xl bg-[#F5F2ED] focus:outline-[#5A5A40]"
                  />
                  <input
                    type="text"
                    required
                    value={p1Name}
                    onChange={e => setP1Name(e.target.value)}
                    className="flex-1 min-w-0 text-sm p-2 border border-[#D9D1B9] rounded-xl font-bold bg-white text-[#434338] focus:outline-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#D9D1B9] shadow-2xs space-y-1.5">
                <span className="text-[10px] text-[#8C8B79] uppercase font-bold block">Viajero 2</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    title="Emoji viajero 2"
                    value={p2Emoji}
                    onChange={e => setP2Emoji(e.target.value)}
                    className="w-10 h-10 text-center text-xl shrink-0 border border-[#D9D1B9] rounded-xl bg-[#F5F2ED] focus:outline-[#5A5A40]"
                  />
                  <input
                    type="text"
                    required
                    value={p2Name}
                    onChange={e => setP2Name(e.target.value)}
                    className="flex-1 min-w-0 text-sm p-2 border border-[#D9D1B9] rounded-xl font-bold bg-white text-[#434338] focus:outline-[#5A5A40]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full text-xs p-2 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full text-xs p-2 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full text-xs p-2 rounded-2xl border border-[#D9D1B9] bg-white font-bold text-[#434338]"
              >
                <option value="EUR">€ EUR</option>
                <option value="USD">$ USD</option>
                <option value="ARS">$ ARS</option>
                <option value="MXN">$ MXN</option>
                <option value="COP">$ COP</option>
                <option value="CLP">$ CLP</option>
                <option value="GBP">£ GBP</option>
                <option value="JPY">¥ JPY</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
              URL Foto de Portada
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              className="w-full text-xs p-2.5 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EFEDE7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#737260] hover:bg-[#E9E5D9] rounded-2xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-2xl cursor-pointer shadow-md shadow-[#5A5A40]/15"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
