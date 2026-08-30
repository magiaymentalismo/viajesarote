import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  Trip,
  PartnerId,
  Expense,
  Settlement,
  SiteToVisit,
  PackingItem,
  DocumentItem,
  PendingTask,
  LoveLetterMessage,
  GalleryMemory,
  TransportBooking,
  AccommodationBooking,
  DestinationCity,
  NotificationReminder,
} from '../types';
import { createEmptyTrip, demoTripTemplate } from '../initialData';

interface ActivePartnerPresence {
  partnerId: string;
  name: string;
}

interface TripContextType {
  trip: Trip;
  tripsList: Trip[];
  activePartnerId: PartnerId;
  setActivePartnerId: (id: PartnerId) => void;
  isOnline: boolean;
  isSyncing: boolean;
  activeOnlinePartners: ActivePartnerPresence[];
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<void>;
  
  // Trip management
  selectTrip: (tripId: string) => void;
  createNewTrip: (tripData: Partial<Trip>) => Trip;
  loadDemoTrip: () => void;
  updateTripInfo: (updates: Partial<Trip>) => void;
  joinTripByCode: (code: string) => Promise<boolean>;
  exportTripJson: () => void;
  importTripJson: (jsonString: string) => boolean;

  // Expenses & Tricount
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'tripId'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addSettlement: (settlement: Omit<Settlement, 'id' | 'tripId'>) => void;

  // Itinerary & Cities
  addTransport: (transport: Omit<TransportBooking, 'id' | 'tripId'>) => void;
  updateTransport: (id: string, updates: Partial<TransportBooking>) => void;
  deleteTransport: (id: string) => void;
  addAccommodation: (acc: Omit<AccommodationBooking, 'id' | 'tripId'>) => void;
  updateAccommodation: (id: string, updates: Partial<AccommodationBooking>) => void;
  deleteAccommodation: (id: string) => void;
  addCity: (city: Omit<DestinationCity, 'id' | 'tripId' | 'order'>) => void;
  updateCity: (id: string, updates: Partial<DestinationCity>) => void;
  deleteCity: (id: string) => void;
  updateDayPlan: (cityId: string, planId: string, updates: Partial<DestinationCity['dayPlans'][0]>) => void;

  // Sites & Places
  addSite: (site: Omit<SiteToVisit, 'id' | 'tripId'>) => void;
  updateSite: (id: string, updates: Partial<SiteToVisit>) => void;
  deleteSite: (id: string) => void;

  // Packing, Documents & Tasks
  togglePackingItem: (id: string) => void;
  addPackingItem: (item: Omit<PackingItem, 'id' | 'tripId'>) => void;
  deletePackingItem: (id: string) => void;
  addDocument: (doc: Omit<DocumentItem, 'id' | 'tripId'>) => void;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;
  toggleTask: (id: string) => void;
  addTask: (task: Omit<PendingTask, 'id' | 'tripId'>) => void;
  deleteTask: (id: string) => void;

  // Mailbox & Notes
  sendLoveMessage: (message: Omit<LoveLetterMessage, 'id' | 'tripId' | 'timestamp' | 'isRead'>) => void;
  markMessageAsRead: (id: string) => void;
  deleteLoveMessage: (id: string) => void;

  // Gallery
  addGalleryMemory: (memory: Omit<GalleryMemory, 'id' | 'tripId' | 'hearts'>) => void;
  toggleHeartMemory: (memoryId: string) => void;
  deleteGalleryMemory: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  triggerAppNotification: (title: string, body: string, type: NotificationReminder['type'], targetTab?: string) => void;
}

const LOCAL_STORAGE_KEY = 'parejas_en_ruta_trip_v2';
const LOCAL_STORAGE_TRIPS_LIST = 'parejas_en_ruta_trips_list_v2';
const LOCAL_STORAGE_PARTNER = 'parejas_en_ruta_partner_id';

