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
const CLOUD_SYNC_BUCKET = 'parejas_en_ruta_v2';

export const sanitizeTripForSharing = (t: Trip): Partial<Trip> => {
  return {
    id: t.id,
    title: t.title,
    subtitle: t.subtitle,
    coverImage: t.coverImage,
    startDate: t.startDate,
    endDate: t.endDate,
    currency: t.currency,
    partners: t.partners,
    inviteCode: t.inviteCode,
    createdAt: t.createdAt,
    lastSyncedAt: t.lastSyncedAt,
    cities: t.cities,
    expenses: (t.expenses || []).map(e => ({
      ...e,
      // Strip out huge local base64 images so URL stays under WhatsApp limit
      receiptImage: e.receiptImage && e.receiptImage.startsWith('data:') ? undefined : e.receiptImage,
    })),
    transports: t.transports,
    accommodations: t.accommodations,
    sites: t.sites,
    packingList: t.packingList,
    documents: t.documents,
    tasks: t.tasks,
    messages: t.messages,
    gallery: (t.gallery || []).filter(g => g.mediaUrl && !g.mediaUrl.startsWith('data:')),
  };
};

export const encodeTripData = (obj: unknown): string => {
  try {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    // Return standard base64 string
    return btoa(binary);
  } catch {
    return '';
  }
};

