import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { DestinationCity, DayPlan } from '../types';
import {
  X,
  Calendar,
  Phone,
  Shield,
  Zap,
  CloudSun,
  Bus,
  CreditCard,
  MapPin,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  Hotel,
  Navigation,
} from 'lucide-react';

interface CityDetailModalProps {
  city: DestinationCity;
  onClose: () => void;
}

export const CityDetailModal: React.FC<CityDetailModalProps> = ({ city, onClose }) => {
  const { trip, updateCity, updateDayPlan, addSite } = useTrip();

  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'info' | 'reservas' | 'sitios'>('calendar');
  const [editingDayPlan, setEditingDayPlan] = useState<DayPlan | null>(null);
  const [newActivityText, setNewActivityText] = useState('');
  const [activityTimeSlot, setActivityTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  // Find linked accommodations and sites
  const cityAccommodations = trip.accommodations.filter(a => a.cityId === city.id);
  const citySites = trip.sites.filter(s => s.cityId === city.id);

  const handleAddActivity = (planId: string) => {
    if (!newActivityText.trim()) return;
    const plan = city.dayPlans.find(p => p.id === planId);
    if (!plan) return;

    const updated = { ...plan };
    if (activityTimeSlot === 'morning') {
      updated.morningActivities = [...updated.morningActivities, newActivityText.trim()];
    } else if (activityTimeSlot === 'afternoon') {
      updated.afternoonActivities = [...updated.afternoonActivities, newActivityText.trim()];
    } else {
      updated.eveningActivities = [...updated.eveningActivities, newActivityText.trim()];
    }

    updateDayPlan(city.id, planId, updated);
    setNewActivityText('');
  };

  const handleRemoveActivity = (planId: string, slot: 'morning' | 'afternoon' | 'evening', index: number) => {
    const plan = city.dayPlans.find(p => p.id === planId);
    if (!plan) return;

    const updated = { ...plan };
    if (slot === 'morning') {
      updated.morningActivities = updated.morningActivities.filter((_, i) => i !== index);
    } else if (slot === 'afternoon') {
      updated.afternoonActivities = updated.afternoonActivities.filter((_, i) => i !== index);
    } else {
      updated.eveningActivities = updated.eveningActivities.filter((_, i) => i !== index);
    }

    updateDayPlan(city.id, planId, updated);
  };

  const handleAddNewDay = () => {
    const nextDayNum = (city.dayPlans.length || 0) + 1;
    const newDayPlan: DayPlan = {
      id: 'plan-' + city.id + '-d' + nextDayNum + '-' + Date.now().toString(36),
      date: city.arrivalDate,
      dayNumber: nextDayNum,
      title: `Día ${nextDayNum} en ${city.name}`,
      morningActivities: ['Desayuno y caminata matutina'],
      afternoonActivities: ['Visita cultural o paseo'],
      eveningActivities: ['Cena romántica'],
      notes: 'Planificar con anticipación',
    };

    const updatedCity = {
      ...city,
      dayPlans: [...city.dayPlans, newDayPlan],
    };
    updateCity(city.id, updatedCity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#FBF9F5] rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* City Hero Banner */}
        <div className="relative h-48 sm:h-56 shrink-0 overflow-hidden bg-[#434338]">
          <img
            src={city.coverImage}
            alt={city.name}
            className="w-full h-full object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#E9EDC6] text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#E9EDC6]" />
                {city.country}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white drop-shadow-xs">
                {city.name}
              </h2>
              <div className="text-xs text-white/80 flex items-center gap-2 mt-0.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#E9EDC6]" />
                <span>
                  {city.arrivalDate} al {city.departureDate}
                </span>
              </div>
            </div>

            <a
              href={city.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.name + ' ' + city.country)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#434338] text-xs font-bold shadow-md transition-colors backdrop-blur-xs cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D4A373]" />
              <span className="hidden sm:inline">Ver en Maps</span>
              <span className="sm:hidden">Maps</span>
            </a>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3.5 pb-2.5 border-b border-[#D9D1B9]/60 bg-[#F5F2ED] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'calendar'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#737260] hover:bg-[#E9E5D9]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendario de Días ({city.dayPlans.length})
          </button>

          <button
            onClick={() => setActiveSubTab('info')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'info'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#737260] hover:bg-[#E9E5D9]'
            }`}
          >
            <Shield className="w-4 h-4" />
            Info Útil & Emergencias
          </button>

          <button
            onClick={() => setActiveSubTab('reservas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'reservas'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#737260] hover:bg-[#E9E5D9]'
            }`}
          >
            <Hotel className="w-4 h-4" />
            Reservas & Hotel ({cityAccommodations.length})
          </button>

          <button
            onClick={() => setActiveSubTab('sitios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'sitios'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#737260] hover:bg-[#E9E5D9]'
            }`}
          >
            <Navigation className="w-4 h-4" />
            Sitios Guardados ({citySites.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CALENDARIO DE DÍAS */}
          {activeSubTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#434338]">
                    Itinerario Día a Día en {city.name}
                  </h3>
                  <p className="text-xs text-[#737260]">
                    Planifiquen las actividades de la mañana, tarde y noche juntos
                  </p>
                </div>

                <button
                  onClick={handleAddNewDay}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Día
                </button>
              </div>

              {city.dayPlans.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-[28px] border border-[#E5E0D5] text-[#737260]">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-[#8C8B79]" />
                  <p className="text-sm font-bold text-[#434338]">No hay días creados todavía</p>
                  <button
                    onClick={handleAddNewDay}
                    className="mt-3 px-4 py-2 rounded-2xl bg-[#5A5A40] text-white text-xs font-bold cursor-pointer"
                  >
                    Crear Primer Día
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {city.dayPlans.map(plan => (
                    <div
                      key={plan.id}
                      className="bg-white rounded-[28px] border border-[#E5E0D5] p-5 shadow-xs hover:border-[#D9D1B9] transition-all"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7] mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-[#5A5A40] text-white font-bold text-xs shadow-xs">
                            {plan.dayNumber}
                          </span>
                          <div>
                            <h4 className="text-sm font-serif font-bold text-[#434338]">{plan.title}</h4>
                            <span className="text-[11px] text-[#737260] font-medium">
                              {plan.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Time Slots Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Morning */}
                        <div className="p-3.5 bg-[#FAF6E9] rounded-2xl border border-[#EBE3CD]">
                          <div className="text-xs font-bold text-[#5A5A40] flex items-center gap-1.5 mb-2">
                            <span>☀️</span>
                            <span>Mañana</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-[#434338]">
                            {plan.morningActivities.map((act, i) => (
                              <li
                                key={i}
                                className="flex items-start justify-between gap-1 group/item hover:bg-[#F2ECE0] p-1 rounded-lg"
                              >
                                <span className="flex items-start gap-1.5">
                                  <span className="text-[#D4A373]">•</span>
                                  <span>{act}</span>
                                </span>
                                <button
                                  onClick={() => handleRemoveActivity(plan.id, 'morning', i)}
                                  className="text-[#8C8B79] hover:text-[#D4A373] opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Afternoon */}
                        <div className="p-3.5 bg-[#F2F6ED] rounded-2xl border border-[#DCE8D4]">
                          <div className="text-xs font-bold text-[#5A5A40] flex items-center gap-1.5 mb-2">
                            <span>🌤️</span>
                            <span>Tarde</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-[#434338]">
                            {plan.afternoonActivities.map((act, i) => (
                              <li
                                key={i}
                                className="flex items-start justify-between gap-1 group/item hover:bg-[#E4ECD9] p-1 rounded-lg"
                              >
                                <span className="flex items-start gap-1.5">
                                  <span className="text-[#5A5A40]">•</span>
                                  <span>{act}</span>
                                </span>
                                <button
                                  onClick={() => handleRemoveActivity(plan.id, 'afternoon', i)}
                                  className="text-[#8C8B79] hover:text-[#D4A373] opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Evening */}
                        <div className="p-3.5 bg-[#F4F1EA] rounded-2xl border border-[#DFDAD0]">
                          <div className="text-xs font-bold text-[#434338] flex items-center gap-1.5 mb-2">
                            <span>🌙</span>
                            <span>Noche</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-[#434338]">
                            {plan.eveningActivities.map((act, i) => (
                              <li
                                key={i}
                                className="flex items-start justify-between gap-1 group/item hover:bg-[#EAE4D7] p-1 rounded-lg"
                              >
                                <span className="flex items-start gap-1.5">
                                  <span className="text-[#5A5A40]">•</span>
                                  <span>{act}</span>
                                </span>
                                <button
                                  onClick={() => handleRemoveActivity(plan.id, 'evening', i)}
                                  className="text-[#8C8B79] hover:text-[#D4A373] opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Quick Add Activity Row */}
                      <div className="mt-3 pt-3 border-t border-[#EFEDE7] flex flex-col sm:flex-row items-center gap-2">
                        <select
                          value={activityTimeSlot}
                          onChange={e => setActivityTimeSlot(e.target.value as any)}
                          className="text-xs font-semibold bg-[#F5F2ED] border border-[#D9D1B9] rounded-xl px-2.5 py-1.5 text-[#434338]"
                        >
                          <option value="morning">☀️ Mañana</option>
                          <option value="afternoon">🌤️ Tarde</option>
                          <option value="evening">🌙 Noche</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Escribir actividad para este día..."
                          value={newActivityText}
                          onChange={e => setNewActivityText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddActivity(plan.id)}
                          className="flex-1 w-full text-xs px-3 py-1.5 rounded-xl border border-[#D9D1B9] focus:outline-[#5A5A40]"
                        />
                        <button
                          onClick={() => handleAddActivity(plan.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#E9EDC6] hover:bg-[#DFE4B5] text-[#5A5A40] text-xs font-bold cursor-pointer shrink-0"
                        >
                          + Agregar
                        </button>
                      </div>

                      {plan.notes && (
                        <div className="mt-2 text-[11px] text-[#737260] italic">
                          💡 Tip: {plan.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INFO ÚTIL & EMERGENCIAS */}
          {activeSubTab === 'info' && (
            <div className="space-y-6">
              {/* Emergency Numbers Card */}
              <div className="bg-[#FAF6E9] border border-[#EBE3CD] rounded-[28px] p-5">
                <div className="flex items-center gap-2 text-[#434338] font-bold text-sm mb-3">
                  <Phone className="w-4 h-4 text-[#5A5A40]" />
                  <span className="font-serif">Teléfonos de Emergencia y Asistencia en {city.name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-white rounded-2xl border border-[#E5E0D5] shadow-2xs">
                    <div className="font-bold text-[#434338]">🚨 Policía / Emergencias:</div>
                    <div className="text-[#5A5A40] font-extrabold text-sm mt-0.5">{city.emergencyInfo.police}</div>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-[#E5E0D5] shadow-2xs">
                    <div className="font-bold text-[#434338]">🚑 Asistencia Médica:</div>
                    <div className="text-[#5A5A40] font-extrabold text-sm mt-0.5">{city.emergencyInfo.medical}</div>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-[#E5E0D5] shadow-2xs">
                    <div className="font-bold text-[#434338]">🏛️ Consulado / Embajada:</div>
                    <div className="text-[#737260] font-medium text-xs mt-0.5">{city.emergencyInfo.embassy}</div>
                  </div>
                </div>
              </div>

              {/* Practical Travel Tips Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#E5E0D5] space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#434338]">
                    <CloudSun className="w-4 h-4 text-[#D4A373]" />
                    Clima y Vestimenta Recomendada
                  </div>
                  <p className="text-xs text-[#737260]">{city.practicalTips.weather}</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E5E0D5] space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#434338]">
                    <Zap className="w-4 h-4 text-[#D4A373]" />
                    Enchufes y Voltaje
                  </div>
                  <p className="text-xs text-[#737260]">{city.practicalTips.plugs}</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E5E0D5] space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#434338]">
                    <Bus className="w-4 h-4 text-[#5A5A40]" />
                    Transporte Local
                  </div>
                  <p className="text-xs text-[#737260]">{city.practicalTips.transport}</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E5E0D5] space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#434338]">
                    <CreditCard className="w-4 h-4 text-[#5A5A40]" />
                    Moneda y Pagos
                  </div>
                  <p className="text-xs text-[#737260]">{city.practicalTips.localCurrency}</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E5E0D5] space-y-1 shadow-2xs sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#434338]">
                    <Shield className="w-4 h-4 text-[#5A5A40]" />
                    Seguridad y Mejores Horarios
                  </div>
                  <p className="text-xs text-[#737260]">{city.practicalTips.safety}</p>
                  {city.practicalTips.bestTime && (
                    <p className="text-xs text-[#5A5A40] font-semibold pt-1">
                      📸 Tip fotográfico: {city.practicalTips.bestTime}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESERVAS & HOTEL */}
          {activeSubTab === 'reservas' && (
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-[#434338]">
                Alojamiento Reservado en {city.name}
              </h3>

              {cityAccommodations.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-[28px] border border-[#E5E0D5] text-[#737260]">
                  <Hotel className="w-10 h-10 mx-auto mb-2 text-[#8C8B79]" />
                  <p className="text-sm font-bold text-[#434338]">No hay alojamiento asignado a esta ciudad</p>
                  <p className="text-xs text-[#737260] mt-1">
                    Puedes agregar el hotel desde la pestaña de Itinerario principal.
                  </p>
                </div>
              ) : (
                cityAccommodations.map(acc => {
                  const mapsUrl =
                    acc.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(acc.name + ' ' + acc.address)}`;
                  return (
                    <div
                      key={acc.id}
                      className="rounded-[28px] border border-[#E5E0D5] bg-white shadow-xs overflow-hidden"
                    >
                      {acc.photoUrl && (
                        <div className="relative h-32 w-full overflow-hidden bg-[#434338]">
                          <img
                            src={acc.photoUrl}
                            alt={acc.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-base font-serif font-bold text-[#434338]">{acc.name}</h4>
                            <p className="text-xs text-[#737260]">{acc.address}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E9EDC6]/80 text-[#434338] border border-[#D9D1B9] shrink-0 self-start">
                            {acc.status === 'pagado' ? '✅ Pagado' : '🔖 Reservado (Pagar en destino)'}
                          </span>
                        </div>

                        {acc.roomType && (
                          <div className="text-xs font-semibold text-[#D4A373]">
                            🛏️ {acc.roomType}
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                          <div className="p-2.5 bg-[#F9F8F4] rounded-xl border border-[#E5E0D5]">
                            <span className="text-[#737260] block text-[10px] uppercase font-bold">Check-in</span>
                            <span className="font-bold text-[#434338]">{acc.checkInDate} ({acc.checkInTime})</span>
                          </div>
                          <div className="p-2.5 bg-[#F9F8F4] rounded-xl border border-[#E5E0D5]">
                            <span className="text-[#737260] block text-[10px] uppercase font-bold">Check-out</span>
                            <span className="font-bold text-[#434338]">{acc.checkOutDate} ({acc.checkOutTime})</span>
                          </div>
                          <div className="p-2.5 bg-[#F9F8F4] rounded-xl border border-[#E5E0D5]">
                            <span className="text-[#737260] block text-[10px] uppercase font-bold">Código Reserva</span>
                            <span className="font-mono font-bold text-[#434338]">{acc.bookingCode || '—'}</span>
                          </div>
                          <div className="p-2.5 bg-[#F9F8F4] rounded-xl border border-[#E5E0D5]">
                            <span className="text-[#737260] block text-[10px] uppercase font-bold">Teléfono</span>
                            <span className="font-bold text-[#434338]">{acc.contactPhone || '—'}</span>
                          </div>
                        </div>

                        {acc.notes && (
                          <div className="p-3 bg-[#FAF6E9] rounded-xl border border-[#EBE3CD] text-xs text-[#434338]">
                            🔑 <strong>Notas:</strong> {acc.notes}
                          </div>
                        )}

                        <div className="pt-2 flex justify-start">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#E9EDC6]" />
                            Abrir Ubicación en Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: SITIOS GUARDADOS */}
          {activeSubTab === 'sitios' && (
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-[#434338]">
                Lugares & Rincones Guardados en {city.name}
              </h3>

              {citySites.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-[28px] border border-[#E5E0D5] text-[#737260]">
                  <Navigation className="w-10 h-10 mx-auto mb-2 text-[#8C8B79]" />
                  <p className="text-sm font-bold text-[#434338]">No hay sitios guardados en {city.name}</p>
                  <p className="text-xs text-[#737260] mt-1">
                    Ve a la pestaña "Sitios & Google Maps" para añadir restaurantes, miradores o actividades para esta ciudad.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {citySites.map(site => (
                    <div
                      key={site.id}
                      className="bg-white rounded-[28px] border border-[#E5E0D5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {site.photos.length > 0 && (
                        <div className="h-36 w-full overflow-hidden bg-[#434338] relative">
                          <img
                            src={site.photos[0]}
                            alt={site.name}
                            className="w-full h-full object-cover object-center"
                          />
                          <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5A5A40]/90 text-white backdrop-blur-md">
                            {site.category.toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-[#434338]">{site.name}</h4>
                          <p className="text-xs text-[#737260] mt-1 line-clamp-2">{site.notes}</p>
                        </div>

                        <div className="pt-3 border-t border-[#EFEDE7] flex items-center justify-between">
                          <span className="text-[11px] font-medium text-[#737260]">
                            {site.estimatedCost || 'Gratis'}
                          </span>
                          <a
                            href={site.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs font-bold text-[#5A5A40] hover:text-[#434338] cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
