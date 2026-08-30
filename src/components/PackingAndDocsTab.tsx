import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import {
  Luggage,
  FileText,
  CheckSquare,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  User,
  Calendar,
  X,
  Sparkles,
  Shield,
} from 'lucide-react';
import { PackingCategory, DocumentType, DocumentStatus, PackingItem, DocumentItem, PendingTask } from '../types';

const PACKING_CATEGORIES: Record<PackingCategory, { label: string; emoji: string }> = {
  ropa: { label: 'Ropa & Vestimenta', emoji: '👕' },
  calzado: { label: 'Calzado & Zapatos', emoji: '👟' },
  higiene: { label: 'Higiene & Cosmética', emoji: '🧴' },
  tecnologia: { label: 'Tecnología & Cargadores', emoji: '🔌' },
  botiquin: { label: 'Botiquín & Medicamentos', emoji: '💊' },
  playa_montana: { label: 'Playa / Trajes de baño', emoji: '🏖️' },
  documentacion: { label: 'Documentación en mano', emoji: '📁' },
  varios: { label: 'Varios & Accesorios', emoji: '🎒' },
};

const DOC_STATUS_MAP: Record<DocumentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  listo: {
    label: 'Listo & Verificado',
    color: 'bg-[#E9EDC6] text-[#434338] border-[#DCE4B8]',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40]" />,
  },
  en_tramite: {
    label: 'En Trámite',
    color: 'bg-[#FAF6E9] text-[#5A5A40] border-[#EBE3CD]',
    icon: <Clock className="w-3.5 h-3.5 text-[#D4A373]" />,
  },
  vence_pronto: {
    label: 'Vence Pronto',
    color: 'bg-[#FBF0E4] text-[#8A5A2B] border-[#F3DEC9]',
    icon: <AlertCircle className="w-3.5 h-3.5 text-[#D4A373]" />,
  },
  falta: {
    label: 'Falta Tramitar',
    color: 'bg-[#F9ECE7] text-[#8C5D3B] border-[#F2D7CB]',
    icon: <AlertCircle className="w-3.5 h-3.5 text-[#8C5D3B]" />,
  },
};

