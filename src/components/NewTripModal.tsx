import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { X, Sparkles, Heart, Plane, Calendar, DollarSign, MapPin } from 'lucide-react';

interface NewTripModalProps {
  onClose: () => void;
}

const PRESET_COVERS = [
  {
    name: 'Italia Romántica',
    url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'París & Luces',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Playa & Mar Caribe',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Tokio & Japón',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Nueva York',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Montaña & Aventura',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
];

export const NewTripModal: React.FC<NewTripModalProps> = ({ onClose }) => {
  const { createNewTrip } = useTrip();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 28).toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState('EUR');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);

  // Partners config
  const [p1Name, setP1Name] = useState('Lucas');
  const [p1Emoji, setP1Emoji] = useState('✈️');
  const [p2Name, setP2Name] = useState('Sofía');
  const [p2Emoji, setP2Emoji] = useState('🌸');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createNewTrip({
      title: title.trim(),
      subtitle: subtitle.trim() || 'Nuestra próxima gran aventura juntos',
      startDate,
      endDate,
      currency,
      coverImage,
      partners: [
        {
          id: 'p1',
          name: p1Name.trim() || 'Él',
          nickname: '',
          avatarEmoji: p1Emoji,
          avatarColor: '#2563eb',
        },
        {
          id: 'p2',
          name: p2Name.trim() || 'Ella',
          nickname: '',
          avatarEmoji: p2Emoji,
          avatarColor: '#e11d48',
        },
      ],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),16px)] bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-[#FBF9F5] rounded-[28px] sm:rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-xl w-full p-5 sm:p-6 max-h-[88vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#FAF6E9] text-[#D4A373] border border-[#EBE3CD]">
              <Heart className="w-5 h-5 fill-[#D4A373]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#434338]">
                Crear Nuevo Viaje de Pareja
              </h3>
              <p className="text-xs text-[#737260]">
                Configuren su itinerario, seleccionen sus nombres y organicen todo juntos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8C8B79] hover:text-[#434338] hover:bg-[#E9E5D9] cursor-pointer transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Trip Name & Subtitle */}
          <div>
            <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
              Nombre del Viaje *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Italia de ensueño: Roma, Florencia & Costa Amalfitana"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-[#D9D1B9] font-bold text-[#434338] bg-white focus:outline-[#5A5A40]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
              Frase o Lema de la Aventura
            </label>
            <input
              type="text"
              placeholder="Ej: 14 días recorriendo callejones, comiendo pasta y coleccionando recuerdos"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
            />
          </div>

          {/* Couple Names & Avatars */}
          <div className="p-4 bg-[#FAF6E9] rounded-2xl border border-[#EBE3CD] space-y-3">
            <div className="text-xs font-bold text-[#434338] uppercase">
              Los Viajeros (Nombres & Emojis)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Partner 1 */}
              <div className="p-3 bg-white rounded-2xl border border-[#E5E0D5] shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#8C8B79]">Viajero 1</span>
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
                    placeholder="Nombre"
                    value={p1Name}
                    onChange={e => setP1Name(e.target.value)}
                    className="flex-1 min-w-0 text-sm p-2 border border-[#D9D1B9] rounded-xl font-bold text-[#434338] focus:outline-[#5A5A40]"
                  />
                </div>
              </div>

              {/* Partner 2 */}
              <div className="p-3 bg-white rounded-2xl border border-[#E5E0D5] shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#8C8B79]">Viajero 2</span>
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
                    placeholder="Nombre"
                    value={p2Name}
                    onChange={e => setP2Name(e.target.value)}
                    className="flex-1 min-w-0 text-sm p-2 border border-[#D9D1B9] rounded-xl font-bold text-[#434338] focus:outline-[#5A5A40]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                Moneda Principal
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl border border-[#D9D1B9] font-bold bg-white text-[#434338]"
              >
                <option value="EUR">€ Euro (EUR)</option>
                <option value="USD">$ Dólar (USD)</option>
                <option value="ARS">$ Peso Argentino (ARS)</option>
                <option value="MXN">$ Peso Mexicano (MXN)</option>
                <option value="COP">$ Peso Colombiano (COP)</option>
                <option value="CLP">$ Peso Chileno (CLP)</option>
                <option value="GBP">£ Libra (GBP)</option>
                <option value="JPY">¥ Yen (JPY)</option>
              </select>
            </div>
          </div>

          {/* Cover Preset Selection */}
          <div>
            <label className="block text-xs font-bold text-[#434338] uppercase mb-2">
              Foto de Portada
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_COVERS.map(cover => (
                <button
                  key={cover.name}
                  type="button"
                  onClick={() => setCoverImage(cover.url)}
                  className={`relative rounded-2xl overflow-hidden h-16 border-2 transition-all cursor-pointer ${
                    coverImage === cover.url
                      ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/30 scale-98'
                      : 'border-[#D9D1B9] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                    <span className="text-[10px] font-bold text-white leading-tight">
                      {cover.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#EFEDE7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-[#737260] hover:bg-[#E9E5D9] rounded-2xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-2xl shadow-md shadow-[#5A5A40]/15 cursor-pointer transition-all"
            >
              Comenzar Aventura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