export const decodeTripData = (raw: string): Trip | null => {
  try {
    if (!raw) return null;
    let b64 = '';

    // If string has a data= parameter or hash (e.g. #data=... or ?data=...)
    // Ensure we capture only valid base64 chars and stop at whitespace, newlines, quotes, or other query params
    const dataMatch = raw.match(/[#?&]data=([A-Za-z0-9_=-]+)/);
    if (dataMatch && dataMatch[1]) {
      b64 = dataMatch[1];
    } else {
      // Check if the input itself is a raw base64 string
      const trimmed = raw.trim().replace(/^"/, '').replace(/"$/, '');
      const pureMatch = trimmed.match(/^[A-Za-z0-9_=-]{20,}$/);
      if (pureMatch) {
        b64 = pureMatch[0];
      }
    }

    if (!b64) return null;

    // Decode URL-encoded characters (like %3D, %2B, %2F)
    try {
      b64 = decodeURIComponent(b64);
    } catch {
      // ignore
    }

    // Convert URL-safe base64 (- and _) to standard (+ and /)
    b64 = b64.replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');

    // Pad with = if length is not a multiple of 4
    while (b64.length % 4 !== 0) {
      b64 += '=';
    }

    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && (parsed.id || parsed.title)) {
      return ensureTripIntegrity(parsed);
    }
    return null;
  } catch {
    return null;
  }
};

export interface ParsedJoinResult {
  code?: string;
  directTrip?: Trip;
  remoteOrigin?: string;
}

export const parseJoinInput = (input: string): ParsedJoinResult => {
  if (!input) return {};
  const trimmed = input.trim();

  // 1. Try decoding embedded trip data first (#data= or raw base64 anywhere in text)
  const decodedTrip = decodeTripData(trimmed);
  if (decodedTrip && (decodedTrip.id || decodedTrip.title)) {
    return {
      directTrip: decodedTrip,
      code: decodedTrip.inviteCode || decodedTrip.id,
    };
  }

  // 2. Extract remoteOrigin if any URL exists anywhere in the input text
  let remoteOrigin: string | undefined;
  const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>\n\r]+/i);
  if (urlMatch) {
    try {
      const parsedUrl = new URL(urlMatch[0]);
      remoteOrigin = parsedUrl.origin;
    } catch {
      // ignore
    }
  }

  // 3. Check for join / code query parameters in the text or URL
  const urlParamMatch = trimmed.match(/[?&](?:join|code|trip|tripCode)=([A-Za-z0-9_-]+)/i);
  if (urlParamMatch && urlParamMatch[1]) {
    return { code: urlParamMatch[1].trim(), remoteOrigin };
  }

  // 4. Check for WhatsApp / message patterns like "código: XXXX", "codigo: XXXX", "código es: XXXX"
  const textCodeMatch = trimmed.match(/(?:c[oó]digo|code)(?:\s+es)?[:\s]+([A-Za-z0-9_-]+)/i);
  if (textCodeMatch && textCodeMatch[1]) {
    return { code: textCodeMatch[1].trim(), remoteOrigin };
  }

  // 5. Fallback: clean string
  const cleanCode = trimmed.replace(/^[#?]/, '').trim();
  return { code: cleanCode, remoteOrigin };
};

const CLOUD_CHUNK_SIZE = 120;

export const saveTripToCloud = async (tripToSave: Trip): Promise<boolean> => {
  try {
    const cleanCode = (tripToSave.inviteCode || tripToSave.id).toUpperCase().replace(/\s+/g, '');
    const sanitized = sanitizeTripForSharing(tripToSave);
    const b64 = encodeTripData(sanitized);
    if (!b64) return false;

    const numChunks = Math.ceil(b64.length / CLOUD_CHUNK_SIZE);
    const keysToSave = [cleanCode];
    if (tripToSave.id && tripToSave.id.toUpperCase() !== cleanCode) {
      keysToSave.push(tripToSave.id.toUpperCase());
    }
    const digitsOnly = cleanCode.replace(/\D/g, '');
    if (digitsOnly.length >= 3 && digitsOnly !== cleanCode) {
      keysToSave.push(digitsOnly);
    }

    for (const key of keysToSave) {
      // Save chunk count
      fetch(
        `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${CLOUD_SYNC_BUCKET}/${encodeURIComponent(key)}_count/${numChunks}`,
        { method: 'POST', headers: { 'Content-Length': '0' } }
      ).catch(() => {});

      // Save each chunk (safe within URL character limit)
      for (let i = 0; i < numChunks; i++) {
        const chunk = b64.slice(i * CLOUD_CHUNK_SIZE, (i + 1) * CLOUD_CHUNK_SIZE);
        fetch(
          `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${CLOUD_SYNC_BUCKET}/${encodeURIComponent(key)}_${i}/${encodeURIComponent(chunk)}`,
          { method: 'POST', headers: { 'Content-Length': '0' } }
        ).catch(() => {});
      }
    }
    return true;
  } catch {
    return false;
  }
};

export const fetchTripFromCloud = async (code: string): Promise<Trip | null> => {
  try {
    if (!code) return null;
    const cleanKey = code.toUpperCase().replace(/\s+/g, '').replace(/^[#?]/, '');

    // Fetch chunk count
    const countRes = await fetch(
      `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${CLOUD_SYNC_BUCKET}/${encodeURIComponent(cleanKey)}_count`
    );
    if (!countRes.ok) return null;
    const countText = (await countRes.text()).replace(/^"/, '').replace(/"$/, '').trim();
    const count = parseInt(countText, 10);
    if (!count || isNaN(count) || count <= 0 || count > 50) return null;

    // Fetch chunks in parallel
    const chunkPromises = [];
    for (let i = 0; i < count; i++) {
      chunkPromises.push(
        fetch(
          `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${CLOUD_SYNC_BUCKET}/${encodeURIComponent(cleanKey)}_${i}`
        )
          .then(res => res.text())
          .then(txt => decodeURIComponent(txt.replace(/^"/, '').replace(/"$/, '')))
          .catch(() => '')
      );
    }

    const chunks = await Promise.all(chunkPromises);
    const fullB64 = chunks.join('');
    if (!fullB64) return null;

    const decoded = decodeTripData(fullB64);
    if (decoded && (decoded.id || decoded.title)) {
      return ensureTripIntegrity(decoded);
    }
    return null;
  } catch {
    return null;
  }
};

export const ensureTripIntegrity = (t: Partial<Trip> | null | undefined): Trip => {
  if (!t) return createEmptyTrip();

  return {
    id: t.id || 'trip-' + Date.now().toString(36),
    title: t.title || 'Nuestro Viaje en Pareja',
    subtitle: t.subtitle || '',
    coverImage:
      t.coverImage ||
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    startDate: t.startDate || new Date().toISOString().split('T')[0],
    endDate:
      t.endDate ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: t.currency || 'EUR',
    partners:
      t.partners && Array.isArray(t.partners) && t.partners.length === 2
        ? t.partners
        : [
            { id: 'p1', name: 'Viajero 1', avatarEmoji: '🧔', avatarColor: '#5A5A40' },
            { id: 'p2', name: 'Viajero 2', avatarEmoji: '🌸', avatarColor: '#D4A373' },
          ],
    currentActivePartnerId: t.currentActivePartnerId || 'p1',
    inviteCode: t.inviteCode || 'VIAJE-' + Math.floor(1000 + Math.random() * 9000),
    createdAt: t.createdAt || new Date().toISOString(),
    lastSyncedAt: t.lastSyncedAt || new Date().toISOString(),
    expenses: Array.isArray(t.expenses) ? t.expenses : [],
    settlements: Array.isArray(t.settlements) ? t.settlements : [],
    cities: Array.isArray(t.cities) ? t.cities : [],
    transports: Array.isArray(t.transports) ? t.transports : [],
    accommodations: Array.isArray(t.accommodations) ? t.accommodations : [],
    sites: Array.isArray(t.sites) ? t.sites : [],
    packingList: Array.isArray(t.packingList) ? t.packingList : [],
    documents: Array.isArray(t.documents) ? t.documents : [],
    tasks: Array.isArray(t.tasks) ? t.tasks : [],
    messages: Array.isArray(t.messages) ? t.messages : [],
    gallery: Array.isArray(t.gallery) ? t.gallery : [],
    notifications: Array.isArray(t.notifications) ? t.notifications : [],
  };
};

const TripContext = createContext<TripContextType | null>(null);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved local cache or fallback to a clean empty trip
  const [trip, setTrip] = useState<Trip>(() => {
    try {
      // Priority 1: Check URL hash for embedded trip data (#data=...)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash;
        if (hash.includes('data=') || hash.startsWith('#data=')) {
          const directDecoded = decodeTripData(hash);
          if (directDecoded && directDecoded.id) {
            const sanitized = ensureTripIntegrity(directDecoded);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
            localStorage.setItem('parejas_en_ruta_trip_ready', 'true');
            return sanitized;
          }
        }
      }

      // Priority 2: Check LocalStorage cache
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return ensureTripIntegrity(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    return ensureTripIntegrity(createEmptyTrip());
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

  // Broadcast change through Local BroadcastChannel + Cloud KV + Server
  const broadcastTripChange = useCallback((updatedTrip: Trip) => {
    const tripWithTimestamp = ensureTripIntegrity({
      ...updatedTrip,
      lastSyncedAt: new Date().toISOString(),
    });
    setTrip(tripWithTimestamp);

    // 1. Sync across browser tabs instantly via BroadcastChannel
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'sync:trip',
        trip: tripWithTimestamp,
        partnerId: activePartnerId,
      });
    }

    // 2. Global Cloud Sync: works on Vercel and separate mobile phones without login
    saveTripToCloud(tripWithTimestamp);

    // 3. Sync to local Server via REST API if container is active
    fetch(`/api/trips/${tripWithTimestamp.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-partner-id': activePartnerId
      },
      body: JSON.stringify(tripWithTimestamp),
    }).catch(() => {
      // Offline fallback: persists safely in LocalStorage & Cloud KV
    });
  }, [activePartnerId]);

  // Sync / Poll trip with Cloud KV and optional server
  const syncTripWithServer = useCallback(async (tripToSync: Trip, silent = false) => {
    if (!navigator.onLine) return;
    if (!silent) setIsSyncing(true);

    try {
      // Step A: Check Cloud KV (Cross-device and Vercel compatible)
      const cleanCode = (tripToSync.inviteCode || tripToSync.id).toUpperCase().replace(/\s+/g, '');
      const remoteCloud = await fetchTripFromCloud(cleanCode);
      if (remoteCloud && remoteCloud.id === tripToSync.id) {
        const remoteTime = new Date(remoteCloud.lastSyncedAt || 0).getTime();
        const localTime = new Date(currentTripRef.current.lastSyncedAt || 0).getTime();

        const expensesChanged = remoteCloud.expenses.length !== currentTripRef.current.expenses.length;
        const citiesChanged = remoteCloud.cities.length !== currentTripRef.current.cities.length;
        const messagesChanged = remoteCloud.messages.length !== currentTripRef.current.messages.length;

        if (remoteTime > localTime || expensesChanged || citiesChanged || messagesChanged) {
          setTrip(remoteCloud);
          return;
        }
      }

      // Step B: Check server container if running
      const res = await fetch(`/api/trips/${encodeURIComponent(tripToSync.id)}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const remoteTripRaw = await res.json();
        if (remoteTripRaw && remoteTripRaw.id === tripToSync.id) {
          const remoteTrip = ensureTripIntegrity(remoteTripRaw);
          const remoteTime = new Date(remoteTrip.lastSyncedAt || 0).getTime();
          const localTime = new Date(currentTripRef.current.lastSyncedAt || 0).getTime();
          
          if (remoteTime > localTime || remoteTrip.expenses.length !== currentTripRef.current.expenses.length) {
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

    // Poll every 4 seconds when active for smooth live co-editing
    pollIntervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncTripWithServer(currentTripRef.current, true);
      }
    }, 4000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [syncTripWithServer]);

  // Check URL parameters and hash on mount for 1-click WhatsApp deep link join
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const href = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode =
      urlParams.get('join') ||
      urlParams.get('trip') ||
      urlParams.get('tripCode') ||
      urlParams.get('code');
    const hash = window.location.hash;
    const hasData = hash && hash.includes('data=');

    if (hasData || (joinCode && joinCode.trim().length > 0)) {
      joinTripByCode(href).then(success => {
        if (success) {
          // Clean URL without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
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
      const sanitized = ensureTripIntegrity(parsed);
      setTrip(sanitized);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
      localStorage.setItem('parejas_en_ruta_trip_ready', 'true');
      broadcastTripChange(sanitized);
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

    const updated = ensureTripIntegrity({
      ...currentTripRef.current,
      notifications: [newNotif, ...(currentTripRef.current.notifications || [])],
    });
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
      const sanitized = ensureTripIntegrity(found);
      setTrip(sanitized);
      broadcastTripChange(sanitized);
    } else {
      fetch(`/api/trips/${encodeURIComponent(tripId)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            const sanitized = ensureTripIntegrity(data);
            setTrip(sanitized);
            broadcastTripChange(sanitized);
          }
        })
        .catch(() => {});
    }
  };

  const createNewTrip = (tripData: Partial<Trip>): Trip => {
    const newId = 'trip-' + Date.now().toString(36);
    const inviteCode = 'VIAJE-' + Math.floor(1000 + Math.random() * 9000);
    const newTrip = ensureTripIntegrity({
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
    });

    setTripsList(prev => [newTrip, ...prev.filter(t => t.id !== newId)]);
    setTrip(newTrip);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTrip));
    localStorage.setItem('parejas_en_ruta_trip_ready', 'true');
    broadcastTripChange(newTrip);
    return newTrip;
  };

  const loadDemoTrip = () => {
    const demo = ensureTripIntegrity(demoTripTemplate);
    setTrip(demo);
    setTripsList(prev => [
      demo,
      ...prev.filter(t => t.id !== demo.id),
    ]);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demo));
    localStorage.setItem('parejas_en_ruta_trip_ready', 'true');
    broadcastTripChange(demo);
  };

  const updateTripInfo = (updates: Partial<Trip>) => {
    const updated = ensureTripIntegrity({ ...trip, ...updates });
    broadcastTripChange(updated);
  };

  const joinTripByCode = async (rawCode: string): Promise<boolean> => {
    const input = rawCode ? rawCode.trim() : '';
    if (!input) return false;

    // Parse input (handles full URLs, embedded #data=, WhatsApp text, raw codes)
    const parsed = parseJoinInput(input);

    // Step A: Direct embedded trip data (instant, 100% reliable)
    if (parsed.directTrip && (parsed.directTrip.id || parsed.directTrip.title)) {
      const sanitized = ensureTripIntegrity(parsed.directTrip);
      setTrip(sanitized);
      setTripsList(prev => [sanitized, ...prev.filter(t => t.id !== sanitized.id)]);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
      localStorage.setItem('parejas_en_ruta_trip_ready', 'true');
      broadcastTripChange(sanitized);

      // Also persist to server in background
      fetch(`/api/trips/${sanitized.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized),
      }).catch(() => {});

      return true;
    }

    const cleanCode = (parsed.code || input).replace(/^[#?]/, '').trim();
    const cleanUpper = cleanCode.toUpperCase().replace(/\s+/g, '');
    const digitsOnly = cleanCode.replace(/\D/g, '');

    // Step B: Query Global Cloud KV (works across different phones/browsers without shared server)
    try {
      const cloudCodesToTry = [cleanUpper];
      if (digitsOnly && digitsOnly.length >= 3 && digitsOnly !== cleanUpper) {
        cloudCodesToTry.push(digitsOnly);
      }
      for (const cCode of cloudCodesToTry) {
        const cloudTrip = await fetchTripFromCloud(cCode);
        if (cloudTrip && (cloudTrip.id || cloudTrip.title)) {
          const sanitized = ensureTripIntegrity(cloudTrip);
          setTrip(sanitized);
          setTripsList(prev => [sanitized, ...prev.filter(t => t.id !== sanitized.id)]);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
          localStorage.setItem('parejas_en_ruta_trip_ready', 'true');
          broadcastTripChange(sanitized);
          return true;
        }
      }
    } catch {
      // cloud fetch error
    }

    // Step C: Query Server endpoints (current container, remote container from URL, and sibling dev/pre container)
    const originsToTry = new Set<string>();
    if (typeof window !== 'undefined' && window.location.origin) {
      originsToTry.add(window.location.origin);
      if (window.location.origin.includes('-dev-')) {
        originsToTry.add(window.location.origin.replace('-dev-', '-pre-'));
      }
      if (window.location.origin.includes('-pre-')) {
        originsToTry.add(window.location.origin.replace('-pre-', '-dev-'));
      }
    }
    if (parsed.remoteOrigin) {
      originsToTry.add(parsed.remoteOrigin);
    }

    const queriesToTry = [cleanCode];
    if (cleanUpper !== cleanCode) queriesToTry.push(cleanUpper);
    if (digitsOnly && digitsOnly.length >= 3 && digitsOnly !== cleanCode) queriesToTry.push(digitsOnly);

    for (const origin of originsToTry) {
      for (const q of queriesToTry) {
        try {
          const res = await fetch(`${origin}/api/trips/${encodeURIComponent(q)}`);
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const foundTrip = await res.json();
            if (foundTrip && (foundTrip.id || foundTrip.title)) {
              const sanitized = ensureTripIntegrity(foundTrip);
              setTrip(sanitized);
              setTripsList(prev => [sanitized, ...prev.filter(t => t.id !== sanitized.id)]);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
              localStorage.setItem('parejas_en_ruta_trip_ready', 'true');
              broadcastTripChange(sanitized);

              // Re-save to local server as well if from remote container
              if (origin !== window.location.origin) {
                fetch(`/api/trips/${sanitized.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(sanitized),
                }).catch(() => {});
              }

              return true;
            }
          }
        } catch {
          // fetch error
        }
      }
    }

    // Step D: Fallback to local trips list or demo trip
    const candidates = [...tripsList, trip, demoTripTemplate];
    const local = candidates.find(t => {
      if (!t) return false;
      const tId = (t.id || '').toUpperCase();
      const tCode = (t.inviteCode || '').toUpperCase().replace(/\s+/g, '');
      const tDigits = (t.inviteCode || '').replace(/\D/g, '');

      return (
        tId === cleanUpper ||
        tCode === cleanUpper ||
        tCode.replace(/-/g, '') === cleanUpper.replace(/-/g, '') ||
        (digitsOnly.length >= 3 && tDigits === digitsOnly) ||
        (t.title && t.title.toLowerCase().trim() === cleanCode.toLowerCase())
      );
    });

    if (local) {
      const sanitized = ensureTripIntegrity(local);
      setTrip(sanitized);
      setTripsList(prev => [sanitized, ...prev.filter(t => t.id !== sanitized.id)]);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
      localStorage.setItem('parejas_en_ruta_trip_ready', 'true');
      broadcastTripChange(sanitized);
      return true;
    }

    return false;
  };

  // Expenses Actions
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'tripId'>) => {
    const existing = Array.isArray(trip.expenses) ? trip.expenses : [];
    const newExpense: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now().toString(36),
      tripId: trip.id,
      createdAt: new Date().toISOString(),
    };
    const updated = ensureTripIntegrity({
      ...trip,
      expenses: [newExpense, ...existing],
    });
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
    const existing = Array.isArray(trip.expenses) ? trip.expenses : [];
    const updated = ensureTripIntegrity({
      ...trip,
      expenses: existing.map(e => (e.id === id ? { ...e, ...updates } : e)),
    });
    broadcastTripChange(updated);
  };

  const deleteExpense = (id: string) => {
    const existing = Array.isArray(trip.expenses) ? trip.expenses : [];
    const updated = ensureTripIntegrity({
      ...trip,
      expenses: existing.filter(e => e.id !== id),
    });
    broadcastTripChange(updated);
  };

  const addSettlement = (settlementData: Omit<Settlement, 'id' | 'tripId'>) => {
    const existing = Array.isArray(trip.settlements) ? trip.settlements : [];
    const newSettlement: Settlement = {
      ...settlementData,
      id: 'set-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = ensureTripIntegrity({
      ...trip,
      settlements: [newSettlement, ...existing],
    });
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
    const existing = Array.isArray(trip.transports) ? trip.transports : [];
    const newTrans: TransportBooking = {
      ...transData,
      id: 'trans-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = ensureTripIntegrity({
      ...trip,
      transports: [...existing, newTrans],
    });
    broadcastTripChange(updated);
  };

  const updateTransport = (id: string, updates: Partial<TransportBooking>) => {
    const existing = Array.isArray(trip.transports) ? trip.transports : [];
    const updated = ensureTripIntegrity({
      ...trip,
      transports: existing.map(t => (t.id === id ? { ...t, ...updates } : t)),
    });
    broadcastTripChange(updated);
  };

  const deleteTransport = (id: string) => {
    const existing = Array.isArray(trip.transports) ? trip.transports : [];
    const updated = ensureTripIntegrity({
      ...trip,
      transports: existing.filter(t => t.id !== id),
    });
    broadcastTripChange(updated);
  };

  const addAccommodation = (accData: Omit<AccommodationBooking, 'id' | 'tripId'>) => {
    const existing = Array.isArray(trip.accommodations) ? trip.accommodations : [];
    const newAcc: AccommodationBooking = {
      ...accData,
      id: 'acc-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = ensureTripIntegrity({
      ...trip,
      accommodations: [...existing, newAcc],
    });
    broadcastTripChange(updated);
  };

  const updateAccommodation = (id: string, updates: Partial<AccommodationBooking>) => {
    const existing = Array.isArray(trip.accommodations) ? trip.accommodations : [];
    const updated = ensureTripIntegrity({
      ...trip,
      accommodations: existing.map(a => (a.id === id ? { ...a, ...updates } : a)),
    });
    broadcastTripChange(updated);
  };

  const deleteAccommodation = (id: string) => {
    const existing = Array.isArray(trip.accommodations) ? trip.accommodations : [];
    const updated = ensureTripIntegrity({
      ...trip,
      accommodations: existing.filter(a => a.id !== id),
    });
    broadcastTripChange(updated);
  };

  const addCity = (cityData: Omit<DestinationCity, 'id' | 'tripId' | 'order'>) => {
    const existing = Array.isArray(trip.cities) ? trip.cities : [];
    const newCity: DestinationCity = {
      ...cityData,
      id: 'city-' + Date.now().toString(36),
      tripId: trip.id,
      order: existing.length + 1,
      dayPlans: cityData.dayPlans || [],
    };
    const updated = ensureTripIntegrity({
      ...trip,
      cities: [...existing, newCity],
    });
    broadcastTripChange(updated);
  };

  const updateCity = (id: string, updates: Partial<DestinationCity>) => {
    const existing = Array.isArray(trip.cities) ? trip.cities : [];
    const updated = ensureTripIntegrity({
      ...trip,
      cities: existing.map(c => (c.id === id ? { ...c, ...updates } : c)),
    });
    broadcastTripChange(updated);
  };

  const deleteCity = (id: string) => {
    const existing = Array.isArray(trip.cities) ? trip.cities : [];
    const existingAcc = Array.isArray(trip.accommodations) ? trip.accommodations : [];
    const existingSites = Array.isArray(trip.sites) ? trip.sites : [];
    const updated = ensureTripIntegrity({
      ...trip,
      cities: existing.filter(c => c.id !== id),
      accommodations: existingAcc.filter(a => a.cityId !== id),
      sites: existingSites.filter(s => s.cityId !== id),
    });
    broadcastTripChange(updated);
  };

  const updateDayPlan = (cityId: string, planId: string, updates: Partial<DestinationCity['dayPlans'][0]>) => {
    const existing = Array.isArray(trip.cities) ? trip.cities : [];
    const updated = ensureTripIntegrity({
      ...trip,
      cities: existing.map(city => {
        if (city.id !== cityId) return city;
        const plans = Array.isArray(city.dayPlans) ? city.dayPlans : [];
        return {
          ...city,
          dayPlans: plans.map(p => (p.id === planId ? { ...p, ...updates } : p)),
        };
      }),
    });
    broadcastTripChange(updated);
  };

  // Sites
  const addSite = (siteData: Omit<SiteToVisit, 'id' | 'tripId'>) => {
    const existing = Array.isArray(trip.sites) ? trip.sites : [];
    const newSite: SiteToVisit = {
      ...siteData,
      id: 'site-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = ensureTripIntegrity({
      ...trip,
      sites: [newSite, ...existing],
    });
    broadcastTripChange(updated);
  };

  const updateSite = (id: string, updates: Partial<SiteToVisit>) => {
    const existing = Array.isArray(trip.sites) ? trip.sites : [];
    const updated = ensureTripIntegrity({
      ...trip,
      sites: existing.map(s => (s.id === id ? { ...s, ...updates } : s)),
    });
    broadcastTripChange(updated);
  };

  const deleteSite = (id: string) => {
    const existing = Array.isArray(trip.sites) ? trip.sites : [];
    const updated = ensureTripIntegrity({
      ...trip,
      sites: existing.filter(s => s.id !== id),
    });
    broadcastTripChange(updated);
  };

  // Packing & Tasks & Docs
  const togglePackingItem = (id: string) => {
    const existing = Array.isArray(trip.packingList) ? trip.packingList : [];
    const updated = ensureTripIntegrity({
      ...trip,
      packingList: existing.map(item =>
        item.id === id ? { ...item, isPacked: !item.isPacked } : item
      ),
    });
    broadcastTripChange(updated);
  };

  const addPackingItem = (itemData: Omit<PackingItem, 'id' | 'tripId'>) => {
    const existing = Array.isArray(trip.packingList) ? trip.packingList : [];
    const newItem: PackingItem = {
      ...itemData,
      id: 'pack-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = ensureTripIntegrity({
      ...trip,
      packingList: [...existing, newItem],
    });
    broadcastTripChange(updated);
  };

  const deletePackingItem = (id: string) => {
    const existing = Array.isArray(trip.packingList) ? trip.packingList : [];
    const updated = ensureTripIntegrity({
      ...trip,
      packingList: existing.filter(item => item.id !== id),
    });
    broadcastTripChange(updated);
  };

  const addDocument = (docData: Omit<DocumentItem, 'id' | 'tripId'>) => {
    const existing = Array.isArray(trip.documents) ? trip.documents : [];
    const newDoc: DocumentItem = {
      ...docData,
      id: 'doc-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = ensureTripIntegrity({
      ...trip,
      documents: [...existing, newDoc],
    });
    broadcastTripChange(updated);
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    const existing = Array.isArray(trip.documents) ? trip.documents : [];
    const updated = ensureTripIntegrity({
      ...trip,
      documents: existing.map(d => (d.id === id ? { ...d, ...updates } : d)),
    });
    broadcastTripChange(updated);
  };

  const deleteDocument = (id: string) => {
    const existing = Array.isArray(trip.documents) ? trip.documents : [];
    const updated = ensureTripIntegrity({
      ...trip,
      documents: existing.filter(d => d.id !== id),
    });
    broadcastTripChange(updated);
  };

  const toggleTask = (id: string) => {
    const existing = Array.isArray(trip.tasks) ? trip.tasks : [];
    const updated = ensureTripIntegrity({
      ...trip,
      tasks: existing.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    });
    broadcastTripChange(updated);
  };

  const addTask = (taskData: Omit<PendingTask, 'id' | 'tripId'>) => {
    const existing = Array.isArray(trip.tasks) ? trip.tasks : [];
    const newTask: PendingTask = {
      ...taskData,
      id: 'task-' + Date.now().toString(36),
      tripId: trip.id,
    };
    const updated = ensureTripIntegrity({
      ...trip,
      tasks: [...existing, newTask],
    });
    broadcastTripChange(updated);
  };

  const deleteTask = (id: string) => {
    const existing = Array.isArray(trip.tasks) ? trip.tasks : [];
    const updated = ensureTripIntegrity({
      ...trip,
      tasks: existing.filter(t => t.id !== id),
    });
    broadcastTripChange(updated);
  };

  // Mailbox
  const sendLoveMessage = (
    msgData: Omit<LoveLetterMessage, 'id' | 'tripId' | 'timestamp' | 'isRead'>
  ) => {
    const existing = Array.isArray(trip.messages) ? trip.messages : [];
    const newMsg: LoveLetterMessage = {
      ...msgData,
      id: 'msg-' + Date.now().toString(36),
      tripId: trip.id,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    const updated = ensureTripIntegrity({
      ...trip,
      messages: [newMsg, ...existing],
    });
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
    const existing = Array.isArray(trip.messages) ? trip.messages : [];
    const updated = ensureTripIntegrity({
      ...trip,
      messages: existing.map(m => (m.id === id ? { ...m, isRead: true } : m)),
    });
    broadcastTripChange(updated);
  };

  const deleteLoveMessage = (id: string) => {
    const existing = Array.isArray(trip.messages) ? trip.messages : [];
    const updated = ensureTripIntegrity({
      ...trip,
      messages: existing.filter(m => m.id !== id),
    });
    broadcastTripChange(updated);
  };

  // Gallery
  const addGalleryMemory = (
    memData: Omit<GalleryMemory, 'id' | 'tripId' | 'hearts'>
  ) => {
    const existing = Array.isArray(trip.gallery) ? trip.gallery : [];
    const newMemory: GalleryMemory = {
      ...memData,
      id: 'gal-' + Date.now().toString(36),
      tripId: trip.id,
      hearts: [activePartnerId],
    };
    const updated = ensureTripIntegrity({
      ...trip,
      gallery: [newMemory, ...existing],
    });
    broadcastTripChange(updated);
  };

  const toggleHeartMemory = (memoryId: string) => {
    const existing = Array.isArray(trip.gallery) ? trip.gallery : [];
    const updated = ensureTripIntegrity({
      ...trip,
      gallery: existing.map(mem => {
        if (mem.id !== memoryId) return mem;
        const hearts = Array.isArray(mem.hearts) ? mem.hearts : [];
        const hasHeart = hearts.includes(activePartnerId);
        const newHearts = hasHeart
          ? hearts.filter(h => h !== activePartnerId)
          : [...hearts, activePartnerId];
        return { ...mem, hearts: newHearts };
      }),
    });
    broadcastTripChange(updated);
  };

  const deleteGalleryMemory = (id: string) => {
    const existing = Array.isArray(trip.gallery) ? trip.gallery : [];
    const updated = ensureTripIntegrity({
      ...trip,
      gallery: existing.filter(m => m.id !== id),
    });
    broadcastTripChange(updated);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    const existing = Array.isArray(trip.notifications) ? trip.notifications : [];
    const updated = ensureTripIntegrity({
      ...trip,
      notifications: existing.map(n => (n.id === id ? { ...n, read: true } : n)),
    });
    broadcastTripChange(updated);
  };

  const clearAllNotifications = () => {
    const updated = ensureTripIntegrity({
      ...trip,
      notifications: [],
    });
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
