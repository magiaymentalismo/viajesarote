import React, { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import {
  Calendar,
  MapPin,
  Sparkles,
  Heart,
  Edit3,
} from 'lucide-react';

export type ActiveTab =
  | 'gastos'
  | 'itinerario'
  | 'sitios'
  | 'equipaje-docs'
  | 'buzon'
  | 'galeria';

interface CountdownHeaderProps {
  onOpenEditTripModal: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalDaysTrip: number;
}

export const CountdownHeader: React.FC<CountdownHeaderProps> = ({
  onOpenEditTripModal,
}) => {
  const { trip } = useTrip();

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    totalDaysTrip: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(trip.startDate + 'T00:00:00');
      const end = new Date(trip.endDate + 'T23:59:59');
      const now = new Date();

      const diffStart = start.getTime() - now.getTime();
      const tripDurationMs = end.getTime() - start.getTime();
      const totalDays = Math.max(1, Math.round(tripDurationMs / (1000 * 60 * 60 * 24)));

      if (diffStart <= 0) {
        // Trip is happening now or in the past
        const diffEnd = end.getTime() - now.getTime();
        if (diffEnd > 0) {
          const daysIn = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          setTimeLeft({
            days: daysIn,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isPast: false,
            totalDaysTrip: totalDays,
          });
        } else {
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isPast: true,
            totalDaysTrip: totalDays,
          });
        }
        return;
      }

      const days = Math.floor(diffStart / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffStart / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffStart / 1000 / 60) % 60);
      const seconds = Math.floor((diffStart / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isPast: false,
        totalDaysTrip: totalDays,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [trip.startDate, trip.endDate]);

  const p1 = trip.partners[0];
  const p2 = trip.partners[1];

  const formatTripDates = (start: string, end: string) => {
    try {
      const s = new Date(start + 'T00:00:00');
      const e = new Date(end + 'T00:00:00');
      const sStr = s.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      const eStr = e.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${sStr} - ${eStr}`;
    } catch {
      return `${start} al ${end}`;
    }
  };

  return (
    <div className="bg-[#3D3D2A] text-white relative overflow-hidden border-b border-[#5A5A40]">
      {/* Background Cover with Rich Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="w-full h-full object-cover object-center opacity-25 scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A2A1D] via-[#3D3D2A]/85 to-[#3D3D2A]/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 pb-2 sm:pb-4">
          {/* Trip Info & Couple Presentation */}
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#E9EDC6]/20 text-[#E9EDC6] border border-[#E9EDC6]/30 backdrop-blur-xs">
                <Heart className="w-3 h-3 fill-[#D4A373] text-[#D4A373]" />
                {p1.name} & {p2.name}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/10 text-stone-200 border border-white/15">
                <Calendar className="w-3 h-3 text-[#D4A373]" />
                {formatTripDates(trip.startDate, trip.endDate)} ({timeLeft.totalDaysTrip}d)
              </span>
              {trip.cities.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#D4A373]/20 text-[#E9EDC6] border border-[#D4A373]/30">
                  <MapPin className="w-3 h-3 text-[#D4A373]" />
                  {trip.cities.map(c => c.name).join(' • ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold tracking-tight text-white">
                {trip.title}
              </h1>
              <button
                onClick={onOpenEditTripModal}
                className="p-1 rounded-xl text-[#D9D1B9] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Editar título, fotos o fechas"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            {trip.subtitle && (
              <p className="text-[#E9E5D9] text-xs sm:text-sm font-serif italic opacity-90">
                "{trip.subtitle}"
              </p>
            )}
          </div>

          {/* Countdown Clock Box */}
          <div className="w-full sm:w-auto bg-[#2A2A1D]/90 backdrop-blur-md rounded-2xl sm:rounded-[28px] border border-[#5A5A40] p-3 sm:p-4 shadow-xl flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 text-[#D4A373] text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#E9EDC6]" />
              <span className="font-serif italic text-xs sm:text-sm text-[#E9EDC6]">Faltan</span>
            </div>

            {!timeLeft.isPast ? (
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Days */}
                <div className="flex flex-col items-center justify-center bg-[#1E1E14]/85 border border-[#5A5A40]/80 rounded-xl sm:rounded-2xl px-2.5 sm:px-3.5 py-1 sm:py-2 min-w-[48px] sm:min-w-[58px]">
                  <span className="text-base sm:text-xl font-serif font-bold text-[#E9EDC6]">
                    {timeLeft.days}
                  </span>
                  <span className="text-[8px] sm:text-[9px] uppercase font-bold text-[#D9D1B9] tracking-widest">
                    Días
                  </span>
                </div>
                <span className="text-[#5A5A40] font-bold">:</span>
                {/* Hours */}
                <div className="flex flex-col items-center justify-center bg-[#1E1E14]/85 border border-[#5A5A40]/80 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1 sm:py-2 min-w-[44px] sm:min-w-[54px]">
                  <span className="text-base sm:text-xl font-serif font-bold text-[#D4A373]">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] uppercase font-bold text-[#D9D1B9] tracking-widest">
                    Horas
                  </span>
                </div>
                <span className="text-[#5A5A40] font-bold">:</span>
                {/* Minutes */}
                <div className="flex flex-col items-center justify-center bg-[#1E1E14]/85 border border-[#5A5A40]/80 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1 sm:py-2 min-w-[44px] sm:min-w-[54px]">
                  <span className="text-base sm:text-xl font-serif font-bold text-stone-200">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] uppercase font-bold text-[#D9D1B9] tracking-widest">
                    Min
                  </span>
                </div>
                <span className="text-[#5A5A40] font-bold hidden sm:inline">:</span>
                {/* Seconds (hidden on extra small screens to save space) */}
                <div className="hidden sm:flex flex-col items-center justify-center bg-[#1E1E14]/85 border border-[#5A5A40]/80 rounded-2xl px-3 py-2 min-w-[54px]">
                  <span className="text-xl font-serif font-bold text-[#E9EDC6]/90">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-[#D9D1B9] tracking-widest">
                    Seg
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-[#E9EDC6]/20 text-[#E9EDC6] font-bold text-xs border border-[#E9EDC6]/30 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
                ¡Viaje realizado!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
