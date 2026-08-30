export type PartnerId = 'p1' | 'p2';

export interface Partner {
  id: PartnerId;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  avatarPhoto?: string;
  nickname?: string;
}

export type ExpenseCategory =
  | 'vuelos'
  | 'alojamiento'
  | 'comida'
  | 'transporte'
  | 'actividades'
  | 'compras'
  | 'seguros'
  | 'otros';

export type ExpenseStatus = 'pagado' | 'reservado' | 'pendiente';

export type SplitType = 'equal' | 'p1_only' | 'p2_only' | 'custom';

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  paidById: 'p1' | 'p2' | 'both';
  splitType: SplitType;
  splitRatio: {
    p1: number; // percentage or amount
    p2: number;
  };
  status: ExpenseStatus;
  notes?: string;
  receiptImage?: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  tripId: string;
  fromPartnerId: PartnerId;
  toPartnerId: PartnerId;
  amount: number;
  date: string;
  notes?: string;
  isCompleted: boolean;
}

export interface DayPlan {
  id: string;
  date: string;
  dayNumber: number;
  title: string;
  morningActivities: string[];
  afternoonActivities: string[];
  eveningActivities: string[];
  notes?: string;
}

export interface DestinationCity {
  id: string;
  tripId: string;
  name: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  coverImage: string;
  googleMapsUrl?: string;
  order: number;
  emergencyInfo: {
    police: string;
    medical: string;
    embassy: string;
  };
  practicalTips: {
    weather: string;
    plugs: string;
    transport: string;
    localCurrency: string;
    safety: string;
    bestTime?: string;
  };
  dayPlans: DayPlan[];
}

export type TransportType =
  | 'vuelo'
  | 'tren'
  | 'traslado'
  | 'auto_alquiler'
  | 'ferry'
  | 'bus';

export type BookingStatus = 'confirmado' | 'reservado' | 'pendiente';

export interface TransportBooking {
  id: string;
  tripId: string;
  type: TransportType;
  title: string;
  operator: string;
  bookingReference: string;
  departurePlace: string;
  arrivalPlace: string;
  departureDateTime: string;
  arrivalDateTime: string;
  flightNumber?: string;
  terminal?: string;
  gate?: string;
  seatPartner1?: string;
  seatPartner2?: string;
  baggageNotes?: string;
  notes?: string;
  status: BookingStatus;
  directLinkOrTicket?: string;
}

export interface AccommodationBooking {
  id: string;
  tripId: string;
  cityId: string;
  name: string;
  address: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  bookingCode: string;
  contactPhone: string;
  totalCost: number;
  currency: string;
  status: ExpenseStatus;
  googleMapsUrl: string;
  photoUrl?: string;
  notes?: string;
  roomType?: string;
}

export type SiteCategory =
  | 'imperdible'
  | 'restaurante'
  | 'mirador'
  | 'museo'
  | 'romantico'
  | 'cafe_bar'
  | 'aventura'
  | 'compras';

export type SiteStatus = 'por_visitar' | 'visitado' | 'favorito';

export interface SiteToVisit {
  id: string;
  tripId: string;
  cityId: string;
  name: string;
  category: SiteCategory;
  googleMapsUrl: string;
  address?: string;
  photos: string[];
  notes: string;
  openingHours?: string;
  estimatedCost?: string;
  status: SiteStatus;
  recommendedBy: 'p1' | 'p2' | 'both';
  tags: string[];
  rating?: number;
}

export type PackingCategory =
  | 'ropa'
  | 'higiene'
  | 'tecnologia'
  | 'botiquin'
  | 'calzado'
  | 'playa_montana'
  | 'documentacion'
  | 'varios';

export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  category: PackingCategory;
  assignedTo: 'p1' | 'p2' | 'compartido';
  isPacked: boolean;
  quantity: number;
  notes?: string;
}

export type DocumentType =
  | 'pasaporte'
  | 'visa'
  | 'seguro'
  | 'licencia'
  | 'vacunas'
  | 'voucher_hotel'
  | 'tarjeta_embarque'
  | 'otro';

export type DocumentStatus = 'listo' | 'en_tramite' | 'vence_pronto' | 'falta';

export interface DocumentItem {
  id: string;
  tripId: string;
  title: string;
  type: DocumentType;
  owner: 'p1' | 'p2' | 'ambos';
  status: DocumentStatus;
  expirationDate?: string;
  reminderDate?: string;
  notes?: string;
  documentPhotoUrl?: string;
}

export interface PendingTask {
  id: string;
  tripId: string;
  title: string;
  assignedTo: 'p1' | 'p2' | 'ambos';
  dueDate?: string;
  priority: 'alta' | 'media' | 'baja';
  completed: boolean;
  notes?: string;
}

export interface LoveLetterMessage {
  id: string;
  tripId: string;
  fromPartnerId: PartnerId;
  toPartnerId: PartnerId;
  message: string;
  moodEmoji: string;
  timestamp: string;
  isSurprise: boolean;
  revealAt?: string;
  isRead: boolean;
  photoUrl?: string;
}

export interface GalleryMemory {
  id: string;
  tripId: string;
  title: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  date: string;
  cityId?: string;
  uploadedById: PartnerId;
  hearts: PartnerId[];
  caption: string;
}

export interface NotificationReminder {
  id: string;
  tripId: string;
  title: string;
  body: string;
  type: 'document' | 'flight' | 'payment' | 'mailbox' | 'countdown' | 'reservation';
  timestamp: string;
  read: boolean;
  targetTab?: string;
}

export interface Trip {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  currency: string;
  partners: [Partner, Partner];
  currentActivePartnerId: PartnerId;
  inviteCode: string;
  createdAt: string;
  lastSyncedAt?: string;
  expenses: Expense[];
  settlements: Settlement[];
  cities: DestinationCity[];
  transports: TransportBooking[];
  accommodations: AccommodationBooking[];
  sites: SiteToVisit[];
  packingList: PackingItem[];
  documents: DocumentItem[];
  tasks: PendingTask[];
  messages: LoveLetterMessage[];
  gallery: GalleryMemory[];
  notifications: NotificationReminder[];
}
