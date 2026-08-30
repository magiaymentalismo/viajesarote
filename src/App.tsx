import React, { useState, useEffect } from 'react';
import { TripProvider, useTrip } from './context/TripContext';
import { Navbar } from './components/Navbar';
import { CountdownHeader, ActiveTab } from './components/CountdownHeader';
import { ExpensesTab } from './components/ExpensesTab';
import { ItineraryTab } from './components/ItineraryTab';
import { SitesTab } from './components/SitesTab';
import { PackingAndDocsTab } from './components/PackingAndDocsTab';
import { MailboxAndGalleryTab } from './components/MailboxAndGalleryTab';
import { NewTripModal } from './components/NewTripModal';
import { ShareRoomModal } from './components/ShareRoomModal';
import { NotificationsModal } from './components/NotificationsModal';
import { EditTripModal } from './components/EditTripModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { WhoAmIModal } from './components/WhoAmIModal';
import { BottomNav } from './components/BottomNav';

const MainTripApp: React.FC = () => {
  const { trip, isSyncing, isOnline } = useTrip();

  const [activeTab, setActiveTab] = useState<ActiveTab>('gastos');

  // Check if we have an initialized trip or need onboarding
  const hasTrip = trip && trip.id && trip.title.trim().length > 0;
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    // If there is no real trip title or if it's default empty placeholder
    const isNew = !localStorage.getItem('parejas_en_ruta_trip_ready');
    return isNew || !hasTrip;
  });

  // Modals state
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [isWhoAmIOpen, setIsWhoAmIOpen] = useState(false);

  useEffect(() => {
    if (hasTrip && showWelcome && localStorage.getItem('parejas_en_ruta_trip_ready')) {
      setShowWelcome(false);
    }
  }, [hasTrip]);

  if (showWelcome || !hasTrip) {
    return (
      <WelcomeScreen
        onTripReady={() => {
          localStorage.setItem('parejas_en_ruta_trip_ready', 'true');
          setShowWelcome(false);
          // Also ask who they are on first entry if not selected
          if (!localStorage.getItem('parejas_en_ruta_partner_id')) {
            setIsWhoAmIOpen(true);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#434338] flex flex-col font-sans selection:bg-[#D4A373] selection:text-white pb-24 sm:pb-20">
      {/* Sticky Main Navigation */}
      <Navbar
        onOpenNewTripModal={() => setIsNewTripOpen(true)}
        onOpenShareModal={() => setIsShareOpen(true)}
        onOpenNotificationsModal={() => setIsNotificationsOpen(true)}
        onOpenEditTripModal={() => setIsEditTripOpen(true)}
      />

      {/* Countdown & Hero Header */}
      <CountdownHeader
        onOpenEditTripModal={() => setIsEditTripOpen(true)}
      />

      {/* Main Workspace Tabs Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-in fade-in duration-200">
        {activeTab === 'gastos' && <ExpensesTab />}
        {activeTab === 'itinerario' && <ItineraryTab />}
        {activeTab === 'sitios' && <SitesTab />}
        {activeTab === 'equipaje-docs' && <PackingAndDocsTab />}
        {activeTab === 'buzon' && <MailboxAndGalleryTab />}
        {activeTab === 'galeria' && <MailboxAndGalleryTab />}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPartnerModal={() => setIsWhoAmIOpen(true)}
      />

      {/* Modals */}
      {isNewTripOpen && <NewTripModal onClose={() => setIsNewTripOpen(false)} />}
      {isShareOpen && <ShareRoomModal onClose={() => setIsShareOpen(false)} />}
      {isWhoAmIOpen && <WhoAmIModal onClose={() => setIsWhoAmIOpen(false)} />}
      {isNotificationsOpen && (
        <NotificationsModal
          onClose={() => setIsNotificationsOpen(false)}
          onNavigateTab={tab => setActiveTab(tab)}
        />
      )}
      {isEditTripOpen && <EditTripModal onClose={() => setIsEditTripOpen(false)} />}

      {/* Footer note */}
      <footer className="border-t border-[#D9D1B9] bg-[#E9E5D9]/70 py-6 text-center text-xs text-[#5A5A40] mb-8 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold text-[#434338]">
            <span className="w-2 h-2 rounded-full bg-[#D4A373]" />
            <span className="font-serif italic text-sm">{trip.title}</span>
            <span className="text-[#8C8B79]">• Viaje de {trip.partners[0].name} & {trip.partners[1].name}</span>
          </div>
          <div className="flex items-center gap-3 text-[#5A5A40] text-xs">
            <button
              onClick={() => setIsWhoAmIOpen(true)}
              className="hover:underline cursor-pointer font-bold text-[#434338]"
            >
              Cambiar de acompañante
            </button>
            <span>•</span>
            <button
              onClick={() => setShowWelcome(true)}
              className="hover:underline cursor-pointer"
            >
              Crear / Unirse a otro viaje
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TripProvider>
      <MainTripApp />
    </TripProvider>
  );
}