const TripContext = createContext<TripContextType | null>(null);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved local cache or fallback to a clean empty trip
  const [trip, setTrip] = useState<Trip>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return createEmptyTrip();
  });

  const [tripsList, setTripsList] = useState<Trip[]>(() => {
    try {
      const savedList = localStorage.getItem(LOCAL_STORAGE_TRIPS_LIST);
      if (savedList) {
        return JSON.parse(savedList);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [activePartnerId, setActivePartnerIdState] = useState<PartnerId>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PARTNER) as PartnerId;
      if (saved === 'p1' || saved === 'p2') return saved;
    } catch {
      // ignore
    }
    return 'p1';
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeOnlinePartners, setActiveOnlinePartners] = useState<ActivePartnerPresence[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentTripRef = useRef<Trip>(trip);
  currentTripRef.current = trip;

  // Setup BroadcastChannel for zero-latency multi-tab sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('parejas_en_ruta_sync_v2');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        try {
          const data = event.data;
          if (data && data.type === 'sync:trip' && data.trip) {
            if (data.trip.id === currentTripRef.current.id) {
              setTrip(data.trip);
            }
          } else if (data && data.type === 'presence:ping') {
            // Respond with our presence
            channel.postMessage({
              type: 'presence:pong',
              partnerId: activePartnerId,
              name: currentTripRef.current.partners.find(p => p.id === activePartnerId)?.name || 'Viajero'
            });
          }
        } catch {
          // ignore
        }
      };

      // Announce presence
      channel.postMessage({
        type: 'presence:ping',
        partnerId: activePartnerId,
        name: trip.partners.find(p => p.id === activePartnerId)?.name || 'Viajero'
      });

      return () => {
        channel.close();
      };
    }
  }, [activePartnerId, trip.id]);

  // Persist active partner selection
  const setActivePartnerId = (id: PartnerId) => {
    setActivePartnerIdState(id);
    localStorage.setItem(LOCAL_STORAGE_PARTNER, id);
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'presence:pong',
        partnerId: id,
        name: trip.partners.find(p => p.id === id)?.name || 'Viajero'
      });
    }
  };

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trip));
      setTripsList(prev => {
        const index = prev.findIndex(t => t.id === trip.id);
        const updated = index >= 0 ? [...prev] : [trip, ...prev];
        if (index >= 0) updated[index] = trip;
        localStorage.setItem(LOCAL_STORAGE_TRIPS_LIST, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // LocalStorage error handling
    }
  }, [trip]);

  // Broadcast change through Local BroadcastChannel + HTTP REST
  const broadcastTripChange = useCallback((updatedTrip: Trip) => {
    const tripWithTimestamp = {
      ...updatedTrip,
      lastSyncedAt: new Date().toISOString()
    };
    setTrip(tripWithTimestamp);

    // 1. Sync across browser tabs instantly via BroadcastChannel
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'sync:trip',
        trip: tripWithTimestamp,
        partnerId: activePartnerId,
      });
    }

    // 2. Sync to Server via REST API
    fetch(`/api/trips/${tripWithTimestamp.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-partner-id': activePartnerId
      },
      body: JSON.stringify(tripWithTimestamp),
    }).catch(() => {
      // Offline fallback: persists safely in LocalStorage
    });
  }, [activePartnerId]);

  // Sync / Poll trip with server (Zero WebSocket requirement - 100% Vercel & Serverless compatible)
  const syncTripWithServer = useCallback(async (tripToSync: Trip, silent = false) => {
    if (!navigator.onLine) return;
    if (!silent) setIsSyncing(true);

    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(tripToSync.id)}`);
      if (res.ok) {
        const remoteTrip: Trip = await res.json();
        if (remoteTrip && remoteTrip.id === tripToSync.id) {
          const remoteTime = new Date(remoteTrip.lastSyncedAt || 0).getTime();
          const localTime = new Date(currentTripRef.current.lastSyncedAt || 0).getTime();
          
          // Only update if remote is newer
          if (remoteTime > localTime) {
            setTrip(remoteTrip);
          }
        }
      }
    } catch {
      // offline or static host fallback
    } finally {
      if (!silent) setIsSyncing(false);
    }
  }, []);

  // Adaptive background polling & Online/Focus listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncTripWithServer(currentTripRef.current);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    const handleFocus = () => {
      if (navigator.onLine) {
        syncTripWithServer(currentTripRef.current, true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleFocus);

    // Poll every 3.5 seconds when active
    pollIntervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncTripWithServer(currentTripRef.current, true);
      }
    }, 3500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [syncTripWithServer]);

  // Check URL parameters on mount for deep link join (e.g. ?join=VIAJE-1234 or ?trip=VIAJE-1234)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join') || urlParams.get('trip') || urlParams.get('tripCode') || urlParams.get('code');
    
    if (joinCode && joinCode.trim().length > 0) {
      const code = joinCode.trim();
      fetch(`/api/trips/${encodeURIComponent(code)}`)
        .then(res => res.ok ? res.json() : null)
        .then(remoteTrip => {
          if (remoteTrip && remoteTrip.id) {
            setTrip(remoteTrip);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteTrip));
            localStorage.setItem('parejas_en_ruta_trip_ready', 'true');
            // Clean URL without reloading
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Export trip as JSON file
  const exportTripJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trip, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `viaje-${(trip.title || 'pareja').toLowerCase().replace(/\s+/g, '-')}-${trip.inviteCode || 'backup'}.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {
      // ignore
    }
  };

  // Import trip from JSON string
  const importTripJson = (jsonString: string): boolean => {
    try {
      const parsed: Trip = JSON.parse(jsonString);
      if (!parsed || !parsed.id || !parsed.title) {
        return false;
      }
      parsed.lastSyncedAt = new Date().toISOString();
      setTrip(parsed);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
      localStorage.setItem('parejas_en_ruta_trip_ready', 'true');
      broadcastTripChange(parsed);
      return true;
    } catch {
      return false;
    }
  };

  // Request browser Web Push notifications
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          triggerAppNotification(
            '¡Notificaciones Activadas!',
            'Recibirás recordatorios importantes sobre tus documentos, vuelos y notas de amor.',
            'mailbox'
          );
        }
      } catch {
        // notification request error
      }
    }
  };

  // Trigger Notification (In-App + Native Push if allowed)
  const triggerAppNotification = (
    title: string,
    body: string,
    type: NotificationReminder['type'],
    targetTab?: string
  ) => {
    const newNotif: NotificationReminder = {
      id: 'notif-' + Date.now().toString(36),
      tripId: currentTripRef.current.id,
      title,
      body,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      targetTab,
    };

    const updated = {
      ...currentTripRef.current,
      notifications: [newNotif, ...(currentTripRef.current.notifications || [])],
    };
    broadcastTripChange(updated);

    // Trigger native browser notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch {
        // native notification error
      }
    }
  };

  // =================== Actions ===================

  const selectTrip = (tripId: string) => {
    const found = tripsList.find(t => t.id === tripId);
    if (found) {
      setTrip(found);
    } else {
      fetch(`/api/trips/${tripId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setTrip(data);
          }
        })
        .catch(() => {});
    }
  };

  const createNewTrip = (tripData: Partial<Trip>): Trip => {
    const newId = 'trip-' + Date.now().toString(36);
    const inviteCode = 'VIAJE-' + Math.floor(1000 + Math.random() * 9000);
    const newTrip: Trip = {
      id: newId,
      title: tripData.title || 'Nuestra Próxima Aventura',
      subtitle: tripData.subtitle || 'Viaje en Pareja',
      coverImage:
        tripData.coverImage ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      startDate: tripData.startDate || new Date().toISOString().split('T')[0],
      endDate:
        tripData.endDate ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: tripData.currency || 'EUR',
      partners: tripData.partners || [
        { id: 'p1', name: 'Viajero 1', avatarEmoji: '🧔', avatarColor: '#5A5A40' },
        { id: 'p2', name: 'Viajero 2', avatarEmoji: '🌸', avatarColor: '#D4A373' },
      ],
      currentActivePartnerId: 'p1',
      inviteCode,
      createdAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      expenses: [],
      settlements: [],
      cities: [],
      transports: [],
      accommodations: [],
      sites: [],
      packingList: [],
      documents: [],
      tasks: [],
      messages: [],
      gallery: [],
      notifications: [
        {
          id: 'notif-welcome',
          tripId: newId,
          title: '¡Viaje Creado con Éxito!',
          body: 'Comiencen a planificar su itinerario, gastos y lista de equipaje juntos.',
          type: 'countdown',
          timestamp: new Date().toISOString(),
          read: false,
        },
      ],
    };

    setTripsList(prev => [newTrip, ...prev.filter(t => t.id !== newId)]);
    setTrip(newTrip);
    broadcastTripChange(newTrip);
    return newTrip;
  };

  const loadDemoTrip = () => {
    setTrip(demoTripTemplate);
    setTripsList(prev => [
      demoTripTemplate,
      ...prev.filter(t => t.id !== demoTripTemplate.id),
    ]);
    broadcastTripChange(demoTripTemplate);
  };

  const updateTripInfo = (updates: Partial<Trip>) => {
    const updated = { ...trip, ...updates };
    broadcastTripChange(updated);
  };

  const joinTripByCode = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(code.trim())}`);
      if (res.ok) {
        const foundTrip = await res.json();
        setTrip(foundTrip);
        return true;
      }
    } catch {
      // offline lookup in local list
      const local = tripsList.find(
        t => t.inviteCode.toUpperCase() === code.trim().toUpperCase()
      );
      if (local) {
        setTrip(local);
        return true;
      }
    }
    return false;
  };

  // Expenses Actions
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'tripId'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now().toString(36),
      tripId: trip.id,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...trip,
      expenses: [newExpense, ...trip.expenses],
    };
    broadcastTripChange(updated);

    const payerName = expenseData.paidById === 'p1' ? trip.partners[0].name : expenseData.paidById === 'p2' ? trip.partners[1].name : 'Ambos';
    triggerAppNotification(
      'Nuevo Gasto Registrado',
      `${payerName} agregó "${expenseData.description}" por ${expenseData.amount} ${expenseData.currency}`,
      'payment',
      'gastos'
    );
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const updated = {
      ...trip,
      expenses: trip.expenses.map(e => (e.id === id ? { ...e, ...updates } : e)),
    };
    broadcastTripChange(updated);
  };

  const deleteExpense = (id: string) => {
    const updated = {
      ...trip,
      expenses: trip.expenses.filter(e => e.id !== id),
    };
    broadcastTripChange(updated);
  };

  const addSettlement = (settlementData: Omit<Settlement, 'id' | 'tripId'>) => {
    const newSettlement: Settlement = {
      ...settlementData,
      id: 'set-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = {
      ...trip,
      settlements: [newSettlement, ...(trip.settlements || [])],
    };
    broadcastTripChange(updated);

    const fromName = trip.partners.find(p => p.id === settlementData.fromPartnerId)?.name;
    const toName = trip.partners.find(p => p.id === settlementData.toPartnerId)?.name;
    triggerAppNotification(
      '¡Deuda Saldada! 🎉',
      `${fromName} pagó ${settlementData.amount} ${trip.currency} a ${toName}`,
      'payment',
      'gastos'
    );
  };

  // Itinerary & Transport
  const addTransport = (transData: Omit<TransportBooking, 'id' | 'tripId'>) => {
    const newTrans: TransportBooking = {
      ...transData,
      id: 'trans-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = {
      ...trip,
      transports: [...trip.transports, newTrans],
    };
    broadcastTripChange(updated);
  };

  const updateTransport = (id: string, updates: Partial<TransportBooking>) => {
    const updated = {
      ...trip,
      transports: trip.transports.map(t => (t.id === id ? { ...t, ...updates } : t)),
    };
    broadcastTripChange(updated);
  };

  const deleteTransport = (id: string) => {
    const updated = {
      ...trip,
      transports: trip.transports.filter(t => t.id !== id),
    };
    broadcastTripChange(updated);
  };

  const addAccommodation = (accData: Omit<AccommodationBooking, 'id' | 'tripId'>) => {
    const newAcc: AccommodationBooking = {
      ...accData,
      id: 'acc-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = {
      ...trip,
      accommodations: [...trip.accommodations, newAcc],
    };
    broadcastTripChange(updated);
  };

  const updateAccommodation = (id: string, updates: Partial<AccommodationBooking>) => {
    const updated = {
      ...trip,
      accommodations: trip.accommodations.map(a => (a.id === id ? { ...a, ...updates } : a)),
    };
    broadcastTripChange(updated);
  };

  const deleteAccommodation = (id: string) => {
    const updated = {
      ...trip,
      accommodations: trip.accommodations.filter(a => a.id !== id),
    };
    broadcastTripChange(updated);
  };

  const addCity = (cityData: Omit<DestinationCity, 'id' | 'tripId' | 'order'>) => {
    const newCity: DestinationCity = {
      ...cityData,
      id: 'city-' + Date.now().toString(36),
      tripId: trip.id,
      order: trip.cities.length + 1,
    };
    const updated = {
      ...trip,
      cities: [...trip.cities, newCity],
    };
    broadcastTripChange(updated);
  };

  const updateCity = (id: string, updates: Partial<DestinationCity>) => {
    const updated = {
      ...trip,
      cities: trip.cities.map(c => (c.id === id ? { ...c, ...updates } : c)),
    };
    broadcastTripChange(updated);
  };

  const deleteCity = (id: string) => {
    const updated = {
      ...trip,
      cities: trip.cities.filter(c => c.id !== id),
      accommodations: trip.accommodations.filter(a => a.cityId !== id),
      sites: trip.sites.filter(s => s.cityId !== id),
    };
    broadcastTripChange(updated);
  };

  const updateDayPlan = (cityId: string, planId: string, updates: Partial<DestinationCity['dayPlans'][0]>) => {
    const updated = {
      ...trip,
      cities: trip.cities.map(city => {
        if (city.id !== cityId) return city;
        return {
          ...city,
          dayPlans: city.dayPlans.map(p => (p.id === planId ? { ...p, ...updates } : p)),
        };
      }),
    };
    broadcastTripChange(updated);
  };

  // Sites
  const addSite = (siteData: Omit<SiteToVisit, 'id' | 'tripId'>) => {
    const newSite: SiteToVisit = {
      ...siteData,
      id: 'site-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = {
      ...trip,
      sites: [newSite, ...trip.sites],
    };
    broadcastTripChange(updated);
  };

  const updateSite = (id: string, updates: Partial<SiteToVisit>) => {
    const updated = {
      ...trip,
      sites: trip.sites.map(s => (s.id === id ? { ...s, ...updates } : s)),
    };
    broadcastTripChange(updated);
  };

  const deleteSite = (id: string) => {
    const updated = {
      ...trip,
      sites: trip.sites.filter(s => s.id !== id),
    };
    broadcastTripChange(updated);
  };

  // Packing & Tasks & Docs
  const togglePackingItem = (id: string) => {
    const updated = {
      ...trip,
      packingList: trip.packingList.map(item =>
        item.id === id ? { ...item, isPacked: !item.isPacked } : item
      ),
    };
    broadcastTripChange(updated);
  };

  const addPackingItem = (itemData: Omit<PackingItem, 'id' | 'tripId'>) => {
    const newItem: PackingItem = {
      ...itemData,
      id: 'pack-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = {
      ...trip,
      packingList: [...trip.packingList, newItem],
    };
    broadcastTripChange(updated);
  };

  const deletePackingItem = (id: string) => {
    const updated = {
      ...trip,
      packingList: trip.packingList.filter(item => item.id !== id),
    };
    broadcastTripChange(updated);
  };

  const addDocument = (docData: Omit<DocumentItem, 'id' | 'tripId'>) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: 'doc-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = {
      ...trip,
      documents: [...trip.documents, newDoc],
    };
    broadcastTripChange(updated);
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    const updated = {
      ...trip,
      documents: trip.documents.map(d => (d.id === id ? { ...d, ...updates } : d)),
    };
    broadcastTripChange(updated);
  };

  const deleteDocument = (id: string) => {
    const updated = {
      ...trip,
      documents: trip.documents.filter(d => d.id !== id),
    };
    broadcastTripChange(updated);
  };

  const toggleTask = (id: string) => {
    const updated = {
      ...trip,
      tasks: trip.tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    };
    broadcastTripChange(updated);
  };

  const addTask = (taskData: Omit<PendingTask, 'id' | 'tripId'>) => {
    const newTask: PendingTask = {
      ...taskData,
      id: 'task-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = {
      ...trip,
      tasks: [...trip.tasks, newTask],
    };
    broadcastTripChange(updated);
  };

  const deleteTask = (id: string) => {
    const updated = {
      ...trip,
      tasks: trip.tasks.filter(t => t.id !== id),
    };
    broadcastTripChange(updated);
  };

  // Mailbox
  const sendLoveMessage = (
    msgData: Omit<LoveLetterMessage, 'id' | 'tripId' | 'timestamp' | 'isRead'>
  ) => {
    const newMsg: LoveLetterMessage = {
      ...msgData,
      id: 'msg-' + Date.now().toString(36),
      tripId: trip.id,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    const updated = {
      ...trip,
      messages: [newMsg, ...trip.messages],
    };
    broadcastTripChange(updated);

    const senderName = trip.partners.find(p => p.id === msgData.fromPartnerId)?.name || 'Tu pareja';
    triggerAppNotification(
      '💌 Mensaje nuevo en el Buzón',
      `${senderName} te ha dejado una nota: "${msgData.message.slice(0, 50)}${msgData.message.length > 50 ? '...' : ''}"`,
      'mailbox',
      'buzon'
    );
  };

  const markMessageAsRead = (id: string) => {
    const updated = {
      ...trip,
      messages: trip.messages.map(m => (m.id === id ? { ...m, isRead: true } : m)),
    };
    broadcastTripChange(updated);
  };

  const deleteLoveMessage = (id: string) => {
    const updated = {
      ...trip,
      messages: trip.messages.filter(m => m.id !== id),
    };
    broadcastTripChange(updated);
  };

  // Gallery
  const addGalleryMemory = (
    memData: Omit<GalleryMemory, 'id' | 'tripId' | 'hearts'>
  ) => {
    const newMemory: GalleryMemory = {
      ...memData,
      id: 'gal-' + Date.now().toString(36),
      tripId: trip.id,
      hearts: [activePartnerId],
    };
    const updated = {
      ...trip,
      gallery: [newMemory, ...trip.gallery],
    };
    broadcastTripChange(updated);
  };

  const toggleHeartMemory = (memoryId: string) => {
    const updated = {
      ...trip,
      gallery: trip.gallery.map(mem => {
        if (mem.id !== memoryId) return mem;
        const hasHeart = mem.hearts.includes(activePartnerId);
        const newHearts = hasHeart
          ? mem.hearts.filter(h => h !== activePartnerId)
          : [...mem.hearts, activePartnerId];
        return { ...mem, hearts: newHearts };
      }),
    };
    broadcastTripChange(updated);
  };

  const deleteGalleryMemory = (id: string) => {
    const updated = {
      ...trip,
      gallery: trip.gallery.filter(m => m.id !== id),
    };
    broadcastTripChange(updated);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    const updated = {
      ...trip,
      notifications: trip.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
    };
    broadcastTripChange(updated);
  };

  const clearAllNotifications = () => {
    const updated = {
      ...trip,
      notifications: [],
    };
    broadcastTripChange(updated);
  };

  return (
    <TripContext.Provider
      value={{
        trip,
        tripsList,
        activePartnerId,
        setActivePartnerId,
        isOnline,
        isSyncing,
        activeOnlinePartners,
        notificationPermission,
        requestNotificationPermission,
        selectTrip,
        createNewTrip,
        loadDemoTrip,
        updateTripInfo,
        joinTripByCode,
        exportTripJson,
        importTripJson,
        addExpense,
        updateExpense,
        deleteExpense,
        addSettlement,
        addTransport,
        updateTransport,
        deleteTransport,
        addAccommodation,
        updateAccommodation,
        deleteAccommodation,
        addCity,
        updateCity,
        deleteCity,
        updateDayPlan,
        addSite,
        updateSite,
        deleteSite,
        togglePackingItem,
        addPackingItem,
        deletePackingItem,
        addDocument,
        updateDocument,
        deleteDocument,
        toggleTask,
        addTask,
        deleteTask,
        sendLoveMessage,
        markMessageAsRead,
        deleteLoveMessage,
        addGalleryMemory,
        toggleHeartMemory,
        deleteGalleryMemory,
        markNotificationRead,
        clearAllNotifications,
        triggerAppNotification,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
