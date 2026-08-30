import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import {
  Heart,
  Compass,
  Plus,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Share2,
  KeyRound,
  Check,
  Plane,
} from 'lucide-react';
import { PartnerId, Trip } from '../types';

interface WelcomeScreenProps {
  onTripReady: () => void;
  onOpenWhoAmI?: () => void;
}

const COVER_PRESETS = [
  {
    name: 'Playa & Puesta de Sol',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Europa Clásica & Calles',
    url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Montañas & Aventura',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Ciudad & Luces',
    url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onTripReady }) => {
  const { createNewTrip, joinTripByCode, setActivePartnerId, loadDemoTrip, importTripJson } = useTrip();

  const [mode, setMode] = useState<'welcome' | 'create' | 'join' | 'select-identity'>('welcome');
  const [createdTempTrip, setCreatedTempTrip] = useState<Trip | null>(null);

  // Form State for New Trip
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [p1Name, setP1Name] = useState('Lucas');
  const [p1Emoji, setP1Emoji] = useState('🧔');
  const [p2Name, setP2Name] = useState('Sofía');
  const [p2Emoji, setP2Emoji] = useState('🌸');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState('EUR');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);

  // Join state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTrip = createNewTrip({
      title: title.trim(),
      subtitle: subtitle.trim() || 'Nuestra aventura inolvidable',
      startDate,
      endDate,
      currency,
      coverImage,
      partners: [
        {
          id: 'p1',
          name: p1Name.trim() || 'Viajero 1',
          avatarEmoji: p1Emoji || '🧔',
          avatarColor: '#5A5A40',
        },
        {
          id: 'p2',
          name: p2Name.trim() || 'Viajero 2',
          avatarEmoji: p2Emoji || '🌸',
          avatarColor: '#D4A373',
        },
      ],
    });

    setCreatedTempTrip(newTrip);
    setMode('select-identity');
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setIsJoining(true);
    setJoinError('');
    const success = await joinTripByCode(joinCodeInput.trim());
    setIsJoining(false);

    if (success) {
      setMode('select-identity');
    } else {
      setJoinError('No encontramos ningún viaje con ese código. Verifícalo e inténtalo de nuevo.');
    }
  };

  const handleIdentitySelect = (partnerId: PartnerId) => {
    setActivePartnerId(partnerId);
    onTripReady();
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col items-center justify-center p-4 sm:p-6 text-[#434338]">
      {/* Decorative background circle */}
      <div className="max-w-xl w-full bg-[#FBF9F5] border border-[#D9D1B9] rounded-[36px] shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E9EDC6]/40 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FAF6E9] rounded-full blur-3xl pointer-events-none -ml-12 -mb-12" />

        {/* 1. INITIAL WELCOME SELECTION */}
        {mode === 'welcome' && (
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-[#5A5A40] text-white flex items-center justify-center shadow-lg shadow-[#5A5A40]/20 mb-2">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4A373]">
                App de Viajes para Parejas
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#434338]">
                Nuestros Viajes
              </h1>
              <p className="text-sm text-[#737260] max-w-md mx-auto leading-relaxed">
                Organicen itinerarios día a día, dividan gastos estilo Tricount, listas de equipaje y guarden recuerdos inolvidables juntos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {/* Option 1: Create New Trip */}
              <button
                id="btn-welcome-create-trip"
                onClick={() => setMode('create')}
                className="p-5 rounded-3xl bg-[#5A5A40] hover:bg-[#434338] text-white text-left transition-all duration-200 group cursor-pointer shadow-md shadow-[#5A5A40]/15 flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base mb-1 flex items-center justify-between">
                    Crear Nuevo Viaje
                    <ArrowRight className="w-4 h-4 opacity-75 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-[#E9E5D9] leading-relaxed">
                    Comiencen su viaje desde cero: agreguen fechas, nombres y su itinerario.
                  </p>
                </div>
              </button>

              {/* Option 2: Join with Code */}
              <button
                id="btn-welcome-join-trip"
                onClick={() => setMode('join')}
                className="p-5 rounded-3xl bg-white hover:bg-[#FAF6E9] border-2 border-[#D9D1B9] hover:border-[#5A5A40] text-left transition-all duration-200 group cursor-pointer shadow-sm flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#E9EDC6] flex items-center justify-center text-[#5A5A40] mb-4 group-hover:scale-110 transition-transform">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#434338] mb-1 flex items-center justify-between">
                    Unirme con Código
                    <ArrowRight className="w-4 h-4 text-[#8C8B79] group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-[#737260] leading-relaxed">
                    Si tu pareja ya creó el viaje, ingresa el código para sincronizar en directo.
                  </p>
                </div>
              </button>
            </div>

            {/* Demo trip & Backup Import triggers */}
            <div className="pt-4 border-t border-[#EFEDE7] flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                onClick={() => {
                  loadDemoTrip();
                  onTripReady();
                }}
                className="text-xs font-semibold text-[#8C8B79] hover:text-[#5A5A40] transition-colors cursor-pointer"
              >
                ✨ O explorar con un viaje de ejemplo (Tour por Italia)
              </button>

              <label className="text-xs font-semibold text-[#5A5A40] hover:text-[#434338] transition-colors cursor-pointer flex items-center gap-1">
                📥 Restaurar archivo (.json)
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const content = ev.target?.result as string;
                      if (content && importTripJson(content)) {
                        onTripReady();
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {/* 2. FORM TO CREATE NEW TRIP */}
        {mode === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-[#E9EDC6] text-[#5A5A40]">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#434338]">
                    Crear Nuevo Viaje
                  </h2>
                  <p className="text-xs text-[#737260]">
                    Configuren su viaje limpio y sin datos de ejemplo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMode('welcome')}
                className="text-xs text-[#8C8B79] hover:text-[#434338] font-bold"
              >
                Volver
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#434338] mb-1">
                Nombre del Viaje *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Italia de ensueño, Escapada a Bariloche, etc."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-sm p-3 rounded-2xl border border-[#D9D1B9] bg-white font-bold text-[#434338] focus:outline-[#5A5A40]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#434338] mb-1">
                Subtítulo o Lema
              </label>
              <input
                type="text"
                placeholder="Ej: Nuestra primera gran aventura juntos recorriendo ciudades"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
              />
            </div>

            {/* Travelers info */}
            <div className="p-4 sm:p-5 bg-[#FAF6E9] rounded-2xl border border-[#EBE3CD] space-y-3.5">
              <div className="text-xs font-bold text-[#434338] uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#D4A373]" />
                Nombres de la Pareja
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Viajero 1 */}
                <div className="p-3 bg-white rounded-2xl border border-[#D9D1B9] shadow-2xs space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8C8B79] block">
                    Viajero 1
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      title="Emoji del viajero 1"
                      value={p1Emoji}
                      onChange={e => setP1Emoji(e.target.value)}
                      className="w-10 h-10 text-center text-xl shrink-0 border border-[#D9D1B9] rounded-xl bg-[#F5F2ED] focus:outline-[#5A5A40]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Nombre (ej: Ariel)"
                      value={p1Name}
                      onChange={e => setP1Name(e.target.value)}
                      className="flex-1 min-w-0 text-sm p-2.5 border border-[#D9D1B9] rounded-xl bg-white font-bold text-[#434338] focus:outline-[#5A5A40]"
                    />
                  </div>
                </div>

                {/* Viajero 2 */}
                <div className="p-3 bg-white rounded-2xl border border-[#D9D1B9] shadow-2xs space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8C8B79] block">
                    Viajero 2
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      title="Emoji del viajero 2"
                      value={p2Emoji}
                      onChange={e => setP2Emoji(e.target.value)}
                      className="w-10 h-10 text-center text-xl shrink-0 border border-[#D9D1B9] rounded-xl bg-[#F5F2ED] focus:outline-[#5A5A40]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Nombre (ej: Rocío)"
                      value={p2Name}
                      onChange={e => setP2Name(e.target.value)}
                      className="flex-1 min-w-0 text-sm p-2.5 border border-[#D9D1B9] rounded-xl bg-white font-bold text-[#434338] focus:outline-[#5A5A40]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dates & Currency */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#434338] uppercase mb-1">
                  Inicio
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#434338] uppercase mb-1">
                  Fin
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#434338] uppercase mb-1">
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
                </select>
              </div>
            </div>

            {/* Cover Presets */}
            <div>
              <label className="block text-[11px] font-bold text-[#434338] uppercase mb-1.5">
                Foto de Portada
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COVER_PRESETS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCoverImage(c.url)}
                    className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all cursor-pointer ${
                      coverImage === c.url
                        ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/30 scale-95'
                        : 'border-[#D9D1B9] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={c.url} alt={c.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#EFEDE7]">
              <button
                type="button"
                onClick={() => setMode('welcome')}
                className="px-4 py-2 text-xs font-bold text-[#737260] hover:bg-[#E9E5D9] rounded-2xl"
              >
                Atrás
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-2xl shadow-md shadow-[#5A5A40]/20 cursor-pointer flex items-center gap-1.5"
              >
                Siguiente: Elegir quién soy <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* 3. JOIN WITH CODE */}
        {mode === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-[#FAF6E9] text-[#D4A373] border border-[#EBE3CD]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#434338]">
                    Unirme al Viaje de mi Pareja
                  </h2>
                  <p className="text-xs text-[#737260]">
                    Ingresa el código compartido por tu compañero/a
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMode('welcome')}
                className="text-xs text-[#8C8B79] hover:text-[#434338] font-bold"
              >
                Volver
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#434338]">
                Código de Viaje (ej: VIAJE-1234)
              </label>
              <input
                type="text"
                required
                placeholder="Ingresar código..."
                value={joinCodeInput}
                onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full text-center text-lg uppercase font-mono font-black p-3.5 rounded-2xl border-2 border-[#D9D1B9] bg-white text-[#434338] tracking-widest focus:outline-[#5A5A40]"
              />
              {joinError && (
                <p className="text-xs text-red-600 font-semibold mt-1">{joinError}</p>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#EFEDE7]">
              <button
                type="button"
                onClick={() => setMode('welcome')}
                className="px-4 py-2 text-xs font-bold text-[#737260] hover:bg-[#E9E5D9] rounded-2xl"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={isJoining}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-2xl shadow-md shadow-[#5A5A40]/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isJoining ? 'Buscando viaje...' : 'Unirme y Elegir quién soy'}
              </button>
            </div>
          </form>
        )}

        {/* 4. SELECT IDENTITY (¿Quién sos vos?) */}
        {mode === 'select-identity' && (
          <div className="space-y-5 animate-in fade-in text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E9EDC6] text-[#5A5A40] flex items-center justify-center mx-auto mb-1">
              <Heart className="w-6 h-6 fill-[#D4A373] text-[#D4A373]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#434338]">
                ¡Casi listos! ¿Quién sos vos?
              </h2>
              <p className="text-xs text-[#737260]">
                Elegí tu nombre para guardar tus actividades, gastos y maleta en este dispositivo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                id="btn-select-identity-p1"
                onClick={() => handleIdentitySelect('p1')}
                className="p-5 rounded-3xl bg-white hover:bg-[#FAF6E9] border-2 border-[#D9D1B9] hover:border-[#5A5A40] text-center transition-all cursor-pointer group shadow-sm flex flex-col items-center"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {p1Emoji}
                </div>
                <span className="text-[10px] font-bold uppercase text-[#8C8B79]">
                  Viajero 1
                </span>
                <span className="text-base font-serif font-bold text-[#434338]">
                  Soy {p1Name}
                </span>
                <span className="text-[11px] text-[#5A5A40] font-semibold mt-2 px-3 py-1 bg-[#E9EDC6] rounded-full">
                  Comenzar como {p1Name} →
                </span>
              </button>

              <button
                id="btn-select-identity-p2"
                onClick={() => handleIdentitySelect('p2')}
                className="p-5 rounded-3xl bg-white hover:bg-[#FAF6E9] border-2 border-[#D9D1B9] hover:border-[#5A5A40] text-center transition-all cursor-pointer group shadow-sm flex flex-col items-center"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {p2Emoji}
                </div>
                <span className="text-[10px] font-bold uppercase text-[#8C8B79]">
                  Viajero 2
                </span>
                <span className="text-base font-serif font-bold text-[#434338]">
                  Soy {p2Name}
                </span>
                <span className="text-[11px] text-[#5A5A40] font-semibold mt-2 px-3 py-1 bg-[#E9EDC6] rounded-full">
                  Comenzar como {p2Name} →
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
