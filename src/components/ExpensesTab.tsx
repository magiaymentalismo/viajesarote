import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import {
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Bookmark,
  TrendingUp,
  Filter,
  DollarSign,
  PieChart,
  Calendar,
  Tag,
  Trash2,
  Edit2,
  X,
  CreditCard,
  Receipt,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  List,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Expense, ExpenseCategory, ExpenseStatus, SplitType, PartnerId } from '../types';

const CATEGORY_MAP: Record<ExpenseCategory, { label: string; emoji: string; color: string }> = {
  vuelos: { label: 'Vuelos', emoji: '✈️', color: 'bg-[#E9E5D9] text-[#434338] border-[#D9D1B9]' },
  alojamiento: { label: 'Alojamiento', emoji: '🏨', color: 'bg-[#E9EDC6] text-[#434338] border-[#D9D1B9]' },
  comida: { label: 'Comida & Bares', emoji: '🍝', color: 'bg-[#FAF6E9] text-[#434338] border-[#EBE3CD]' },
  transporte: { label: 'Transporte', emoji: '🚆', color: 'bg-[#E9E5D9] text-[#434338] border-[#D9D1B9]' },
  actividades: { label: 'Actividades & Tours', emoji: '🎟️', color: 'bg-[#E9EDC6] text-[#434338] border-[#D9D1B9]' },
  compras: { label: 'Compras & Recuerdos', emoji: '🛍️', color: 'bg-[#FAF6E9] text-[#434338] border-[#EBE3CD]' },
  seguros: { label: 'Seguro Médico', emoji: '🏥', color: 'bg-[#E9E5D9] text-[#434338] border-[#D9D1B9]' },
  otros: { label: 'Otros Gastos', emoji: '🪙', color: 'bg-[#F5F2ED] text-[#434338] border-[#D9D1B9]' },
};

const STATUS_MAP: Record<ExpenseStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pagado: {
    label: 'Pagado',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40]" />,
    color: 'bg-[#E9EDC6] text-[#434338] border-[#D9D1B9]',
  },
  reservado: {
    label: 'Reservado',
    icon: <Bookmark className="w-3.5 h-3.5 text-[#D4A373]" />,
    color: 'bg-[#FAF6E9] text-[#5A5A40] border-[#EBE3CD]',
  },
  pendiente: {
    label: 'Pendiente',
    icon: <Clock className="w-3.5 h-3.5 text-[#8C8B79]" />,
    color: 'bg-[#F5F2ED] text-[#737260] border-[#D9D1B9]',
  },
};