export const PackingAndDocsTab: React.FC = () => {
  const {
    trip,
    activePartnerId,
    togglePackingItem,
    addPackingItem,
    deletePackingItem,
    addDocument,
    updateDocument,
    deleteDocument,
    toggleTask,
    addTask,
    deleteTask,
  } = useTrip();

  const p1 = trip.partners[0];
  const p2 = trip.partners[1];

  const [activeSection, setActiveSection] = useState<'packing' | 'docs' | 'tasks'>('packing');
  const [selectedPackingOwner, setSelectedPackingOwner] = useState<'all' | 'p1' | 'p2' | 'compartido'>('all');

  // Modals
  const [isAddPackOpen, setIsAddPackOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Forms
  const [packForm, setPackForm] = useState({
    name: '',
    category: 'ropa' as PackingCategory,
    assignedTo: activePartnerId as 'p1' | 'p2' | 'compartido',
    quantity: 1,
    notes: '',
  });

  const [docForm, setDocForm] = useState({
    title: '',
    type: 'pasaporte' as DocumentType,
    owner: 'ambos' as 'p1' | 'p2' | 'ambos',
    status: 'listo' as DocumentStatus,
    expirationDate: '',
    notes: '',
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    assignedTo: 'ambos' as 'p1' | 'p2' | 'ambos',
    dueDate: '',
    priority: 'alta' as 'alta' | 'media' | 'baja',
    notes: '',
  });

  // Packing statistics
  const packingStats = useMemo(() => {
    const p1Items = trip.packingList.filter(i => i.assignedTo === 'p1');
    const p2Items = trip.packingList.filter(i => i.assignedTo === 'p2');
    const sharedItems = trip.packingList.filter(i => i.assignedTo === 'compartido');

    const p1Packed = p1Items.filter(i => i.isPacked).length;
    const p2Packed = p2Items.filter(i => i.isPacked).length;
    const sharedPacked = sharedItems.filter(i => i.isPacked).length;

    const total = trip.packingList.length;
    const totalPacked = trip.packingList.filter(i => i.isPacked).length;

    return {
      p1Total: p1Items.length,
      p1Packed,
      p1Pct: p1Items.length > 0 ? Math.round((p1Packed / p1Items.length) * 100) : 0,
      p2Total: p2Items.length,
      p2Packed,
      p2Pct: p2Items.length > 0 ? Math.round((p2Packed / p2Items.length) * 100) : 0,
      sharedTotal: sharedItems.length,
      sharedPacked,
      sharedPct: sharedItems.length > 0 ? Math.round((sharedPacked / sharedItems.length) * 100) : 0,
      total,
      totalPacked,
      totalPct: total > 0 ? Math.round((totalPacked / total) * 100) : 0,
    };
  }, [trip.packingList]);

  // Handlers
  const handleAddPack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packForm.name.trim()) return;

    addPackingItem({
      name: packForm.name.trim(),
      category: packForm.category,
      assignedTo: packForm.assignedTo,
      quantity: Number(packForm.quantity) || 1,
      isPacked: false,
      notes: packForm.notes.trim() || undefined,
    });
    setPackForm({
      name: '',
      category: 'ropa',
      assignedTo: activePartnerId,
      quantity: 1,
      notes: '',
    });
    setIsAddPackOpen(false);
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title.trim()) return;

    addDocument({
      title: docForm.title.trim(),
      type: docForm.type,
      owner: docForm.owner,
      status: docForm.status,
      expirationDate: docForm.expirationDate || undefined,
      notes: docForm.notes.trim() || undefined,
    });
    setDocForm({
      title: '',
      type: 'pasaporte',
      owner: 'ambos',
      status: 'listo',
      expirationDate: '',
      notes: '',
    });
    setIsAddDocOpen(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    addTask({
      title: taskForm.title.trim(),
      assignedTo: taskForm.assignedTo,
      dueDate: taskForm.dueDate || undefined,
      priority: taskForm.priority,
      completed: false,
      notes: taskForm.notes.trim() || undefined,
    });
    setTaskForm({
      title: '',
      assignedTo: 'ambos',
      dueDate: '',
      priority: 'alta',
      notes: '',
    });
    setIsAddTaskOpen(false);
  };

  // Filtered packing items
  const filteredPacking = useMemo(() => {
    return trip.packingList.filter(item => {
      if (selectedPackingOwner !== 'all' && item.assignedTo !== selectedPackingOwner) return false;
      return true;
    });
  }, [trip.packingList, selectedPackingOwner]);

  return (
    <div className="space-y-6">
      {/* Top Section Nav Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#EAE4D7] rounded-[24px] border border-[#D9D1B9] self-start">
          <button
            onClick={() => setActiveSection('packing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSection === 'packing'
                ? 'bg-white text-[#434338] shadow-sm'
                : 'text-[#737260] hover:text-[#434338]'
            }`}
          >
            <Luggage className="w-4 h-4 text-[#5A5A40]" />
            Listas de Equipaje ({packingStats.totalPacked}/{packingStats.total})
          </button>

          <button
            onClick={() => setActiveSection('docs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSection === 'docs'
                ? 'bg-white text-[#434338] shadow-sm'
                : 'text-[#737260] hover:text-[#434338]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#D4A373]" />
            Documentos ({trip.documents.length})
          </button>

          <button
            onClick={() => setActiveSection('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSection === 'tasks'
                ? 'bg-white text-[#434338] shadow-sm'
                : 'text-[#737260] hover:text-[#434338]'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-[#8C5D3B]" />
            Pendientes Pre-Viaje ({trip.tasks.filter(t => !t.completed).length})
          </button>
        </div>

        {/* Action Button */}
        <div>
          {activeSection === 'packing' && (
            <button
              onClick={() => setIsAddPackOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold shadow-md shadow-[#5A5A40]/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Añadir Objeto al Equipaje
            </button>
          )}

          {activeSection === 'docs' && (
            <button
              onClick={() => setIsAddDocOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold shadow-md shadow-[#5A5A40]/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Añadir Documento
            </button>
          )}

          {activeSection === 'tasks' && (
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold shadow-md shadow-[#5A5A40]/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Añadir Tarea Pendiente
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: EQUIPAJE */}
      {activeSection === 'packing' && (
        <div className="space-y-6">
          {/* Packing Progress Cards for Both Partners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Partner 1 */}
            <div
              onClick={() => setSelectedPackingOwner(selectedPackingOwner === 'p1' ? 'all' : 'p1')}
              className={`p-4 rounded-[28px] border transition-all cursor-pointer ${
                selectedPackingOwner === 'p1'
                  ? 'bg-[#E9EDC6]/40 border-[#5A5A40] shadow-sm'
                  : 'bg-white border-[#E5E0D5] hover:border-[#D9D1B9]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p1.avatarEmoji}</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#434338] font-serif">Maleta de {p1.name}</h4>
                    <span className="text-[11px] text-[#737260]">
                      {packingStats.p1Packed} de {packingStats.p1Total} empacados
                    </span>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#5A5A40] font-serif">
                  {packingStats.p1Pct}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EAE4D7] overflow-hidden">
                <div
                  className="h-full bg-[#5A5A40] rounded-full transition-all duration-500"
                  style={{ width: `${packingStats.p1Pct}%` }}
                />
              </div>
            </div>

            {/* Partner 2 */}
            <div
              onClick={() => setSelectedPackingOwner(selectedPackingOwner === 'p2' ? 'all' : 'p2')}
              className={`p-4 rounded-[28px] border transition-all cursor-pointer ${
                selectedPackingOwner === 'p2'
                  ? 'bg-[#FAF6E9] border-[#D4A373] shadow-sm'
                  : 'bg-white border-[#E5E0D5] hover:border-[#D9D1B9]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p2.avatarEmoji}</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#434338] font-serif">Maleta de {p2.name}</h4>
                    <span className="text-[11px] text-[#737260]">
                      {packingStats.p2Packed} de {packingStats.p2Total} empacados
                    </span>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#D4A373] font-serif">
                  {packingStats.p2Pct}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EAE4D7] overflow-hidden">
                <div
                  className="h-full bg-[#D4A373] rounded-full transition-all duration-500"
                  style={{ width: `${packingStats.p2Pct}%` }}
                />
              </div>
            </div>

            {/* Shared */}
            <div
              onClick={() => setSelectedPackingOwner(selectedPackingOwner === 'compartido' ? 'all' : 'compartido')}
              className={`p-4 rounded-[28px] border transition-all cursor-pointer ${
                selectedPackingOwner === 'compartido'
                  ? 'bg-[#F9ECE7] border-[#8C5D3B] shadow-sm'
                  : 'bg-white border-[#E5E0D5] hover:border-[#D9D1B9]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤝</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#434338] font-serif">Equipaje Compartido</h4>
                    <span className="text-[11px] text-[#737260]">
                      {packingStats.sharedPacked} de {packingStats.sharedTotal} listos
                    </span>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#8C5D3B] font-serif">
                  {packingStats.sharedPct}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EAE4D7] overflow-hidden">
                <div
                  className="h-full bg-[#8C5D3B] rounded-full transition-all duration-500"
                  style={{ width: `${packingStats.sharedPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Packing Items Grid */}
          <div className="bg-white rounded-[28px] border border-[#E5E0D5] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7] mb-4">
              <div className="text-xs font-bold text-[#8C8B79] uppercase tracking-wider">
                {selectedPackingOwner === 'all'
                  ? 'Todos los Objetos'
                  : selectedPackingOwner === 'p1'
                  ? `Equipaje de ${p1.name}`
                  : selectedPackingOwner === 'p2'
                  ? `Equipaje de ${p2.name}`
                  : 'Objetos Compartidos'}
              </div>
              <div className="text-xs text-[#737260] font-medium">
                {filteredPacking.filter(i => i.isPacked).length} de {filteredPacking.length} empacados
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredPacking.map(item => {
                const catInfo = PACKING_CATEGORIES[item.category] || PACKING_CATEGORIES.varios;
                const owner =
                  item.assignedTo === 'p1'
                    ? p1
                    : item.assignedTo === 'p2'
                    ? p2
                    : { name: 'Compartido', avatarEmoji: '🤝' };

                return (
                  <div
                    key={item.id}
                    onClick={() => togglePackingItem(item.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer select-none ${
                      item.isPacked
                        ? 'bg-[#F5F2ED]/80 border-[#E5E0D5] text-[#8C8B79] line-through'
                        : 'bg-[#FBF9F5] border-[#E5E0D5] hover:border-[#D9D1B9] text-[#434338]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0 transition-colors ${
                          item.isPacked ? 'bg-[#5A5A40] text-white' : 'border border-[#D9D1B9] bg-white'
                        }`}
                      >
                        {item.isPacked && '✓'}
                      </div>

                      <div className="truncate">
                        <div className="text-xs font-bold truncate flex items-center gap-1">
                          <span>{catInfo.emoji}</span>
                          <span>{item.name}</span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] font-normal text-[#8C8B79]">
                              (x{item.quantity})
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <div className="text-[10px] text-[#8C8B79] italic truncate">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs" title={`Asignado a ${owner.name}`}>
                        {owner.avatarEmoji}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deletePackingItem(item.id);
                        }}
                        className="text-[#8C8B79] hover:text-[#D4A373] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DOCUMENTOS DE VIAJE */}
      {activeSection === 'docs' && (
        <div className="space-y-4">
          <div className="bg-[#FAF6E9] p-4 rounded-[28px] border border-[#EBE3CD] flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#5A5A40] shrink-0" />
            <div className="text-xs text-[#434338]">
              <strong>Checklist de Documentación Obligatoria:</strong> Verifiquen que los pasaportes tengan al menos 6 meses de vigencia y que las pólizas de seguro médico estén descargadas en sus móviles.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trip.documents.map(doc => {
              const statusInfo = DOC_STATUS_MAP[doc.status] || DOC_STATUS_MAP.listo;
              const owner =
                doc.owner === 'p1'
                  ? p1
                  : doc.owner === 'p2'
                  ? p2
                  : { name: 'Ambos', avatarEmoji: '👫' };

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-[28px] border border-[#E5E0D5] p-5 shadow-xs hover:border-[#D9D1B9] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{owner.avatarEmoji}</span>
                        <span className="text-[11px] font-bold text-[#8C8B79] uppercase">
                          {owner.name}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#434338] font-serif">{doc.title}</h4>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>

                  {doc.expirationDate && (
                    <div className="text-xs text-[#737260] flex items-center gap-1.5 bg-[#F5F2ED] p-2.5 rounded-2xl">
                      <Calendar className="w-3.5 h-3.5 text-[#8C8B79]" />
                      <span>Vencimiento: <strong>{doc.expirationDate}</strong></span>
                    </div>
                  )}

                  {doc.notes && (
                    <p className="text-xs text-[#434338] italic bg-[#FAF6E9] p-2.5 rounded-2xl border border-[#EBE3CD]">
                      "{doc.notes}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#EFEDE7] flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        const nextStatus: DocumentStatus =
                          doc.status === 'listo'
                            ? 'en_tramite'
                            : doc.status === 'en_tramite'
                            ? 'vence_pronto'
                            : 'listo';
                        updateDocument(doc.id, { status: nextStatus });
                      }}
                      className="text-[#5A5A40] hover:text-[#434338] font-bold cursor-pointer underline decoration-dotted"
                    >
                      Cambiar Estado
                    </button>

                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="text-[#8C8B79] hover:text-[#D4A373] p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: PENDIENTES PRE-VIAJE */}
      {activeSection === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[28px] border border-[#E5E0D5] p-5 shadow-xs space-y-3">
            <div className="text-xs font-bold text-[#8C8B79] uppercase tracking-wider mb-2">
              Tareas y Asuntos por Resolver antes de Salir
            </div>

            <div className="divide-y divide-[#EFEDE7]">
              {trip.tasks.map(task => {
                const owner =
                  task.assignedTo === 'p1'
                    ? p1
                    : task.assignedTo === 'p2'
                    ? p2
                    : { name: 'Ambos', avatarEmoji: '👫' };

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#F5F2ED] px-3 rounded-2xl transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0 transition-colors ${
                          task.completed ? 'bg-[#5A5A40] text-white' : 'border border-[#D9D1B9] bg-white'
                        }`}
                      >
                        {task.completed && '✓'}
                      </div>

                      <div className="min-w-0">
                        <div
                          className={`text-sm font-semibold truncate ${
                            task.completed ? 'line-through text-[#8C8B79]' : 'text-[#434338]'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#8C8B79] mt-0.5">
                          <span>{owner.avatarEmoji} Asignado a {owner.name}</span>
                          {task.dueDate && (
                            <>
                              <span>•</span>
                              <span>Fecha límite: {task.dueDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          task.priority === 'alta'
                            ? 'bg-[#F9ECE7] text-[#8C5D3B] border border-[#F2D7CB]'
                            : 'bg-[#F5F2ED] text-[#5A5A40] border border-[#E5E0D5]'
                        }`}
                      >
                        Prioridad {task.priority}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="text-[#8C8B79] hover:text-[#D4A373] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Add Packing */}
      {isAddPackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-[#FBF9F5] rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
              <h3 className="text-base font-serif font-bold text-[#434338]">
                Añadir al Equipaje
              </h3>
              <button
                onClick={() => setIsAddPackOpen(false)}
                className="p-1 text-[#8C8B79] hover:text-[#434338] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPack} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Nombre del Objeto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Camisa de lino, Cargador portátil, Protector solar..."
                  value={packForm.name}
                  onChange={e => setPackForm({ ...packForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                    Categoría
                  </label>
                  <select
                    value={packForm.category}
                    onChange={e => setPackForm({ ...packForm, category: e.target.value as PackingCategory })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                  >
                    {Object.entries(PACKING_CATEGORIES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.emoji} {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                    ¿En qué maleta va?
                  </label>
                  <select
                    value={packForm.assignedTo}
                    onChange={e => setPackForm({ ...packForm, assignedTo: e.target.value as any })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                  >
                    <option value="p1">✈️ Maleta de {p1.name}</option>
                    <option value="p2">🌸 Maleta de {p2.name}</option>
                    <option value="compartido">🤝 Compartido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={packForm.quantity}
                  onChange={e => setPackForm({ ...packForm, quantity: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Notas (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Llevar en equipaje de mano"
                  value={packForm.notes}
                  onChange={e => setPackForm({ ...packForm, notes: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EFEDE7]">
                <button
                  type="button"
                  onClick={() => setIsAddPackOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#737260] hover:bg-[#E9E5D9] rounded-2xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-2xl cursor-pointer"
                >
                  Guardar en Equipaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Document */}
      {isAddDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-[#FBF9F5] rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
              <h3 className="text-base font-serif font-bold text-[#434338]">
                Añadir Documento de Viaje
              </h3>
              <button
                onClick={() => setIsAddDocOpen(false)}
                className="p-1 text-[#8C8B79] hover:text-[#434338] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Nombre del Documento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Seguro Médico Internacional, Carnet Conductor..."
                  value={docForm.title}
                  onChange={e => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                    Titular
                  </label>
                  <select
                    value={docForm.owner}
                    onChange={e => setDocForm({ ...docForm, owner: e.target.value as any })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                  >
                    <option value="ambos">👫 Ambos</option>
                    <option value="p1">✈️ {p1.name}</option>
                    <option value="p2">🌸 {p2.name}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                    Estado
                  </label>
                  <select
                    value={docForm.status}
                    onChange={e => setDocForm({ ...docForm, status: e.target.value as DocumentStatus })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                  >
                    <option value="listo">✅ Listo & Verificado</option>
                    <option value="en_tramite">⏳ En Trámite</option>
                    <option value="vence_pronto">⚠️ Vence Pronto</option>
                    <option value="falta">❌ Falta Tramitar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={docForm.expirationDate}
                  onChange={e => setDocForm({ ...docForm, expirationDate: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Notas / Nº de Póliza
                </label>
                <input
                  type="text"
                  placeholder="Póliza #12345 / Teléfono de emergencia..."
                  value={docForm.notes}
                  onChange={e => setDocForm({ ...docForm, notes: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EFEDE7]">
                <button
                  type="button"
                  onClick={() => setIsAddDocOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#737260] hover:bg-[#E9E5D9] rounded-2xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-2xl cursor-pointer"
                >
                  Guardar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Task */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-[#FBF9F5] rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEDE7]">
              <h3 className="text-base font-serif font-bold text-[#434338]">
                Añadir Tarea Pre-Viaje
              </h3>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="p-1 text-[#8C8B79] hover:text-[#434338] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  ¿Qué hay que hacer? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Avisar al banco, Regar plantas, Comprar candados TSA..."
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                    Responsable
                  </label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value as any })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                  >
                    <option value="ambos">👫 Ambos</option>
                    <option value="p1">✈️ {p1.name}</option>
                    <option value="p2">🌸 {p2.name}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                    Prioridad
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                  >
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Media</option>
                    <option value="baja">🟢 Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#D9D1B9] rounded-2xl bg-white text-[#434338]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EFEDE7]">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#737260] hover:bg-[#E9E5D9] rounded-2xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-2xl cursor-pointer"
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
