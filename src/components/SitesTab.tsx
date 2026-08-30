import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import {
  MapPin,
  ExternalLink,
  Plus,
  Heart,
  CheckCircle2,
  Clock,
  Star,
  Search,
  Camera,
  Trash2,
  Edit2,
  X,
  Sparkles,
  DollarSign,
  Compass,
} from 'lucide-react';
import { SiteToVisit, SiteCategory, SiteStatus } from '../types';

const SITE_CATEGORIES: Record<SiteCategory, { label: string; emoji: string; color: string }> = {
  imperdible: { label: 'Imperdible', emoji: '🌟', color: 'bg-[#FAF6E9] text-[#5A5A40] border-[#EBE3CD]' },
  romantico: { label: 'Romántico', emoji: '💖', color: 'bg-[#F9ECE7] text-[#8C5D3B] border-[#F2D7CB]' },
  restaurante: { label: 'Restaurante', emoji: '🍝', color: 'bg-[#FBF0E4] text-[#8A5A2B] border-[#F3DEC9]' },
  mirador: { label: 'Mirador', emoji: '🌅', color: 'bg-[#E9EDC6]/90 text-[#434338] border-[#DCE4B8]' },
  museo: { label: 'Museo & Arte', emoji: '🏛️', color: 'bg-[#F2ECE0] text-[#5A5A40] border-[#E0D5C1]' },
  cafe_bar: { label: 'Café / Heladería', emoji: '☕', color: 'bg-[#FAF3E0] text-[#7A5A30] border-[#EEDFBC]' },
  aventura: { label: 'Aventura / Naturaleza', emoji: '⛵', color: 'bg-[#E8F0E4] text-[#3D5A38] border-[#CDE0C6]' },
  compras: { label: 'Compras / Souvenirs', emoji: '🛍️', color: 'bg-[#F6EFE9] text-[#6A5348] border-[#E4D8CE]' },
};