export const ExpensesTab: React.FC = () => {
  const { trip, activePartnerId, addExpense, updateExpense, deleteExpense, addSettlement } = useTrip();

  const p1 = trip.partners[0];
  const p2 = trip.partners[1];

  // Collapsible sections state
  const [isBalanceOpen, setIsBalanceOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'by-category'>('by-category');
  
  // Track open category accordions
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    vuelos: true,
    alojamiento: true,
    comida: true,
    transporte: true,
    actividades: true,
    compras: true,
    seguros: true,
    otros: true,
  });

  // Track single expanded expense items in list view
  const [expandedExpenseIds, setExpandedExpenseIds] = useState<Record<string, boolean>>({});

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayer, setFilterPayer] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'comida' as ExpenseCategory,
    date: new Date().toISOString().split('T')[0],
    paidById: (activePartnerId || 'p1') as 'p1' | 'p2' | 'both',
    splitType: 'equal' as SplitType,
    splitRatioP1: 50,
    splitRatioP2: 50,
    status: 'pagado' as ExpenseStatus,
    notes: '',
  });

  // Calculate totals and Tricount balance
  const calculations = useMemo(() => {
    let totalGeneral = 0;
    let totalPagado = 0;
    let totalReservado = 0;
    let totalPendiente = 0;

    let p1TotalPaid = 0;
    let p2TotalPaid = 0;
    let p1ShouldPay = 0;
    let p2ShouldPay = 0;

    const categoryBreakdown: Record<ExpenseCategory, number> = {
      vuelos: 0,
      alojamiento: 0,
      comida: 0,
      transporte: 0,
      actividades: 0,
      compras: 0,
      seguros: 0,
      otros: 0,
    };

    (trip.expenses || []).forEach(exp => {
      const amt = Number(exp.amount) || 0;
      totalGeneral += amt;

      if (exp.status === 'pagado') totalPagado += amt;
      else if (exp.status === 'reservado') totalReservado += amt;
      else if (exp.status === 'pendiente') totalPendiente += amt;

      if (categoryBreakdown[exp.category] !== undefined) {
        categoryBreakdown[exp.category] += amt;
      }

      // Tricount calculations
      if (exp.paidById === 'p1') {
        p1TotalPaid += amt;
      } else if (exp.paidById === 'p2') {
        p2TotalPaid += amt;
      } else if (exp.paidById === 'both') {
        p1TotalPaid += amt / 2;
        p2TotalPaid += amt / 2;
      }

      // Who was supposed to pay?
      if (exp.splitType === 'equal') {
        p1ShouldPay += amt / 2;
        p2ShouldPay += amt / 2;
      } else if (exp.splitType === 'p1_only') {
        p1ShouldPay += amt;
      } else if (exp.splitType === 'p2_only') {
        p2ShouldPay += amt;
      } else if (exp.splitType === 'custom') {
        const r1 = (exp.splitRatio?.p1 || 50) / 100;
        const r2 = (exp.splitRatio?.p2 || 50) / 100;
        p1ShouldPay += amt * r1;
        p2ShouldPay += amt * r2;
      }
    });

    // Account for settlements
    let settlementsP1ToP2 = 0;
    let settlementsP2ToP1 = 0;

    (trip.settlements || []).forEach(s => {
      if (s.isCompleted) {
        if (s.fromPartnerId === 'p1' && s.toPartnerId === 'p2') {
          settlementsP1ToP2 += s.amount;
        } else if (s.fromPartnerId === 'p2' && s.toPartnerId === 'p1') {
          settlementsP2ToP1 += s.amount;
        }
      }
    });

    // p1 balance = (p1 paid + p1 gave to p2) - (p1 should pay + p2 gave to p1)
    const p1NetPaid = p1TotalPaid + settlementsP1ToP2 - settlementsP2ToP1;
    const p2NetPaid = p2TotalPaid + settlementsP2ToP1 - settlementsP1ToP2;

    const p1Balance = p1NetPaid - p1ShouldPay;
    const p2Balance = p2NetPaid - p2ShouldPay;

    return {
      totalGeneral,
      totalPagado,
      totalReservado,
      totalPendiente,
      p1TotalPaid,
      p2TotalPaid,
      p1ShouldPay,
      p2ShouldPay,
      p1Balance,
      p2Balance,
      categoryBreakdown,
    };
  }, [trip.expenses, trip.settlements]);

  // Expand / Collapse Helpers
  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleExpandAllCategories = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    Object.keys(CATEGORY_MAP).forEach(k => {
      next[k] = expand;
    });
    setExpandedCategories(next);
  };

  const toggleExpenseCard = (id: string) => {
    setExpandedExpenseIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: '',
      category: 'comida',
      date: new Date().toISOString().split('T')[0],
      paidById: activePartnerId,
      splitType: 'equal',
      splitRatioP1: 50,
      splitRatioP2: 50,
      status: 'pagado',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData({
      description: exp.description,
      amount: exp.amount.toString(),
      category: exp.category,
      date: exp.date,
      paidById: exp.paidById,
      splitType: exp.splitType,
      splitRatioP1: exp.splitRatio?.p1 ?? 50,
      splitRatioP2: exp.splitRatio?.p2 ?? 50,
      status: exp.status,
      notes: exp.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (!formData.description.trim() || isNaN(amountNum) || amountNum <= 0) return;

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        description: formData.description.trim(),
        amount: amountNum,
        currency: trip.currency,
        category: formData.category,
        date: formData.date,
        paidById: formData.paidById,
        splitType: formData.splitType,
        splitRatio: { p1: formData.splitRatioP1, p2: formData.splitRatioP2 },
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      });
    } else {
      addExpense({
        description: formData.description.trim(),
        amount: amountNum,
        currency: trip.currency,
        category: formData.category,
        date: formData.date,
        paidById: formData.paidById,
        splitType: formData.splitType,
        splitRatio: { p1: formData.splitRatioP1, p2: formData.splitRatioP2 },
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      });
    }
    setIsModalOpen(false);
    setIsQuickAddOpen(false);
  };

  const handleSettleUp = () => {
    const debtAmount = Math.abs(calculations.p1Balance);
    if (debtAmount < 0.01) return;

    const fromId: PartnerId = calculations.p1Balance < 0 ? 'p1' : 'p2';
    const toId: PartnerId = calculations.p1Balance < 0 ? 'p2' : 'p1';

    addSettlement({
      fromPartnerId: fromId,
      toPartnerId: toId,
      amount: Math.round(debtAmount * 100) / 100,
      date: new Date().toISOString().split('T')[0],
      notes: 'Deuda saldada en un click 🎉',
      isCompleted: true,
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Filter expenses list
  const filteredExpenses = useMemo(() => {
    return trip.expenses.filter(exp => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchDesc = exp.description.toLowerCase().includes(term);
        const matchNotes = exp.notes?.toLowerCase().includes(term);
        if (!matchDesc && !matchNotes) return false;
      }
      if (filterCategory !== 'all' && exp.category !== filterCategory) return false;
      if (filterStatus !== 'all' && exp.status !== filterStatus) return false;
      if (filterPayer !== 'all' && exp.paidById !== filterPayer) return false;
      return true;
    });
  }, [trip.expenses, searchTerm, filterCategory, filterStatus, filterPayer]);

  // Grouped expenses by category
  const expensesByCategory = useMemo(() => {
    const map: Record<string, Expense[]> = {};
    Object.keys(CATEGORY_MAP).forEach(k => {
      map[k] = [];
    });

    filteredExpenses.forEach(exp => {
      if (!map[exp.category]) map[exp.category] = [];
      map[exp.category].push(exp);
    });

    return map;
  }, [filteredExpenses]);

  return (
    <div className="space-y-5">
      {/* 1. COLLAPSIBLE TRICOUNT & BALANCE CARD */}
      <div className="bg-[#E9EDC6]/70 rounded-[28px] border border-[#D9D1B9] shadow-xs overflow-hidden transition-all">
        <div
          onClick={() => setIsBalanceOpen(!isBalanceOpen)}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#E9EDC6]/90 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#5A5A40] text-white rounded-2xl shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#434338] flex items-center gap-2">
                Cuentas Claras (Tricount de Pareja)
                {Math.abs(calculations.p1Balance) < 0.05 ? (
                  <span className="text-[11px] font-sans font-bold bg-white text-[#5A5A40] px-2.5 py-0.5 rounded-full border border-[#D9D1B9]">
                    Al día ✨
                  </span>
                ) : (
                  <span className="text-[11px] font-sans font-bold bg-[#FAF6E9] text-[#D4A373] px-2.5 py-0.5 rounded-full border border-[#EBE3CD]">
                    Balance pendiente
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#737260]">
                {isBalanceOpen
                  ? 'Calcula automáticamente quién le debe a quién para estar 50/50'
                  : calculations.p1Balance < -0.05
                  ? `${p1.name} le debe ${Math.abs(calculations.p1Balance).toFixed(2)} ${trip.currency} a ${p2.name}`
                  : calculations.p1Balance > 0.05
                  ? `${p2.name} le debe ${Math.abs(calculations.p1Balance).toFixed(2)} ${trip.currency} a ${p1.name}`
                  : 'Ambos están al día sin deudas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1.5 rounded-xl bg-white/70 text-[#5A5A40] hover:bg-white"
            >
              {isBalanceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isBalanceOpen && (
          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[#D9D1B9]/50 animate-in fade-in">
            {/* Debt Banner */}
            <div className="p-4 rounded-2xl bg-white border border-[#D9D1B9] shadow-xs">
              {Math.abs(calculations.p1Balance) < 0.05 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[#434338]">
                    <div className="w-10 h-10 rounded-2xl bg-[#E9EDC6] flex items-center justify-center text-[#5A5A40] font-bold text-lg">
                      ✨
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#434338]">¡Están totalmente a mano!</div>
                      <div className="text-xs text-[#737260]">
                        No hay deudas pendientes entre {p1.name} y {p2.name}.
                      </div>
                    </div>
                  </div>
                </div>
              ) : calculations.p1Balance < 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#F5F2ED] border border-[#D9D1B9] flex items-center justify-center text-xl shrink-0">
                      {p1.avatarEmoji}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider">
                        Deuda Calculada
                      </div>
                      <div className="text-base font-bold text-[#434338] flex items-center gap-2">
                        <span>{p1.name}</span>
                        <ArrowRight className="w-4 h-4 text-[#8C8B79]" />
                        <span>{p2.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <div className="text-xl font-serif font-bold text-[#434338]">
                        {Math.abs(calculations.p1Balance).toFixed(2)} {trip.currency}
                      </div>
                      <div className="text-[11px] text-[#737260]">
                        para quedar 50/50
                      </div>
                    </div>
                    <button
                      id="btn-settle-balance"
                      onClick={handleSettleUp}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold shadow-xs transition-all transform active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E9EDC6]" />
                      Saldar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#F5F2ED] border border-[#D9D1B9] flex items-center justify-center text-xl shrink-0">
                      {p2.avatarEmoji}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider">
                        Deuda Calculada
                      </div>
                      <div className="text-base font-bold text-[#434338] flex items-center gap-2">
                        <span>{p2.name}</span>
                        <ArrowRight className="w-4 h-4 text-[#8C8B79]" />
                        <span>{p1.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <div className="text-xl font-serif font-bold text-[#434338]">
                        {Math.abs(calculations.p1Balance).toFixed(2)} {trip.currency}
                      </div>
                      <div className="text-[11px] text-[#737260]">
                        para quedar 50/50
                      </div>
                    </div>
                    <button
                      id="btn-settle-balance"
                      onClick={handleSettleUp}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold shadow-xs transition-all transform active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E9EDC6]" />
                      Saldar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Total Paid Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-2xl border border-[#D9D1B9]">
                <span className="text-[10px] font-bold uppercase text-[#8C8B79] block">
                  Total Viaje
                </span>
                <span className="text-base font-serif font-bold text-[#434338]">
                  {calculations.totalGeneral.toFixed(2)} {trip.currency}
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#D9D1B9]">
                <span className="text-[10px] font-bold uppercase text-[#8C8B79] block">
                  {p1.avatarEmoji} Pagó {p1.name}
                </span>
                <span className="text-base font-serif font-bold text-[#434338]">
                  {calculations.p1TotalPaid.toFixed(2)} {trip.currency}
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#D9D1B9]">
                <span className="text-[10px] font-bold uppercase text-[#8C8B79] block">
                  {p2.avatarEmoji} Pagó {p2.name}
                </span>
                <span className="text-base font-serif font-bold text-[#434338]">
                  {calculations.p2TotalPaid.toFixed(2)} {trip.currency}
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#D9D1B9]">
                <span className="text-[10px] font-bold uppercase text-[#8C8B79] block">
                  Pendiente de Pago
                </span>
                <span className="text-base font-serif font-bold text-[#D4A373]">
                  {calculations.totalPendiente.toFixed(2)} {trip.currency}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. COLLAPSIBLE CATEGORY BREAKDOWN STATS */}
      <div className="bg-white rounded-[24px] border border-[#E5E0D5] shadow-xs overflow-hidden">
        <div
          onClick={() => setIsStatsOpen(!isStatsOpen)}
          className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-[#FAF6E9]/40 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FAF6E9] text-[#5A5A40] rounded-xl border border-[#EBE3CD]">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-serif font-bold text-[#434338]">
                Resumen por Categorías
              </span>
              <span className="text-[11px] text-[#737260] ml-2">
                ({Object.values(calculations.categoryBreakdown).filter((v: number) => v > 0).length} con gastos)
              </span>
            </div>
          </div>
          <button type="button" className="p-1 text-[#8C8B79]">
            {isStatsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isStatsOpen && (
          <div className="p-4 pt-1 border-t border-[#EFEDE7] grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in fade-in">
            {Object.entries(CATEGORY_MAP).map(([catKey, val]) => {
              const spent = calculations.categoryBreakdown[catKey as ExpenseCategory] || 0;
              const percent =
                calculations.totalGeneral > 0
                  ? Math.round((spent / calculations.totalGeneral) * 100)
                  : 0;

              return (
                <div
                  key={catKey}
                  onClick={() => {
                    setFilterCategory(filterCategory === catKey ? 'all' : catKey);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    filterCategory === catKey
                      ? 'bg-[#FAF6E9] border-[#5A5A40] ring-1 ring-[#5A5A40]'
                      : 'bg-[#FBF9F5] border-[#EFEDE7] hover:border-[#D9D1B9]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{val.emoji}</span>
                    <span className="text-[10px] font-bold text-[#8C8B79]">{percent}%</span>
                  </div>
                  <div className="text-xs font-bold text-[#434338] truncate">{val.label}</div>
                  <div className="text-xs font-serif text-[#5A5A40] font-bold mt-0.5">
                    {spent.toFixed(2)} {trip.currency}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. CONTROLS BAR: SEARCH, FILTERS & ADD EXPENSE */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Left: View Mode Toggles & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-[#E9E5D9] rounded-2xl border border-[#D9D1B9]">
              <button
                type="button"
                onClick={() => setViewMode('by-category')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'by-category'
                    ? 'bg-white text-[#434338] shadow-xs'
                    : 'text-[#737260] hover:text-[#434338]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Por Categorías
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#434338] shadow-xs'
                    : 'text-[#737260] hover:text-[#434338]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Lista Corrida
              </button>
            </div>

            {/* Quick search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-[#8C8B79] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar gasto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-white rounded-2xl border border-[#D9D1B9] text-[#434338] focus:outline-[#5A5A40]"
              />
            </div>

            {/* Toggle Filters Dropdown */}
            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-colors cursor-pointer ${
                isFiltersOpen || filterCategory !== 'all' || filterStatus !== 'all' || filterPayer !== 'all'
                  ? 'bg-[#FAF6E9] border-[#5A5A40] text-[#5A5A40]'
                  : 'bg-white border-[#D9D1B9] text-[#737260] hover:bg-[#F5F2ED]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filtros
              {(filterCategory !== 'all' || filterStatus !== 'all' || filterPayer !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-[#D4A373]" />
              )}
            </button>
          </div>

          {/* Right: Add Expense Trigger */}
          <button
            id="btn-add-expense"
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#5A5A40] hover:bg-[#434338] text-white text-xs font-bold shadow-md shadow-[#5A5A40]/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Anotar Nuevo Gasto
          </button>
        </div>

        {/* Collapsible Filter Details */}
        {isFiltersOpen && (
          <div className="p-3.5 bg-white rounded-2xl border border-[#D9D1B9] flex flex-wrap items-center gap-2.5 animate-in fade-in">
            {/* Filter Category */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-xs font-semibold bg-[#F5F2ED] border border-[#D9D1B9] rounded-xl px-2.5 py-1.5 text-[#434338]"
            >
              <option value="all">Todas las Categorías</option>
              {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.emoji} {v.label}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs font-semibold bg-[#F5F2ED] border border-[#D9D1B9] rounded-xl px-2.5 py-1.5 text-[#434338]"
            >
              <option value="all">Todos los Estados</option>
              <option value="pagado">Pagado</option>
              <option value="reservado">Reservado</option>
              <option value="pendiente">Pendiente</option>
            </select>

            {/* Filter Payer */}
            <select
              value={filterPayer}
              onChange={e => setFilterPayer(e.target.value)}
              className="text-xs font-semibold bg-[#F5F2ED] border border-[#D9D1B9] rounded-xl px-2.5 py-1.5 text-[#434338]"
            >
              <option value="all">Todos los Pagadores</option>
              <option value="p1">Pagó {p1.name}</option>
              <option value="p2">Pagó {p2.name}</option>
              <option value="both">Ambos</option>
            </select>

            {(filterCategory !== 'all' || filterStatus !== 'all' || filterPayer !== 'all' || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setFilterCategory('all');
                  setFilterStatus('all');
                  setFilterPayer('all');
                  setSearchTerm('');
                }}
                className="text-xs font-bold text-[#D4A373] hover:text-[#5A5A40] underline px-2 py-1"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. EXPENSES DISPLAY: CATEGORY ACCORDIONS OR DETAILED LIST */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-[28px] border border-[#E5E0D5] p-10 text-center text-[#8C8B79]">
          <Receipt className="w-12 h-12 mx-auto mb-3 text-[#D9D1B9] stroke-1" />
          <div className="font-serif font-bold text-[#434338] text-base">
            No hay gastos registrados aún
          </div>
          <p className="text-xs text-[#737260] mt-1 max-w-sm mx-auto leading-relaxed">
            Anoten los vuelos, reservas de hotel, comidas o compras para que la app mantenga las cuentas claras y calculadas automáticamente.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-5 py-2 rounded-2xl bg-[#5A5A40] text-white text-xs font-bold hover:bg-[#434338] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Anotar Primer Gasto
          </button>
        </div>
      ) : viewMode === 'by-category' ? (
        /* ACCORDION BY CATEGORY */
        <div className="space-y-3">
          {/* Quick expand/collapse all button */}
          <div className="flex justify-end gap-2 text-xs font-semibold text-[#8C8B79] px-1">
            <button
              onClick={() => toggleExpandAllCategories(true)}
              className="hover:text-[#434338] cursor-pointer"
            >
              Expandir Todos
            </button>
            <span>•</span>
            <button
              onClick={() => toggleExpandAllCategories(false)}
              className="hover:text-[#434338] cursor-pointer"
            >
              Colapsar Todos
            </button>
          </div>

          {Object.entries(CATEGORY_MAP).map(([catKey, val]) => {
            const items = expensesByCategory[catKey] || [];
            if (items.length === 0 && filterCategory !== 'all') return null;
            if (items.length === 0) return null; // hide empty categories to keep view clean

            const isExpanded = expandedCategories[catKey] ?? true;
            const categoryTotal = items.reduce((sum, item) => sum + Number(item.amount), 0);

            return (
              <div
                key={catKey}
                className="bg-white rounded-[24px] border border-[#E5E0D5] shadow-xs overflow-hidden transition-all"
              >
                {/* Category Accordion Header */}
                <div
                  onClick={() => toggleCategory(catKey)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-[#FAF6E9]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{val.emoji}</span>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#434338] flex items-center gap-2">
                        {val.label}
                        <span className="text-[11px] font-sans font-semibold text-[#8C8B79] bg-[#F5F2ED] px-2 py-0.5 rounded-full border border-[#E5E0D5]">
                          {items.length} {items.length === 1 ? 'gasto' : 'gastos'}
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-serif font-bold text-[#434338]">
                        {categoryTotal.toFixed(2)} {trip.currency}
                      </span>
                    </div>
                    <div className="p-1 rounded-lg text-[#8C8B79]">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Category Accordion Content */}
                {isExpanded && (
                  <div className="divide-y divide-[#EFEDE7] border-t border-[#EFEDE7] animate-in fade-in">
                    {items.map(exp => {
                      const statusInfo = STATUS_MAP[exp.status] || STATUS_MAP.pagado;
                      const payer =
                        exp.paidById === 'p1'
                          ? p1
                          : exp.paidById === 'p2'
                          ? p2
                          : { name: 'Ambos (50/50)', avatarEmoji: '🤝' };

                      const isItemExpanded = expandedExpenseIds[exp.id] ?? false;

                      return (
                        <div
                          key={exp.id}
                          className="p-4 hover:bg-[#FAF6E9]/20 transition-colors group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div
                              onClick={() => toggleExpenseCard(exp.id)}
                              className="flex items-start gap-3 cursor-pointer flex-1"
                            >
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-[#434338] text-sm">
                                    {exp.description}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}
                                  >
                                    {statusInfo.icon}
                                    {statusInfo.label}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#737260]">
                                  <span className="flex items-center gap-1 font-medium">
                                    <span>{payer.avatarEmoji}</span>
                                    Pagó: <strong className="text-[#434338]">{payer.name}</strong>
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#8C8B79]" />
                                    {exp.date}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Amount & Actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFEDE7]">
                              <div className="text-left sm:text-right">
                                <div className="text-base font-serif font-bold text-[#434338]">
                                  {Number(exp.amount).toFixed(2)} {trip.currency}
                                </div>
                                <div className="text-[10px] text-[#8C8B79]">
                                  {exp.splitType === 'equal'
                                    ? `${(Number(exp.amount) / 2).toFixed(2)} ${trip.currency} c/u`
                                    : ''}
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditModal(exp)}
                                  className="p-1.5 text-[#737260] hover:text-[#434338] hover:bg-[#E9E5D9] rounded-lg transition-colors cursor-pointer"
                                  title="Editar gasto"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteExpense(exp.id)}
                                  className="p-1.5 text-[#737260] hover:text-[#D4A373] hover:bg-[#E9E5D9] rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar gasto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Extra Collapsible details on click */}
                          {isItemExpanded && (
                            <div className="mt-3 pt-3 border-t border-[#EFEDE7] text-xs text-[#737260] space-y-1.5 animate-in fade-in bg-[#FAF6E9]/40 p-3 rounded-xl">
                              <div>
                                <strong>División: </strong>
                                {exp.splitType === 'equal'
                                  ? '50% / 50% en partes iguales'
                                  : exp.splitType === 'p1_only'
                                  ? `100% asumido por ${p1.name}`
                                  : exp.splitType === 'p2_only'
                                  ? `100% asumido por ${p2.name}`
                                  : `Personalizado (${exp.splitRatio?.p1}% ${p1.name} / ${exp.splitRatio?.p2}% ${p2.name})`}
                              </div>
                              {exp.notes && (
                                <div>
                                  <strong>Nota: </strong>
                                  <span className="italic">"{exp.notes}"</span>
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
            );
          })}
        </div>
      ) : (
        /* FLAT LIST VIEW */
        <div className="bg-white rounded-[28px] border border-[#E5E0D5] shadow-xs overflow-hidden divide-y divide-[#EFEDE7]">
          {filteredExpenses.map(exp => {
            const catInfo = CATEGORY_MAP[exp.category] || CATEGORY_MAP.otros;
            const statusInfo = STATUS_MAP[exp.status] || STATUS_MAP.pagado;
            const payer =
              exp.paidById === 'p1'
                ? p1
                : exp.paidById === 'p2'
                ? p2
                : { name: 'Ambos (50/50)', avatarEmoji: '🤝' };

            const isItemExpanded = expandedExpenseIds[exp.id] ?? false;

            return (
              <div
                key={exp.id}
                className="p-4 sm:p-5 hover:bg-[#F9F8F4] transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div
                    onClick={() => toggleExpenseCard(exp.id)}
                    className="flex items-start gap-3.5 cursor-pointer flex-1"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#F5F2ED] border border-[#D9D1B9] flex items-center justify-center text-xl shrink-0">
                      {catInfo.emoji}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#434338] text-sm sm:text-base">
                          {exp.description}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#E9E5D9] text-[#5A5A40]">
                          {catInfo.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#737260]">
                        <span className="flex items-center gap-1 font-medium">
                          <span>{payer.avatarEmoji}</span>
                          Pagó: <strong className="text-[#434338]">{payer.name}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8C8B79]" />
                          {exp.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#EFEDE7]">
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-serif font-bold text-[#434338]">
                        {Number(exp.amount).toFixed(2)} {trip.currency}
                      </div>
                      <div className="text-[11px] text-[#8C8B79]">
                        {exp.splitType === 'equal'
                          ? `${(Number(exp.amount) / 2).toFixed(2)} ${trip.currency} c/u`
                          : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(exp)}
                        className="p-1.5 text-[#737260] hover:text-[#434338] hover:bg-[#E9E5D9] rounded-lg transition-colors cursor-pointer"
                        title="Editar gasto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1.5 text-[#737260] hover:text-[#D4A373] hover:bg-[#E9E5D9] rounded-lg transition-colors cursor-pointer"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {isItemExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#EFEDE7] text-xs text-[#737260] space-y-1.5 animate-in fade-in bg-[#FAF6E9]/40 p-3 rounded-xl">
                    <div>
                      <strong>División: </strong>
                      {exp.splitType === 'equal'
                        ? '50% / 50% en partes iguales'
                        : exp.splitType === 'p1_only'
                        ? `100% ${p1.name}`
                        : exp.splitType === 'p2_only'
                        ? `100% ${p2.name}`
                        : `${exp.splitRatio?.p1}% ${p1.name} / ${exp.splitRatio?.p2}% ${p2.name}`}
                    </div>
                    {exp.notes && (
                      <div>
                        <strong>Notas: </strong>
                        <span className="italic">"{exp.notes}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT EXPENSE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-[#FBF9F5] rounded-[32px] shadow-2xl border border-[#D9D1B9] max-w-lg w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#EFEDE7]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#E9EDC6] text-[#5A5A40] rounded-2xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#434338]">
                    {editingExpense ? 'Editar Gasto' : 'Anotar Nuevo Gasto'}
                  </h3>
                  <p className="text-xs text-[#737260]">
                    Registra compras, comidas o reservas del viaje
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#8C8B79] hover:text-[#434338] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#434338] mb-1">
                  Descripción *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cena en trattoria, Entradas Coliseo, Taxi al aeropuerto"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-sm p-3 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338] focus:outline-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#434338] mb-1">
                    Monto ({trip.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full text-base font-serif font-bold p-3 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338] focus:outline-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#434338] mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                    }
                    className="w-full text-xs font-bold p-3.5 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338] focus:outline-[#5A5A40]"
                  >
                    {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.emoji} {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Paid By Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#434338] mb-1.5">
                  ¿Quién lo pagó?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paidById: 'p1' })}
                    className={`p-2.5 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      formData.paidById === 'p1'
                        ? 'bg-white border-[#5A5A40] text-[#5A5A40] shadow-xs'
                        : 'bg-white/60 border-[#D9D1B9] text-[#737260]'
                    }`}
                  >
                    <span className="text-base">{p1.avatarEmoji}</span>
                    <span>{p1.name}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paidById: 'p2' })}
                    className={`p-2.5 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      formData.paidById === 'p2'
                        ? 'bg-white border-[#5A5A40] text-[#5A5A40] shadow-xs'
                        : 'bg-white/60 border-[#D9D1B9] text-[#737260]'
                    }`}
                  >
                    <span className="text-base">{p2.avatarEmoji}</span>
                    <span>{p2.name}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paidById: 'both' })}
                    className={`p-2.5 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      formData.paidById === 'both'
                        ? 'bg-white border-[#5A5A40] text-[#5A5A40] shadow-xs'
                        : 'bg-white/60 border-[#D9D1B9] text-[#737260]'
                    }`}
                  >
                    <span className="text-base">🤝</span>
                    <span>Ambos (50/50)</span>
                  </button>
                </div>
              </div>

              {/* Split Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#434338] mb-1.5">
                  ¿Cómo se divide?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, splitType: 'equal' })}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      formData.splitType === 'equal'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-white border-[#D9D1B9] text-[#737260]'
                    }`}
                  >
                    50% / 50%
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, splitType: 'p1_only' })}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      formData.splitType === 'p1_only'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-white border-[#D9D1B9] text-[#737260]'
                    }`}
                  >
                    Solo {p1.name}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, splitType: 'p2_only' })}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      formData.splitType === 'p2_only'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-white border-[#D9D1B9] text-[#737260]'
                    }`}
                  >
                    Solo {p2.name}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, splitType: 'custom' })}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      formData.splitType === 'custom'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-white border-[#D9D1B9] text-[#737260]'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>

                {formData.splitType === 'custom' && (
                  <div className="mt-2 p-3 bg-white rounded-2xl border border-[#D9D1B9] flex items-center gap-3 text-xs">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-[#8C8B79] uppercase">
                        % {p1.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.splitRatioP1}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setFormData({
                            ...formData,
                            splitRatioP1: val,
                            splitRatioP2: 100 - val,
                          });
                        }}
                        className="w-full p-1.5 border rounded-lg font-bold text-[#434338]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-[#8C8B79] uppercase">
                        % {p2.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.splitRatioP2}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setFormData({
                            ...formData,
                            splitRatioP2: val,
                            splitRatioP1: 100 - val,
                          });
                        }}
                        className="w-full p-1.5 border rounded-lg font-bold text-[#434338]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#434338] mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData({ ...formData, status: e.target.value as ExpenseStatus })
                    }
                    className="w-full text-xs font-bold p-3 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
                  >
                    <option value="pagado">Pagado</option>
                    <option value="reservado">Reservado</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#434338] mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs p-3 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#434338] mb-1">
                  Notas o Comentarios (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Incluye propina, pagado con tarjeta Santander"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs p-3 rounded-2xl border border-[#D9D1B9] bg-white text-[#434338]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EFEDE7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#737260] hover:bg-[#E9E5D9] rounded-2xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#434338] rounded-2xl shadow-md shadow-[#5A5A40]/20 cursor-pointer"
                >
                  {editingExpense ? 'Guardar Cambios' : 'Anotar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
