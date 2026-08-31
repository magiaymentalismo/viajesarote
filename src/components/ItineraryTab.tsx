import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import {
  Plane,
  Train,
  Car,
  Ship,
  Hotel,
  MapPin,
  Calendar,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Plus,
  ArrowRight,
  Sparkles,
  Luggage,
  Shield,
  Trash2,
  Edit2,
  X,
  Navigation,
  Upload,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { CityDetailModal } from './CityDetailModal';
import { DestinationCity, TransportBooking, TransportType, BookingStatus, AccommodationBooking } from '../types';

const TRANSPORT_ICONS: Record<TransportType, React.ReactNode> = {
  vuelo: <Plane className="w-5 h-5 text-[#5A5A40]" />,
  tren: <Train className="w-5 h-5 text-[#5A5A40]" />,
  auto_alquiler: <Car className="w-5 h-5 text-[#D4A373]" />,
  ferry: <Ship className="w-5 h-5 text-[#5A5A40]" />,
  traslado: <Car className="w-5 h-5 text-[#5A5A40]" />,
  bus: <Car className="w-5 h-5 text-[#737260]" />,
};

const POPULAR_DESTINATIONS = [
  { name: 'Roma', country: 'Italia', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80' },
  { name: 'París', country: 'Francia', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Bangkok', country: 'Tailandia', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Tokio', country: 'Japón', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Barcelona', country: 'España', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Cancún', country: 'México', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Londres', country: 'Reino Unido', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Nueva York', country: 'EE.UU.', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80' },
];

export const ItineraryTab: React.FC = () => {
  const { trip, addTransport, deleteTransport, addAccommodation, deleteAccommodation, addCity, deleteCity } = useTrip();

  const [selectedCityForDetail, setSelectedCityForDetail] = useState<DestinationCity | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals
  const [isAddTransportOpen, setIsAddTransportOpen] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [isAddAccOpen, setIsAddAccOpen] = useState(false);

  // City Feedback states
  const [cityError, setCityError] = useState<string | null>(null);
  const [citySuccess, setCitySuccess] = useState<string | null>(null);

  // Form State for Transport
  const [transForm, setTransForm] = useState({
    type: 'vuelo' as TransportType,
    title: '',
    operator: '',
    bookingReference: '',
    departurePlace: '',
    arrivalPlace: '',
    departureDateTime: '',
    arrivalDateTime: '',
    flightNumber: '',
    terminal: '',
    gate: '',
    seatPartner1: '',
    seatPartner2: '',
    baggageNotes: '',
    notes: '',
    status: 'confirmado' as BookingStatus,
    directLinkOrTicket: '',
  });

  // Form State for City
  const [cityForm, setCityForm] = useState({
    name: '',
    country: '',
    arrivalDate: '',
    departureDate: '',
    coverImage: '',
    googleMapsUrl: '',
    police: '112',
    medical: '118',
    embassy: '',
    weather: '',
    plugs: 'Tipo C/F (230V)',
    transport: '',
    localCurrency: trip.currency,
    safety: 'Zona turística segura',
  });

  // Form State for Accommodation
  const [accForm, setAccForm] = useState({
    cityId: trip.cities[0]?.id || '',
    name: '',
    address: '',
    checkInDate: '',
    checkInTime: '14:00',
    checkOutDate: '',
    checkOutTime: '11:00',
    bookingCode: '',
    contactPhone: '',
    totalCost: 0,
    googleMapsUrl: '',
    photoUrl: '',
    notes: '',
    roomType: '',
  });

  const p1 = trip.partners[0];
  const p2 = trip.partners[1];

  // Helper for image upload from gallery/camera with canvas compression
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (base64Url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onLoaded(compressedDataUrl);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateTransport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transForm.title.trim()) return;

    addTransport({
      type: transForm.type,
      title: transForm.title.trim(),
      operator: transForm.operator.trim(),
      bookingReference: transForm.bookingReference.trim(),
      departurePlace: transForm.departurePlace.trim(),
      arrivalPlace: transForm.arrivalPlace.trim(),
      departureDateTime: transForm.departureDateTime || new Date().toISOString(),
      arrivalDateTime: transForm.arrivalDateTime || new Date().toISOString(),
      flightNumber: transForm.flightNumber.trim() || undefined,
      terminal: transForm.terminal.trim() || undefined,
      gate: transForm.gate.trim() || undefined,
      seatPartner1: transForm.seatPartner1.trim() || undefined,
      seatPartner2: transForm.seatPartner2.trim() || undefined,
      baggageNotes: transForm.baggageNotes.trim() || undefined,
      notes: transForm.notes.trim() || undefined,
      status: transForm.status,
      directLinkOrTicket: transForm.directLinkOrTicket.trim() || undefined,
    });
    setIsAddTransportOpen(false);
  };

  const handleCreateCity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCityError(null);
    if (!cityForm.name || !cityForm.name.trim()) {
      setCityError('Por favor escribe o selecciona el nombre de la ciudad o destino');
      return;
    }

    const cityName = cityForm.name.trim();
    const arrival = cityForm.arrivalDate || trip.startDate || new Date().toISOString().split('T')[0];
    const departure = cityForm.departureDate || trip.endDate || arrival;

    addCity({
      name: cityName,
      country: cityForm.country.trim() || 'Destino',
      arrivalDate: arrival,
      departureDate: departure,
      coverImage:
        cityForm.coverImage.trim() ||
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80',
      googleMapsUrl:
        cityForm.googleMapsUrl.trim() ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cityName + ' ' + (cityForm.country || ''))}`,
      emergencyInfo: {
        police: cityForm.police || '112',
        medical: cityForm.medical || '118',
        embassy: cityForm.embassy || 'Consulado General',
      },
      practicalTips: {
        weather: cityForm.weather || 'Clima agradable',
        plugs: cityForm.plugs || 'Tipo C/F (230V)',
        transport: cityForm.transport || 'Metro, autobuses y caminar',
        localCurrency: cityForm.localCurrency || trip.currency,
        safety: cityForm.safety || 'Zona turística segura',
      },
      dayPlans: [
        {
          id: 'plan-d1-' + Date.now().toString(36),
          date: arrival,
          dayNumber: 1,
          title: `Llegada a ${cityName}`,
          morningActivities: ['Check-in y acomodar equipaje'],
          afternoonActivities: ['Paseo exploratorio y café'],
          eveningActivities: ['Cena de bienvenida'],
          notes: 'Día de llegada',
        },
      ],
    });

    setIsAddCityOpen(false);
    setCityError(null);
    setCityForm({
      name: '',
      country: '',
      arrivalDate: '',
      departureDate: '',
      coverImage: '',
      googleMapsUrl: '',
      police: '112',
      medical: '118',
      embassy: '',
      weather: '',
      plugs: 'Tipo C/F (230V)',
      transport: '',
      localCurrency: trip.currency,
      safety: 'Zona turística segura',
    });
  };

  const handleCreateAccommodation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accForm.name.trim()) return;

    addAccommodation({
      cityId: accForm.cityId || trip.cities[0]?.id || 'city-1',
      name: accForm.name.trim(),
      address: accForm.address.trim(),
      checkInDate: accForm.checkInDate || trip.startDate,
      checkInTime: accForm.checkInTime,
      checkOutDate: accForm.checkOutDate || trip.endDate,
      checkOutTime: accForm.checkOutTime,
      bookingCode: accForm.bookingCode.trim(),
      contactPhone: accForm.contactPhone.trim(),
      totalCost: Number(accForm.totalCost) || 0,
      currency: trip.currency,
      status: 'pagado',
      googleMapsUrl:
        accForm.googleMapsUrl.trim() ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accForm.name + ' ' + accForm.address)}`,
      photoUrl: accForm.photoUrl.trim() || undefined,
      notes: accForm.notes.trim() || undefined,
      roomType: accForm.roomType.trim() || undefined,
    });
    setIsAddAccOpen(false);
  };

  const formatDateTime = (dtStr: string) => {
    try {
      const d = new Date(dtStr);
      return d.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dtStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: CIUDADES & DESTINOS INTERACTIVOS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-[#E9EDC6] text-[#5A5A40] rounded-2xl">
                <MapPin className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-serif font-bold text-[#434338]">
                Ciudades & Destinos del Viaje
              </h3>
            </div>
            <p className="text-xs text-[#737260] mt-1">
              Haz clic en cualquier ciudad para abrir su <strong>página dedicada</strong> con calendario diario, info útil y reservas.
            </p>
          </div>

          <button
            id="btn-add-city"
            onClick={() => {
              setCityForm({
                name: '',
                country: '',
                arrivalDate: trip.startDate,
                departureDate: trip.endDate,
                coverImage: '',
                police: '112',
                medical: '118',
                embassy: '',
                weather: '',
                plugs: 'Tipo C/F (230V)',
                transport: '',
                localCurrency: trip.currency,
                safety: 'Zona turística segura',
              });
              setIsAddCityOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start"
          >
            <Plus className="w-4 h-4" />
            Añadir Ciudad / Destino
          </button>
        </div>

        {/* Cities Grid */}
        {trip.cities.length === 0 ? (
          <div className="bg-white rounded-[28px] border border-dashed border-[#D9D1B9] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF6E9] border border-[#EBE3CD] flex items-center justify-center mx-auto text-[#5A5A40]">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="text-base font-serif font-bold text-[#434338]">
              Aún no has añadido destinos a este viaje
            </h4>
            <p className="text-xs text-[#737260] max-w-md mx-auto">
              Toca el botón <strong>"Añadir Ciudad / Destino"</strong> para crear tu primera parada con sus fechas, hoteles y planes diarios.
            </p>
            <button
              onClick={() => {
                setCityForm({
                  name: '',
                  country: '',
                  arrivalDate: trip.startDate,
                  departureDate: trip.endDate,
                  coverImage: '',
                  googleMapsUrl: '',
                  police: '112',
                  medical: '118',
                  embassy: '',
                  weather: '',
                  plugs: 'Tipo C/F (230V)',
                  transport: '',
                  localCurrency: trip.currency,
                  safety: 'Zona turística segura',
                });
                setIsAddCityOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Añadir Primera Parada
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {trip.cities.map((city, idx) => (
              <div
                key={city.id}
                onClick={() => setSelectedCityForDetail(city)}
                className="group bg-white rounded-[28px] border border-[#E5E0D5] shadow-xs hover:shadow-lg hover:border-[#D4A373] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-[#434338]">
                  <img
                    src={city.coverImage}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold bg-[#5A5A40]/90 backdrop-blur-xs text-white shadow-sm">
                    Parada #{idx + 1}
                  </span>

                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <div className="text-[11px] font-bold text-[#E9EDC6] uppercase tracking-wider">
                      {city.country}
                    </div>
                    <h4 className="text-2xl font-serif font-bold drop-shadow-xs">
                      {city.name}
                    </h4>
                  </div>
                </div>

                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs text-[#737260]">
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>
                        {city.arrivalDate} al {city.departureDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>{city.dayPlans.length} días planificados</span>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-[#EFEDE7] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5A5A40] group-hover:text-[#434338] flex items-center gap-1">
                      Abrir Página de {city.name}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar la ciudad ${city.name} del itinerario?`)) {
                          deleteCity(city.id);
                        }
                      }}
                      className="p-1.5 text-[#8C8B79] hover:text-[#D4A373] transition-colors cursor-pointer"
                      title="Eliminar ciudad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: VUELOS, TRASLADOS & PASAJES (ACCESO RÁPIDO) */}
      <div className="space-y-4 pt-6 border-t border-[#D9D1B9]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-[#E9E5D9] text-[#5A5A40] rounded-2xl">
                <Plane className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-serif font-bold text-[#434338]">
                Vuelos, Trenes & Traslados
              </h3>
            </div>
            <p className="text-xs text-[#737260] mt-1">
              Acceso inmediato a números de vuelo, terminales, puertas de embarque, asientos y localizadores.
            </p>
          </div>

          <button
            id="btn-add-transport"
            onClick={() => {
              setTransForm({
                type: 'vuelo',
                title: '',
                operator: '',
                bookingReference: '',
                departurePlace: '',
                arrivalPlace: '',
                departureDateTime: '',
                arrivalDateTime: '',
                flightNumber: '',
                terminal: '',
                gate: '',
                seatPartner1: '',
                seatPartner2: '',
                baggageNotes: '',
                notes: '',
                status: 'confirmado',
                directLinkOrTicket: '',
              });
              setIsAddTransportOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start"
          >
            <Plus className="w-4 h-4" />
            Añadir Vuelo / Traslado
          </button>
        </div>

        {/* Transport List */}
        <div className="space-y-4">
          {trip.transports.map(trans => (
            <div
              key={trans.id}
              className="bg-white rounded-[28px] border border-[#E5E0D5] p-6 shadow-xs hover:border-[#D9D1B9] transition-all space-y-4"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#EFEDE7]">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F5F2ED] border border-[#D9D1B9] flex items-center justify-center">
                    {TRANSPORT_ICONS[trans.type] || <Plane className="w-5 h-5 text-[#5A5A40]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#737260] uppercase tracking-wider">
                        {trans.type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E9EDC6]/80 text-[#434338] border border-[#D9D1B9]">
                        {trans.status.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[#434338]">{trans.title}</h4>
                    <div className="text-xs text-[#737260] font-medium">{trans.operator}</div>
                  </div>
                </div>

                {/* Booking Code Quick Copy */}
                {trans.bookingReference && (
                  <div className="flex items-center gap-2 bg-[#F5F2ED] p-2.5 rounded-2xl border border-[#D9D1B9]">
                    <div className="text-right">
                      <span className="text-[10px] text-[#737260] font-bold block uppercase">
                        Código / PNR
                      </span>
                      <span className="font-mono text-sm font-extrabold text-[#434338]">
                        {trans.bookingReference}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(trans.bookingReference)}
                      className="p-1.5 rounded-xl text-[#737260] hover:text-[#434338] hover:bg-[#E9E5D9] transition-colors cursor-pointer"
                      title="Copiar código localizador"
                    >
                      {copiedCode === trans.bookingReference ? (
                        <Check className="w-4 h-4 text-[#5A5A40]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Route & Times */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#F9F8F4] p-4 rounded-2xl border border-[#E5E0D5]">
                <div>
                  <span className="text-[#737260] block text-[10px] uppercase font-bold">Origen</span>
                  <div className="font-bold text-[#434338] text-sm mt-0.5">{trans.departurePlace}</div>
                  <div className="text-[#737260] text-xs mt-0.5">{formatDateTime(trans.departureDateTime)}</div>
                </div>

                <div className="flex items-center justify-center text-[#8C8B79]">
                  <div className="w-full flex items-center gap-2">
                    <div className="h-px bg-[#D9D1B9] flex-1" />
                    <ArrowRight className="w-4 h-4 text-[#5A5A40]" />
                    <div className="h-px bg-[#D9D1B9] flex-1" />
                  </div>
                </div>

                <div>
                  <span className="text-[#737260] block text-[10px] uppercase font-bold">Destino</span>
                  <div className="font-bold text-[#434338] text-sm mt-0.5">{trans.arrivalPlace}</div>
                  <div className="text-[#737260] text-xs mt-0.5">{formatDateTime(trans.arrivalDateTime)}</div>
                </div>
              </div>

              {/* Fast Access Badges (Terminal, Gate, Seats, Baggage) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {trans.flightNumber && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#E9E5D9] text-[#434338] border border-[#D9D1B9]">
                    ✈️ Vuelo: {trans.flightNumber}
                  </span>
                )}
                {trans.terminal && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#F5F2ED] text-[#434338] border border-[#D9D1B9]">
                    🏢 Terminal: {trans.terminal}
                  </span>
                )}
                {trans.gate && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#E9EDC6] text-[#434338] border border-[#D9D1B9]">
                    🚪 Puerta: {trans.gate}
                  </span>
                )}
                {trans.seatPartner1 && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#E9E5D9] text-[#434338] border border-[#D9D1B9]">
                    💺 {p1.name}: {trans.seatPartner1}
                  </span>
                )}
                {trans.seatPartner2 && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#E9EDC6] text-[#434338] border border-[#D9D1B9]">
                    💺 {p2.name}: {trans.seatPartner2}
                  </span>
                )}
                {trans.baggageNotes && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-[#F5F2ED] text-[#434338] border border-[#D9D1B9]">
                    🧳 {trans.baggageNotes}
                  </span>
                )}
              </div>

              {trans.notes && (
                <div className="text-xs text-[#737260] bg-[#F5F2ED] p-3 rounded-2xl border border-[#E5E0D5]">
                  📌 <strong>Nota rápida:</strong> {trans.notes}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#EFEDE7] text-xs">
                {trans.directLinkOrTicket ? (
                  <a
                    href={trans.directLinkOrTicket}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-[#5A5A40] hover:text-[#434338]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver Tarjeta de Embarque / Web Oficial
                  </a>
                ) : (
                  <span />
                )}

                <button
                  onClick={() => deleteTransport(trans.id)}
                  className="text-[#8C8B79] hover:text-[#D4A373] p-1.5 transition-colors cursor-pointer"
                  title="Eliminar traslado"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: HOTELES & ALOJAMIENTOS */}
      <div className="space-y-4 pt-6 border-t border-[#D9D1B9]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-[#E9EDC6] text-[#5A5A40] rounded-2xl">
                <Hotel className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-serif font-bold text-[#434338]">
                Hoteles & Alojamientos Reservados
              </h3>
            </div>
            <p className="text-xs text-[#737260] mt-1">
              Direcciones exactas, horarios de check-in y códigos de acceso.
            </p>
          </div>

          <button
            id="btn-add-acc"
            onClick={() => {
              setAccForm({
                cityId: trip.cities[0]?.id || '',
                name: '',
                address: '',
                checkInDate: trip.startDate,
                checkInTime: '14:00',
                checkOutDate: trip.endDate,
                checkOutTime: '11:00',
                bookingCode: '',
                contactPhone: '',
                totalCost: 0,
                googleMapsUrl: '',
                notes: '',
                roomType: '',
              });
              setIsAddAccOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start"
          >
            <Plus className="w-4 h-4" />
            Añadir Alojamiento
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trip.accommodations.map(acc => {
            const cityName = trip.cities.find(c => c.id === acc.cityId)?.name || 'Destino';
            const mapsUrl =
              acc.googleMapsUrl ||
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(acc.name + ' ' + acc.address)}`;
            return (
              <div
                key={acc.id}
                className="bg-white rounded-[28px] border border-[#E5E0D5] overflow-hidden shadow-xs hover:border-[#D9D1B9] transition-all flex flex-col justify-between"
              >
                {/* Photo banner if exists */}
                {acc.photoUrl && (
                  <div className="relative h-36 w-full overflow-hidden bg-[#434338]">
                    <img
                      src={acc.photoUrl}
                      alt={acc.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    <span className="absolute bottom-2.5 left-3.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#E9E5D9] text-[#5A5A40] shadow-xs">
                      📍 {cityName}
                    </span>
                    <span className="absolute top-2.5 right-3.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E9EDC6]/90 text-[#434338] backdrop-blur-xs">
                      {acc.status === 'pagado' ? '✅ Pagado' : '🔖 Reservado'}
                    </span>
                  </div>
                )}

                <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {!acc.photoUrl && (
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#E9E5D9] text-[#5A5A40]">
                          📍 {cityName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E9EDC6]/80 text-[#434338] border border-[#D9D1B9]">
                          {acc.status === 'pagado' ? '✅ Pagado' : '🔖 Reservado'}
                        </span>
                      </div>
                    )}

                    <h4 className="text-base font-serif font-bold text-[#434338]">{acc.name}</h4>
                    <p className="text-xs text-[#737260] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4A373] shrink-0" />
                      <span>{acc.address || 'Dirección no especificada'}</span>
                    </p>

                    {acc.roomType && (
                      <div className="text-xs font-semibold text-[#D4A373] mt-1.5 flex items-center gap-1.5">
                        <span>🛏️ {acc.roomType}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#F9F8F4] p-3 rounded-2xl border border-[#E5E0D5] mt-3">
                      <div>
                        <span className="text-[10px] text-[#737260] uppercase font-bold block">Check-in</span>
                        <span className="font-bold text-[#434338]">{acc.checkInDate} ({acc.checkInTime})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#737260] uppercase font-bold block">Check-out</span>
                        <span className="font-bold text-[#434338]">{acc.checkOutDate} ({acc.checkOutTime})</span>
                      </div>
                    </div>

                    {acc.bookingCode && (
                      <div className="flex items-center justify-between mt-2.5 px-3 py-1.5 rounded-xl bg-[#E9E5D9]/50 text-xs">
                        <span className="text-[#737260]">Código: <span className="font-mono font-bold text-[#434338]">{acc.bookingCode}</span></span>
                        <button
                          onClick={() => handleCopyCode(acc.bookingCode)}
                          className="text-[#5A5A40] hover:text-[#434338] p-1 cursor-pointer"
                          title="Copiar código"
                        >
                          {copiedCode === acc.bookingCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#EFEDE7] flex items-center justify-between gap-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-[#5A5A40] text-white hover:bg-[#434338] transition-colors cursor-pointer shadow-xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#E9EDC6]" />
                      Abrir en Google Maps
                    </a>

                    <button
                      onClick={() => deleteAccommodation(acc.id)}
                      className="text-[#8C8B79] hover:text-[#D4A373] p-2 transition-colors cursor-pointer"
                      title="Eliminar alojamiento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: City Details Modal */}
      {selectedCityForDetail && (
        <CityDetailModal
          city={selectedCityForDetail}
          onClose={() => setSelectedCityForDetail(null)}
        />
      )}

      {/* MODAL 2: Add Transport */}
      {isAddTransportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),16px)] bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-[#FBF9F5] rounded-[28px] sm:rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-lg w-full p-5 sm:p-7 max-h-[88vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-[#E9EDC6] text-[#5A5A40]">
                  <Plane className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#434338]">
                  Añadir Vuelo o Traslado
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTransportOpen(false)}
                className="p-2 rounded-xl text-[#8C8B79] hover:text-[#434338] hover:bg-[#E9E5D9] cursor-pointer transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransport} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                  Tipo de Transporte
                </label>
                <select
                  value={transForm.type}
                  onChange={e => setTransForm({ ...transForm, type: e.target.value as TransportType })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                >
                  <option value="vuelo">✈️ Vuelo</option>
                  <option value="tren">🚆 Tren</option>
                  <option value="auto_alquiler">🚗 Auto de Alquiler</option>
                  <option value="ferry">🚢 Ferry / Barco</option>
                  <option value="traslado">🚐 Traslado Privado</option>
                  <option value="bus">🚌 Autobús</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                  Título / Descripción *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Vuelo Madrid -> Roma"
                  value={transForm.title}
                  onChange={e => setTransForm({ ...transForm, title: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Aerolínea / Compañía
                  </label>
                  <input
                    type="text"
                    placeholder="Iberia, Trenitalia..."
                    value={transForm.operator}
                    onChange={e => setTransForm({ ...transForm, operator: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Código Localizador (PNR)
                  </label>
                  <input
                    type="text"
                    placeholder="IB-994KLA"
                    value={transForm.bookingReference}
                    onChange={e => setTransForm({ ...transForm, bookingReference: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl font-mono focus:outline-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Lugar de Salida
                  </label>
                  <input
                    type="text"
                    placeholder="Madrid Barajas T4"
                    value={transForm.departurePlace}
                    onChange={e => setTransForm({ ...transForm, departurePlace: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Lugar de Llegada
                  </label>
                  <input
                    type="text"
                    placeholder="Roma Fiumicino T3"
                    value={transForm.arrivalPlace}
                    onChange={e => setTransForm({ ...transForm, arrivalPlace: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Fecha y Hora Salida
                  </label>
                  <input
                    type="datetime-local"
                    value={transForm.departureDateTime}
                    onChange={e => setTransForm({ ...transForm, departureDateTime: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Fecha y Hora Llegada
                  </label>
                  <input
                    type="datetime-local"
                    value={transForm.arrivalDateTime}
                    onChange={e => setTransForm({ ...transForm, arrivalDateTime: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Nº Vuelo
                  </label>
                  <input
                    type="text"
                    placeholder="IB 3214"
                    value={transForm.flightNumber}
                    onChange={e => setTransForm({ ...transForm, flightNumber: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Terminal
                  </label>
                  <input
                    type="text"
                    placeholder="T4"
                    value={transForm.terminal}
                    onChange={e => setTransForm({ ...transForm, terminal: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Puerta
                  </label>
                  <input
                    type="text"
                    placeholder="K72"
                    value={transForm.gate}
                    onChange={e => setTransForm({ ...transForm, gate: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Asiento {p1.name}
                  </label>
                  <input
                    type="text"
                    placeholder="14A Ventana"
                    value={transForm.seatPartner1}
                    onChange={e => setTransForm({ ...transForm, seatPartner1: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Asiento {p2.name}
                  </label>
                  <input
                    type="text"
                    placeholder="14B Medio"
                    value={transForm.seatPartner2}
                    onChange={e => setTransForm({ ...transForm, seatPartner2: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                  Notas de Equipaje o Acceso
                </label>
                <input
                  type="text"
                  placeholder="2 maletas bodega 23kg + 2 carry on"
                  value={transForm.baggageNotes}
                  onChange={e => setTransForm({ ...transForm, baggageNotes: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EFEDE7]">
                <button
                  type="button"
                  onClick={() => setIsAddTransportOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#737260] hover:bg-[#F5F2ED] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-xl cursor-pointer"
                >
                  Guardar Vuelo / Traslado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add City */}
      {isAddCityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),16px)] bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-[#FBF9F5] rounded-[28px] sm:rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-lg w-full p-5 sm:p-7 max-h-[88vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-[#E9EDC6] text-[#5A5A40]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#434338]">
                    Añadir Ciudad o Destino
                  </h3>
                  <p className="text-xs text-[#737260]">
                    Crea una nueva parada para su itinerario
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCityError(null);
                  setIsAddCityOpen(false);
                }}
                className="p-2 rounded-xl text-[#8C8B79] hover:text-[#434338] hover:bg-[#E9E5D9] cursor-pointer transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Messages */}
            {cityError && (
              <div className="mt-3 p-3 bg-[#FBF0E4] border border-[#F3DEC9] rounded-2xl text-xs font-bold text-[#8A5A2B] flex items-center gap-2">
                <span>⚠️ {cityError}</span>
              </div>
            )}

            {citySuccess && (
              <div className="mt-3 p-3 bg-[#E9EDC6] border border-[#DCE4B8] rounded-2xl text-xs font-bold text-[#5A5A40] flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-[#5A5A40] shrink-0" />
                <span>{citySuccess}</span>
              </div>
            )}

            {/* Popular Quick Presets */}
            <div className="mt-4 p-3 bg-[#FAF6E9] rounded-2xl border border-[#EBE3CD] space-y-2">
              <span className="text-[11px] font-bold uppercase text-[#737260] block">
                Destinos Populares (1 Toque para rellenar)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_DESTINATIONS.map(dest => (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => {
                      setCityForm({
                        ...cityForm,
                        name: dest.name,
                        country: dest.country,
                        coverImage: dest.image,
                        arrivalDate: cityForm.arrivalDate || trip.startDate,
                        departureDate: cityForm.departureDate || trip.endDate,
                      });
                      setCityError(null);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-full bg-white border border-[#D9D1B9] hover:bg-[#5A5A40] hover:text-white hover:border-[#5A5A40] transition-colors cursor-pointer text-[#434338]"
                  >
                    📍 {dest.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateCity} noValidate className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Nombre de la Ciudad / Parada *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Bangkok, Roma, París, Cancún..."
                  value={cityForm.name}
                  onChange={e => {
                    setCityForm({ ...cityForm, name: e.target.value });
                    if (cityError) setCityError(null);
                  }}
                  className="w-full text-sm p-3 border border-[#D9D1B9] rounded-2xl bg-white font-bold text-[#434338] focus:outline-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  País
                </label>
                <input
                  type="text"
                  placeholder="Ej: Tailandia, Italia, Francia, México..."
                  value={cityForm.country}
                  onChange={e => setCityForm({ ...cityForm, country: e.target.value })}
                  className="w-full text-xs p-3 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338] focus:outline-[#5A5A40]"
                />
              </div>

              {/* Spacious Dates */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Fechas de Estancia
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-[#737260] font-medium block mb-1">📅 Fecha de Llegada</span>
                    <input
                      type="date"
                      value={cityForm.arrivalDate}
                      onChange={e => setCityForm({ ...cityForm, arrivalDate: e.target.value })}
                      className="w-full text-xs p-3 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338] focus:outline-[#5A5A40]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#737260] font-medium block mb-1">📅 Fecha de Salida</span>
                    <input
                      type="date"
                      value={cityForm.departureDate}
                      onChange={e => setCityForm({ ...cityForm, departureDate: e.target.value })}
                      className="w-full text-xs p-3 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338] focus:outline-[#5A5A40]"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload: URL or Gallery */}
              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Foto de Portada de la Ciudad (Opcional)
                </label>
                <div className="space-y-2">
                  <label className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-[#D9D1B9] hover:border-[#5A5A40] rounded-2xl bg-[#F9F8F4] text-xs font-bold text-[#5A5A40] cursor-pointer transition-colors">
                    <Camera className="w-4 h-4 text-[#D4A373]" />
                    <span>Subir Foto desde Galería / Cámara</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageFileUpload(e, url => setCityForm({ ...cityForm, coverImage: url }))}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="O escribe URL de foto: https://images.unsplash.com/..."
                    value={cityForm.coverImage}
                    onChange={e => setCityForm({ ...cityForm, coverImage: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white focus:outline-[#5A5A40]"
                  />
                </div>

                {cityForm.coverImage && (
                  <div className="relative mt-2 h-32 rounded-2xl overflow-hidden border border-[#D9D1B9]">
                    <img
                      src={cityForm.coverImage}
                      alt="Vista previa ciudad"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCityForm({ ...cityForm, coverImage: '' })}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black cursor-pointer"
                      title="Quitar foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  📍 Enlace de Google Maps (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/..."
                  value={cityForm.googleMapsUrl}
                  onChange={e => setCityForm({ ...cityForm, googleMapsUrl: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white focus:outline-[#5A5A40]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFEDE7]">
                <button
                  type="button"
                  onClick={() => {
                    setCityError(null);
                    setIsAddCityOpen(false);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-[#737260] hover:bg-[#E9E5D9] rounded-2xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateCity()}
                  className="px-6 py-3 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-2xl cursor-pointer shadow-md shadow-[#5A5A40]/15 active:scale-95 transition-transform flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Destino</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Add Accommodation */}
      {isAddAccOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),16px)] bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-[#FBF9F5] rounded-[28px] sm:rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-lg w-full p-5 sm:p-7 max-h-[88vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-[#E9EDC6] text-[#5A5A40]">
                  <Hotel className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#434338]">
                  Añadir Hotel o Alojamiento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAccOpen(false)}
                className="p-2 rounded-xl text-[#8C8B79] hover:text-[#434338] hover:bg-[#E9E5D9] cursor-pointer transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccommodation} noValidate className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                  Ciudad
                </label>
                <select
                  value={accForm.cityId}
                  onChange={e => setAccForm({ ...accForm, cityId: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                >
                  {trip.cities.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                  Nombre del Hotel / Airbnb *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Residenza San Calisto Trastevere"
                  value={accForm.name}
                  onChange={e => {
                    const name = e.target.value;
                    setAccForm({
                      ...accForm,
                      name,
                      googleMapsUrl: accForm.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + accForm.address)}`
                    });
                  }}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Via dell’Arco di San Calisto 20, Roma"
                  value={accForm.address}
                  onChange={e => {
                    const address = e.target.value;
                    setAccForm({
                      ...accForm,
                      address,
                      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accForm.name + ' ' + address)}`
                    });
                  }}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                  📍 Enlace de Google Maps
                </label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/..."
                  value={accForm.googleMapsUrl}
                  onChange={e => setAccForm({ ...accForm, googleMapsUrl: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                />
                <p className="text-[10px] text-[#737260] mt-1">
                  Se abrirá directamente al tocar el botón en el itinerario.
                </p>
              </div>

              {/* Hotel Photo: Upload or URL */}
              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                  Foto del Hotel / Alojamiento (Opcional)
                </label>
                <div className="space-y-2">
                  <label className="w-full flex items-center justify-center gap-2 p-2.5 border border-dashed border-[#D9D1B9] hover:border-[#5A5A40] rounded-2xl bg-[#F9F8F4] text-xs font-bold text-[#5A5A40] cursor-pointer transition-colors">
                    <Camera className="w-4 h-4 text-[#D4A373]" />
                    <span>Subir Foto desde Galería / Cámara</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageFileUpload(e, url => setAccForm({ ...accForm, photoUrl: url }))}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="O pega URL de foto: https://..."
                    value={accForm.photoUrl}
                    onChange={e => setAccForm({ ...accForm, photoUrl: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>

                {accForm.photoUrl && (
                  <div className="relative mt-2 h-28 rounded-2xl overflow-hidden border border-[#D9D1B9]">
                    <img
                      src={accForm.photoUrl}
                      alt="Vista previa hotel"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setAccForm({ ...accForm, photoUrl: '' })}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={accForm.checkInDate}
                    onChange={e => setAccForm({ ...accForm, checkInDate: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={accForm.checkOutDate}
                    onChange={e => setAccForm({ ...accForm, checkOutDate: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Código de Reserva
                  </label>
                  <input
                    type="text"
                    placeholder="BOOKING-12345"
                    value={accForm.bookingCode}
                    onChange={e => setAccForm({ ...accForm, bookingCode: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl font-mono focus:outline-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                    Teléfono Contacto
                  </label>
                  <input
                    type="text"
                    placeholder="+39 06 1234 5678"
                    value={accForm.contactPhone}
                    onChange={e => setAccForm({ ...accForm, contactPhone: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-1">
                  Tipo de Habitación / Notas
                </label>
                <input
                  type="text"
                  placeholder="Habitación Deluxe con balcón / Desayuno incluido"
                  value={accForm.roomType}
                  onChange={e => setAccForm({ ...accForm, roomType: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl focus:outline-[#5A5A40]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EFEDE7]">
                <button
                  type="button"
                  onClick={() => setIsAddAccOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#737260] hover:bg-[#F5F2ED] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-xl cursor-pointer"
                >
                  Guardar Alojamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