export const SitesTab: React.FC = () => {
  const { trip, activePartnerId, addSite, updateSite, deleteSite } = useTrip();

  const p1 = trip.partners[0];
  const p2 = trip.partners[1];

  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteToVisit | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    cityId: trip.cities[0]?.id || '',
    name: '',
    category: 'imperdible' as SiteCategory,
    googleMapsUrl: '',
    address: '',
    photoUrl: '',
    notes: '',
    openingHours: '',
    estimatedCost: '',
    status: 'por_visitar' as SiteStatus,
    recommendedBy: 'both' as 'p1' | 'p2' | 'both',
    tags: '',
  });

  const handleOpenAddModal = () => {
    setEditingSite(null);
    setFormData({
      cityId: trip.cities[0]?.id || '',
      name: '',
      category: 'imperdible',
      googleMapsUrl: '',
      address: '',
      photoUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80',
      notes: '',
      openingHours: '',
      estimatedCost: '',
      status: 'por_visitar',
      recommendedBy: activePartnerId,
      tags: 'Imperdible, Fotos',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (site: SiteToVisit) => {
    setEditingSite(site);
    setFormData({
      cityId: site.cityId,
      name: site.name,
      category: site.category,
      googleMapsUrl: site.googleMapsUrl,
      address: site.address || '',
      photoUrl: site.photos[0] || '',
      notes: site.notes,
      openingHours: site.openingHours || '',
      estimatedCost: site.estimatedCost || '',
      status: site.status,
      recommendedBy: site.recommendedBy,
      tags: site.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Generate Google Maps search URL if not filled
    const cityName = trip.cities.find(c => c.id === formData.cityId)?.name || '';
    const mapsUrl =
      formData.googleMapsUrl.trim() ||
      `https://www.google.com/maps/search/${encodeURIComponent(formData.name + ' ' + (formData.address || cityName))}`;

    const tagArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const photosArray = formData.photoUrl.trim()
      ? [formData.photoUrl.trim()]
      : ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'];

    if (editingSite) {
      updateSite(editingSite.id, {
        cityId: formData.cityId,
        name: formData.name.trim(),
        category: formData.category,
        googleMapsUrl: mapsUrl,
        address: formData.address.trim() || undefined,
        photos: photosArray,
        notes: formData.notes.trim(),
        openingHours: formData.openingHours.trim() || undefined,
        estimatedCost: formData.estimatedCost.trim() || undefined,
        status: formData.status,
        recommendedBy: formData.recommendedBy,
        tags: tagArray,
      });
    } else {
      addSite({
        cityId: formData.cityId,
        name: formData.name.trim(),
        category: formData.category,
        googleMapsUrl: mapsUrl,
        address: formData.address.trim() || undefined,
        photos: photosArray,
        notes: formData.notes.trim(),
        openingHours: formData.openingHours.trim() || undefined,
        estimatedCost: formData.estimatedCost.trim() || undefined,
        status: formData.status,
        recommendedBy: formData.recommendedBy,
        tags: tagArray,
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleFavorite = (site: SiteToVisit) => {
    const newStatus: SiteStatus = site.status === 'favorito' ? 'por_visitar' : 'favorito';
    updateSite(site.id, { status: newStatus });
  };

  const handleToggleVisited = (site: SiteToVisit) => {
    const newStatus: SiteStatus = site.status === 'visitado' ? 'por_visitar' : 'visitado';
    updateSite(site.id, { status: newStatus });
  };

  // Filtered Sites
  const filteredSites = useMemo(() => {
    return trip.sites.filter(site => {
      if (selectedCityFilter !== 'all' && site.cityId !== selectedCityFilter) return false;
      if (selectedCategoryFilter !== 'all' && site.category !== selectedCategoryFilter) return false;
      if (selectedStatusFilter !== 'all' && site.status !== selectedStatusFilter) return false;
      if (
        searchQuery &&
        !site.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !site.notes.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [trip.sites, selectedCityFilter, selectedCategoryFilter, selectedStatusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#E9EDC6] text-[#5A5A40] rounded-xl">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-serif font-bold text-[#434338]">
              Sitios, Rincones & Recomendaciones
            </h3>
          </div>
          <p className="text-xs text-[#737260] mt-0.5 font-sans">
            Guarden los lugares que quieren visitar con fotos, datos prácticos y acceso directo a Google Maps.
          </p>
        </div>

        <button
          id="btn-add-site"
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold shadow-md shadow-[#5A5A40]/15 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Añadir Sitio / Rincón
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-[28px] border border-[#E5E0D5] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C8B79] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, nota o plato recomendado..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-2xl border border-[#D9D1B9] focus:outline-[#5A5A40] font-medium bg-[#FBF9F5]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#8C8B79] hover:text-[#434338] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter by City */}
          <select
            value={selectedCityFilter}
            onChange={e => setSelectedCityFilter(e.target.value)}
            className="text-xs font-semibold bg-[#F5F2ED] border border-[#D9D1B9] rounded-2xl px-3 py-2 text-[#434338] cursor-pointer"
          >
            <option value="all">📍 Todas las Ciudades</option>
            {trip.cities.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Filter by Category */}
          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="text-xs font-semibold bg-[#F5F2ED] border border-[#D9D1B9] rounded-2xl px-3 py-2 text-[#434338] cursor-pointer"
          >
            <option value="all">🏷️ Todas las Categorías</option>
            {Object.entries(SITE_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.emoji} {v.label}
              </option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-[#F5F2ED] border border-[#D9D1B9] rounded-2xl px-3 py-2 text-[#434338] cursor-pointer"
          >
            <option value="all">✨ Todos los Estados</option>
            <option value="por_visitar">Por Visitar</option>
            <option value="favorito">❤️ Favoritos</option>
            <option value="visitado">✅ Visitados</option>
          </select>
        </div>
      </div>

      {/* Sites Grid */}
      {filteredSites.length === 0 ? (
        <div className="bg-white rounded-[28px] p-12 text-center border border-[#E5E0D5] text-[#737260]">
          <Compass className="w-12 h-12 mx-auto mb-3 text-[#8C8B79] stroke-1" />
          <div className="font-serif font-bold text-[#434338] text-base">No se encontraron sitios</div>
          <p className="text-xs text-[#737260] mt-1 max-w-sm mx-auto">
            Añadan restaurantes recomendados, miradores panorámicos o museos para tenerlos a mano en el mapa.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-[#5A5A40] text-white rounded-2xl text-xs font-bold shadow-xs cursor-pointer hover:bg-[#434338]"
          >
            Añadir Primer Sitio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map(site => {
            const cityName = trip.cities.find(c => c.id === site.cityId)?.name || 'Destino';
            const catInfo = SITE_CATEGORIES[site.category] || SITE_CATEGORIES.imperdible;
            const recommender =
              site.recommendedBy === 'p1'
                ? p1
                : site.recommendedBy === 'p2'
                ? p2
                : { name: 'Ambos', avatarEmoji: '❤️' };

            return (
              <div
                key={site.id}
                className="group bg-white rounded-[28px] border border-[#E5E0D5] shadow-xs hover:shadow-xl hover:border-[#D9D1B9] transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Photo & Top Badges */}
                <div className="relative h-48 w-full bg-[#434338] overflow-hidden">
                  <img
                    src={site.photos[0] || 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80'}
                    alt={site.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Top Category Badge & Actions */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border shadow-md ${catInfo.color}`}
                    >
                      <span>{catInfo.emoji}</span>
                      <span>{catInfo.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleFavorite(site)}
                        className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer shadow-md ${
                          site.status === 'favorito'
                            ? 'bg-[#D4A373] text-white'
                            : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                        title="Marcar como favorito"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            site.status === 'favorito' ? 'fill-white' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleToggleVisited(site)}
                        className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer shadow-md ${
                          site.status === 'visitado'
                            ? 'bg-[#5A5A40] text-white'
                            : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                        title="Marcar como visitado"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom City & Name */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[11px] font-bold text-[#E9EDC6] uppercase tracking-wider block">
                      📍 {cityName}
                    </span>
                    <h4 className="text-base font-serif font-bold line-clamp-1 drop-shadow-xs">
                      {site.name}
                    </h4>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {site.address && (
                      <p className="text-xs text-[#737260] flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#8C8B79] shrink-0" />
                        <span className="truncate">{site.address}</span>
                      </p>
                    )}

                    <p className="text-xs text-[#434338] italic bg-[#FAF6E9] p-2.5 rounded-2xl border border-[#EBE3CD]">
                      "{site.notes}"
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      {site.openingHours && (
                        <div className="text-[#737260] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#D4A373] shrink-0" />
                          <span className="truncate">{site.openingHours}</span>
                        </div>
                      )}
                      {site.estimatedCost && (
                        <div className="text-[#737260] flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
                          <span className="truncate">{site.estimatedCost}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {site.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {site.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F5F2ED] text-[#5A5A40]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer & Google Maps Direct Link */}
                  <div className="pt-3 border-t border-[#EFEDE7] flex items-center justify-between">
                    <span className="text-[11px] text-[#737260] font-medium flex items-center gap-1">
                      <span>{recommender.avatarEmoji}</span>
                      Por {recommender.name}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(site)}
                        className="p-1.5 text-[#8C8B79] hover:text-[#434338] transition-colors cursor-pointer"
                        title="Editar sitio"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteSite(site.id)}
                        className="p-1.5 text-[#8C8B79] hover:text-[#D4A373] transition-colors cursor-pointer"
                        title="Eliminar sitio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={site.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3 text-[#E9EDC6]" />
                        Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Site Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-[#FBF9F5] rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
              <h3 className="text-base font-serif font-bold text-[#434338]">
                {editingSite ? 'Editar Sitio o Rincón' : 'Añadir Sitio a Visitar'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#8C8B79] hover:text-[#434338] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Ciudad o Destino del Itinerario *
                </label>
                <select
                  value={formData.cityId}
                  onChange={e => setFormData({ ...formData, cityId: e.target.value })}
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
                  Nombre del Lugar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fontana di Trevi, Osteria da Fortunata, Mirador Piazzale..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as SiteCategory })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                  >
                    {Object.entries(SITE_CATEGORIES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.emoji} {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                    Recomendado por
                  </label>
                  <select
                    value={formData.recommendedBy}
                    onChange={e => setFormData({ ...formData, recommendedBy: e.target.value as any })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                  >
                    <option value="both">🤝 Ambos</option>
                    <option value="p1">✈️ {p1.name}</option>
                    <option value="p2">🌸 {p2.name}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Enlace de Google Maps (Opcional, se autogenera si se deja vacío)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.googleMapsUrl}
                  onChange={e => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Foto URL (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photoUrl}
                  onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Notas / Consejos para la visita *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ej: Ir al amanecer para tirar la moneda sin gente, pedir la pasta carbonara con trufa..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                    Horario
                  </label>
                  <input
                    type="text"
                    placeholder="09:00 - 19:30 hs"
                    value={formData.openingHours}
                    onChange={e => setFormData({ ...formData, openingHours: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                    Precio Estimado
                  </label>
                  <input
                    type="text"
                    placeholder="Gratis / 25 € c/u"
                    value={formData.estimatedCost}
                    onChange={e => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Etiquetas (Separadas por comas)
                </label>
                <input
                  type="text"
                  placeholder="Atardecer, Fotos, Pasta, Romántico..."
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EFEDE7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#737260] hover:bg-[#E9E5D9] rounded-2xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-2xl cursor-pointer"
                >
                  {editingSite ? 'Guardar Cambios' : 'Añadir Sitio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
