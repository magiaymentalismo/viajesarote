import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import {
  Mail,
  Image as ImageIcon,
  Heart,
  Send,
  Lock,
  Sparkles,
  Calendar,
  Camera,
  Trash2,
  X,
  ExternalLink,
  Plus,
  Smile,
} from 'lucide-react';
import { LoveLetterMessage, GalleryMemory } from '../types';

export const MailboxAndGalleryTab: React.FC = () => {
  const {
    trip,
    activePartnerId,
    sendLoveMessage,
    markMessageAsRead,
    deleteLoveMessage,
    addGalleryMemory,
    toggleHeartMemory,
    deleteGalleryMemory,
  } = useTrip();

  const p1 = trip.partners[0];
  const p2 = trip.partners[1];
  const currentAuthor = activePartnerId === 'p1' ? p1 : p2;
  const targetPartner = activePartnerId === 'p1' ? p2 : p1;

  const [activeSection, setActiveSection] = useState<'mailbox' | 'gallery'>('mailbox');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState<GalleryMemory | null>(null);

  // Message Form State
  const [messageContent, setMessageContent] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('❤️');
  const [isSurprise, setIsSurprise] = useState(false);
  const [revealAt, setRevealAt] = useState(trip.startDate || new Date().toISOString().split('T')[0]);
  const [photoUrlNote, setPhotoUrlNote] = useState('');
  const [sentFeedback, setSentFeedback] = useState(false);

  // Gallery Form State
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [photoForm, setPhotoForm] = useState({
    cityId: trip.cities[0]?.id || '',
    title: '',
    caption: '',
    mediaUrl: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) {
      alert('Por favor escribe el contenido de tu carta o nota');
      return;
    }

    sendLoveMessage({
      fromPartnerId: activePartnerId,
      toPartnerId: targetPartner.id,
      message: messageContent.trim(),
      moodEmoji,
      isSurprise,
      revealAt: isSurprise ? (revealAt || trip.startDate) : undefined,
      photoUrl: photoUrlNote.trim() || undefined,
    });

    setMessageContent('');
    setPhotoUrlNote('');
    setIsSurprise(false);
    setSentFeedback(true);
    setTimeout(() => setSentFeedback(false), 4000);
  };

  const handleNoteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrlNote(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.mediaUrl.trim()) return;

    addGalleryMemory({
      cityId: photoForm.cityId || undefined,
      title: photoForm.title.trim() || 'Recuerdo Inolvidable',
      caption: photoForm.caption.trim() || '',
      mediaUrl: photoForm.mediaUrl.trim(),
      mediaType: 'image',
      date: photoForm.date,
      uploadedById: activePartnerId,
    });

    setPhotoForm({
      cityId: trip.cities[0]?.id || '',
      title: '',
      caption: '',
      mediaUrl: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsAddPhotoOpen(false);
  };

  // Image upload helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoForm(prev => ({ ...prev, mediaUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredMemories = useMemo(() => {
    return trip.gallery.filter(item => {
      if (selectedCityFilter !== 'all' && item.cityId !== selectedCityFilter) return false;
      return true;
    });
  }, [trip.gallery, selectedCityFilter]);

  return (
    <div className="space-y-6">
      {/* Subnav Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#EAE4D7] rounded-[24px] border border-[#D9D1B9] self-start">
          <button
            onClick={() => setActiveSection('mailbox')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSection === 'mailbox'
                ? 'bg-white text-[#434338] shadow-sm'
                : 'text-[#737260] hover:text-[#434338]'
            }`}
          >
            <Mail className="w-4 h-4 text-[#D4A373]" />
            Buzón de Cartas & Notas ({trip.messages.length})
          </button>

          <button
            onClick={() => setActiveSection('gallery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSection === 'gallery'
                ? 'bg-white text-[#434338] shadow-sm'
                : 'text-[#737260] hover:text-[#434338]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#5A5A40]" />
            Galería de Recuerdos ({trip.gallery.length})
          </button>
        </div>

        {activeSection === 'gallery' && (
          <button
            onClick={() => setIsAddPhotoOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold shadow-md shadow-[#5A5A40]/15 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Subir / Guardar Recuerdo
          </button>
        )}
      </div>

      {/* SECTION 1: BUZÓN DE PAREJA */}
      {activeSection === 'mailbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#FAF6E9] p-4 rounded-[28px] border border-[#EBE3CD] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#434338]">
                <Sparkles className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span>
                  <strong>Buzón Romántico:</strong> Dejense cartas, notas de ánimo para el avión o sorpresas que se desbloqueen en fechas especiales durante el viaje.
                </span>
              </div>
            </div>

            {trip.messages.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-[28px] border border-[#E5E0D5] text-[#737260]">
                <Mail className="w-12 h-12 mx-auto mb-3 text-[#8C8B79] stroke-1" />
                <p className="font-bold text-[#434338] text-sm font-serif">El buzón está esperando su primer mensaje</p>
                <p className="text-xs text-[#737260] mt-1">
                  Escribe una nota bonita para tu pareja usando el panel lateral.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {trip.messages.map(msg => {
                  const sender = trip.partners.find(p => p.id === msg.fromPartnerId) || p1;
                  const receiver = trip.partners.find(p => p.id === msg.toPartnerId) || p2;
                  const isFutureDate = msg.revealAt && new Date(msg.revealAt) > new Date();
                  const isLockedForReceiver = msg.isSurprise && isFutureDate && activePartnerId === msg.toPartnerId;
                  const isSurprisePreviewForSender = msg.isSurprise && isFutureDate && activePartnerId === msg.fromPartnerId;

                  return (
                    <div
                      key={msg.id}
                      className="bg-white rounded-[28px] border border-[#E5E0D5] p-5 shadow-xs hover:border-[#D9D1B9] transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#EFEDE7]">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{sender.avatarEmoji}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-[#434338] font-serif">
                                De {sender.name} para {receiver.name}
                              </h4>
                              <span className="text-base">{msg.moodEmoji}</span>
                            </div>
                            <span className="text-[11px] text-[#8C8B79]">
                              {new Date(msg.timestamp).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!msg.isRead && activePartnerId === msg.toPartnerId && !isLockedForReceiver && (
                            <button
                              onClick={() => markMessageAsRead(msg.id)}
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E9EDC6] text-[#5A5A40] border border-[#DCE4B8] cursor-pointer hover:bg-[#dce4b8] transition-colors"
                            >
                              Marcar como leído
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar esta carta del buzón?')) {
                                deleteLoveMessage(msg.id);
                              }
                            }}
                            className="p-1 text-[#8C8B79] hover:text-[#D4A373] transition-colors cursor-pointer"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {isLockedForReceiver ? (
                        <div className="p-5 bg-[#FBF0E4] rounded-2xl border border-[#F3DEC9] text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-[#F3DEC9] flex items-center justify-center mx-auto text-[#D4A373]">
                            <Lock className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-bold text-[#8A5A2B] font-serif">
                            💌 Mensaje Secreto de {sender.name} 🔒
                          </p>
                          <p className="text-xs text-[#8A5A2B]">
                            Se revelará automáticamente el día <strong>{msg.revealAt}</strong>. ¡Guarda la emoción! ✨
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {isSurprisePreviewForSender && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6E9] border border-[#EBE3CD] text-[11px] font-medium text-[#5A5A40]">
                              <Lock className="w-3.5 h-3.5 text-[#D4A373]" />
                              <span>
                                <strong>Carta Sorpresa:</strong> Tu pareja la verá el <strong>{msg.revealAt}</strong> (Esta es tu vista previa).
                              </span>
                            </div>
                          )}

                          <div className="text-xs text-[#434338] leading-relaxed bg-[#FAF6E9] p-3.5 rounded-2xl border border-[#EBE3CD] whitespace-pre-wrap font-medium">
                            {msg.message}
                          </div>

                          {msg.photoUrl && (
                            <div className="h-44 rounded-2xl overflow-hidden border border-[#E5E0D5]">
                              <img
                                src={msg.photoUrl}
                                alt="Foto adjunta"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="bg-white rounded-[28px] border border-[#E5E0D5] p-5 shadow-xs space-y-4 self-start">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EFEDE7]">
              <span className="text-xl">{currentAuthor.avatarEmoji}</span>
              <div>
                <h3 className="text-base font-bold text-[#434338] font-serif">
                  Escribir como {currentAuthor.name}
                </h3>
                <p className="text-[11px] text-[#8C8B79]">
                  Para: <strong>{targetPartner.name}</strong>
                </p>
              </div>
            </div>

            {sentFeedback && (
              <div className="p-3 bg-[#E9EDC6] border border-[#DCE4B8] rounded-2xl text-xs font-bold text-[#5A5A40] flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-[#5A5A40] shrink-0" />
                <span>¡Carta guardada y enviada al buzón con éxito! ✨</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} noValidate className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#737260] uppercase mb-1">
                  Mood / Emoción
                </label>
                <div className="flex items-center gap-2">
                  {['❤️', '✨', '🥰', '🥂', '✈️', '💌'].map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setMoodEmoji(em)}
                      className={`p-2 rounded-2xl text-lg transition-transform active:scale-95 cursor-pointer ${
                        moodEmoji === em ? 'bg-[#E9EDC6] ring-2 ring-[#5A5A40]' : 'bg-[#F5F2ED] hover:bg-[#EAE4D7]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#737260] uppercase mb-1">
                  Tu Mensaje *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={`Escribe algo lindo para ${targetPartner.name}...`}
                  value={messageContent}
                  onChange={e => setMessageContent(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl border border-[#D9D1B9] focus:outline-[#5A5A40] font-medium bg-[#FBF9F5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#737260] uppercase mb-1">
                  Foto o Postal (Opcional)
                </label>
                <div className="space-y-2">
                  <label className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-[#D9D1B9] hover:border-[#5A5A40] rounded-xl bg-[#F9F8F4] text-xs font-bold text-[#5A5A40] cursor-pointer transition-colors">
                    <Camera className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>Subir foto desde galería / cámara</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleNoteImageUpload}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="O pega URL de foto: https://..."
                    value={photoUrlNote}
                    onChange={e => setPhotoUrlNote(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-2xl border border-[#D9D1B9] bg-[#FBF9F5]"
                  />
                </div>

                {photoUrlNote && (
                  <div className="relative mt-2 h-24 rounded-2xl overflow-hidden border border-[#D9D1B9]">
                    <img
                      src={photoUrlNote}
                      alt="Vista previa foto carta"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrlNote('')}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Surprise Lock */}
              <div className="p-3 bg-[#FAF6E9] rounded-2xl border border-[#EBE3CD] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isSurprise}
                    onChange={e => setIsSurprise(e.target.checked)}
                    className="rounded text-[#5A5A40] focus:ring-[#5A5A40]"
                  />
                  <span className="text-xs font-bold text-[#434338] flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#D4A373]" />
                    Ocultar como sorpresa hasta una fecha
                  </span>
                </label>

                {isSurprise && (
                  <div>
                    <label className="block text-[10px] text-[#737260] uppercase font-bold mb-1">
                      Fecha de Desbloqueo
                    </label>
                    <input
                      type="date"
                      value={revealAt}
                      onChange={e => setRevealAt(e.target.value)}
                      className="w-full text-xs p-2 rounded-2xl border border-[#D9D1B9] bg-white"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#5A5A40] hover:bg-[#434338] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#5A5A40]/15 cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar Carta al Buzón
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 2: GALERÍA */}
      {activeSection === 'gallery' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-[28px] border border-[#E5E0D5] shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#737260] uppercase">Filtrar por Ciudad:</span>
              <select
                value={selectedCityFilter}
                onChange={e => setSelectedCityFilter(e.target.value)}
                className="text-xs font-semibold bg-[#F5F2ED] border border-[#D9D1B9] rounded-2xl px-3 py-1.5 text-[#434338] cursor-pointer"
              >
                <option value="all">📸 Todas las Fotos ({trip.gallery.length})</option>
                {trip.cities.map(c => (
                  <option key={c.id} value={c.id}>
                    📍 {c.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-[#8C8B79] font-medium">
              {filteredMemories.length} recuerdos compartidos
            </span>
          </div>

          {/* Grid */}
          {filteredMemories.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[28px] border border-[#E5E0D5] text-[#737260]">
              <Camera className="w-12 h-12 mx-auto mb-3 text-[#8C8B79] stroke-1" />
              <p className="font-bold text-[#434338] text-sm font-serif">No hay recuerdos en esta sección</p>
              <p className="text-xs text-[#737260] mt-1">
                Suban fotos de sus momentos favoritos para guardarlas en el álbum compartido.
              </p>
              <button
                onClick={() => setIsAddPhotoOpen(true)}
                className="mt-4 px-4 py-2 bg-[#5A5A40] text-white text-xs font-bold rounded-2xl cursor-pointer hover:bg-[#434338]"
              >
                Subir Primer Recuerdo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMemories.map(item => {
                const cityName = trip.cities.find(c => c.id === item.cityId)?.name || 'Viaje';
                const photographer = item.uploadedById === 'p1' ? p1 : p2;
                const hasHeart = item.hearts.includes(activePartnerId);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedLightboxPhoto(item)}
                    className="group relative bg-[#434338] rounded-[28px] overflow-hidden aspect-4/5 shadow-xs hover:shadow-xl transition-all cursor-pointer"
                  >
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Top Tag & Heart */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-[#E9EDC6] backdrop-blur-md">
                        📍 {cityName}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleHeartMemory(item.id);
                          }}
                          className={`p-1.5 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
                            hasHeart ? 'bg-[#D4A373] text-white' : 'bg-black/40 text-white hover:bg-black/70'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${hasHeart ? 'fill-white' : ''}`} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteGalleryMemory(item.id);
                          }}
                          className="p-1.5 rounded-full bg-black/40 text-stone-300 hover:text-[#D4A373] hover:bg-black/80 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                      <h4 className="text-sm font-bold line-clamp-1 drop-shadow-xs font-serif">
                        {item.title}
                      </h4>
                      {item.caption && (
                        <p className="text-xs text-[#EAE4D7] line-clamp-1 mt-0.5 font-sans">
                          {item.caption}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-[#D9D1B9] mt-1.5">
                        <span>{item.date}</span>
                        <span>{photographer.avatarEmoji} {photographer.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LIGHTBOX */}
      {selectedLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedLightboxPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-stone-300 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={selectedLightboxPhoto.mediaUrl}
              alt={selectedLightboxPhoto.title}
              className="max-h-[75vh] w-auto rounded-[28px] object-contain shadow-2xl"
            />

            <div className="w-full bg-[#434338]/95 text-white p-4 rounded-2xl mt-3 flex items-center justify-between border border-white/10">
              <div>
                <h4 className="text-base font-bold font-serif">{selectedLightboxPhoto.title}</h4>
                <p className="text-xs text-[#EAE4D7] font-sans">{selectedLightboxPhoto.caption}</p>
                <p className="text-[11px] text-[#D9D1B9] mt-0.5">
                  {selectedLightboxPhoto.date} • Guardada por {selectedLightboxPhoto.uploadedById === 'p1' ? p1.name : p2.name}
                </p>
              </div>

              <a
                href={selectedLightboxPhoto.mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-2xl bg-[#5A5A40] hover:bg-[#343425] text-xs font-bold flex items-center gap-1.5 text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#E9EDC6]" />
                Ver original
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ADD PHOTO MODAL */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-[#FBF9F5] rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
              <h3 className="text-base font-serif font-bold text-[#434338]">
                Guardar Recuerdo en la Galería
              </h3>
              <button
                onClick={() => setIsAddPhotoOpen(false)}
                className="p-1 text-[#8C8B79] hover:text-[#434338] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemorySubmit} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Ciudad o Destino
                </label>
                <select
                  value={photoForm.cityId}
                  onChange={e => setPhotoForm({ ...photoForm, cityId: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                >
                  {trip.cities.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Título del Recuerdo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Paseo en Vespa por el Trastevere"
                  value={photoForm.title}
                  onChange={e => setPhotoForm({ ...photoForm, title: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Subir desde el Dispositivo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs p-2 border border-[#D9D1B9] rounded-2xl bg-white file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#E9EDC6] file:text-[#5A5A40] hover:file:bg-[#DCE4B8] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  O pegar URL de Imagen
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={photoForm.mediaUrl}
                  onChange={e => setPhotoForm({ ...photoForm, mediaUrl: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              {photoForm.mediaUrl && (
                <div className="h-32 rounded-2xl overflow-hidden border border-[#E5E0D5]">
                  <img
                    src={photoForm.mediaUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Pie de Foto / Anécdota
                </label>
                <input
                  type="text"
                  placeholder="Ej: Nos reímos muchísimo cuando nos perdimos..."
                  value={photoForm.caption}
                  onChange={e => setPhotoForm({ ...photoForm, caption: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={photoForm.date}
                  onChange={e => setPhotoForm({ ...photoForm, date: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EFEDE7]">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#737260] hover:bg-[#E9E5D9] rounded-2xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-2xl cursor-pointer"
                >
                  Guardar Recuerdo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
