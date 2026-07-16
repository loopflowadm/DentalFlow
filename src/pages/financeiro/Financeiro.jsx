import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  DollarSign, Plus, ArrowUpRight, ArrowDownRight, CreditCard, 
  Award, FileText, Check, Calendar, User, Trash2, X 
} from 'lucide-react';

export default function Financeiro() {
  const { 
    financeTransactions, 
    addTransaction, 
    suppliers,
    accountsPayable,
    addSupplier,
    addAccountsPayable,
    approveAccountsPayable,
    payAccountsPayable,
    payInstallment,
    installments: ctxInstallments
  } = useClinic();
  const { currentTheme } = useTheme();
  const { user } = useAuth();

  // Estados locais
  const [activeSubTab, setActiveSubTab] = useState('fluxo'); // 'fluxo' | 'comissoes' | 'parcelas'
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddPayable, setShowAddPayable] = useState(false);
  
  // Form Nova Transação
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('INCOME'); // 'INCOME' | 'EXPENSE'
  const [category, setCategory] = useState('TREATMENT');

  // Estado da comissão do dentista
  const [selectedDentist, setSelectedDentist] = useState('Dr. Pedro Ramos');

  // Form Novo Fornecedor
  const [supName, setSupName] = useState('');
  const [supCnpj, setSupCnpj] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');

  // Form Novo Contas a Pagar
  const [apDesc, setApDesc] = useState('');
  const [apAmount, setApAmount] = useState('');
  const [apDueDate, setApDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [apCategory, setApCategory] = useState('SUPPLIES');
  const [apSupplierId, setApSupplierId] = useState('');

  const handleAddSupplierSubmit = (e) => {
    e.preventDefault();
    if (!supName) return;
    addSupplier({
      name: supName,
      cnpj: supCnpj,
      phone: supPhone,
      email: supEmail
    });
    setSupName('');
    setSupCnpj('');
    setSupPhone('');
    setSupEmail('');
    setShowAddSupplier(false);
  };

  const handleAddPayableSubmit = (e) => {
    e.preventDefault();
    if (!apDesc || !apAmount || !apDueDate) return;
    addAccountsPayable({
      description: apDesc,
      amount: parseFloat(apAmount),
      due_date: apDueDate,
      category: apCategory,
      supplier_id: apSupplierId || null
    });
    setApDesc('');
    setApAmount('');
    setApSupplierId('');
    setShowAddPayable(false);
  };

  // Mapear parcelas do contexto para tabela compatível
  const installments = ctxInstallments.map(inst => ({
    id: inst.id,
    patient: inst.patientName || 'Paciente',
    desc: inst.description || 'Tratamento',
    number: `${inst.installment_number || 1}ª Parcela`,
    amount: inst.amount,
    dueDate: inst.due_date,
    status: inst.status
  }));

  // Lista comissões de teste
  const commissionLogs = [
    { dentist: 'Dr. Pedro Ramos', patient: 'João Silva', procedure: 'Canal', total: 800, percent: 40, commission: 320, status: 'UNPAID', date: '2026-07-02' },
    { dentist: 'Dra. Ana Paula', patient: 'Maria Oliveira', procedure: 'Clareamento', total: 900, percent: 40, commission: 360, status: 'PAID', date: '2026-06-28' },
    { dentist: 'Dr. Pedro Ramos', patient: 'Fernanda Rocha', procedure: 'Limpeza', total: 150, percent: 35, commission: 52.5, status: 'UNPAID', date: '2026-07-01' }
  ];

  const handleAddTransactionSubmit = (e) => {
    e.preventDefault();
    if (!desc || !amount) return;

    addTransaction({
      description: desc,
      amount: parseFloat(amount),
      type,
      category
    });

    setDesc('');
    setAmount('');
    setShowAddTransaction(false);
  };

  const handlePayInstallment = (id) => {
    payInstallment(id);
  };

  const handlePayCommission = (dentistName, amountVal, patientName) => {
    // Lançar despesa no fluxo
    addTransaction({
      description: `Comissão paga a ${dentistName} - Paciente: ${patientName}`,
      amount: parseFloat(amountVal),
      type: 'EXPENSE',
      category: 'SALARY'
    });
    alert(`Comissão de R$ ${amountVal} para ${dentistName} paga com sucesso!`);
  };

  // Cálculos fluxo de caixa
  const totalIncome = financeTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = financeTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-violet-500" />
          <h2 className="text-sm font-bold font-title">Gestão Financeira & Comissões</h2>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex border border-slate-200/30 dark:border-slate-700/30">
          {[
            { id: 'fluxo', label: 'Fluxo de Caixa' },
            { id: 'pagar', label: 'Contas a Pagar' },
            { id: 'comissoes', label: 'Comissões Dentistas' },
            { id: 'parcelas', label: 'Parcelamentos Recorrentes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-ABA: FLUXO DE CAIXA */}
      {activeSubTab === 'fluxo' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex justify-between items-center text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receitas Totais</span>
                <span className="text-xl font-extrabold font-title text-emerald-500 block mt-1.5">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex justify-between items-center text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Despesas / Comissões</span>
                <span className="text-xl font-extrabold font-title text-red-500 block mt-1.5">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex justify-between items-center text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Líquido</span>
                <span className={`text-xl font-extrabold font-title block mt-1.5 ${netBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Seção Operações e Lançamentos */}
          <div className="flex justify-between items-center flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Histórico de Lançamentos</h3>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="px-3 py-1.5 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98]"
              style={{ backgroundColor: currentTheme.secondary_color }}
            >
              Novo Lançamento
            </button>
          </div>

          <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 border-b border-slate-200/40 dark:border-slate-800">
                  <th className="py-3 px-4 font-bold">Descrição</th>
                  <th className="py-3 px-4 font-bold">Valor</th>
                  <th className="py-3 px-4 font-bold">Categoria</th>
                  <th className="py-3 px-4 font-bold">Tipo</th>
                  <th className="py-3 px-4 font-bold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                {financeTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-850 dark:text-white">{t.description}</td>
                    <td className={`py-3 px-4 font-extrabold ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 font-semibold uppercase">{t.category}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA: COMISSÕES DENTISTAS */}
      {activeSubTab === 'comissoes' && (
        <div className="space-y-6 text-left">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase">Filtrar Dentista:</span>
            <select
              value={selectedDentist}
              onChange={(e) => setSelectedDentist(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl py-2 px-3 text-xs text-slate-600 focus:outline-none cursor-pointer font-bold"
            >
              <option value="Dr. Pedro Ramos">Dr. Pedro Ramos</option>
              <option value="Dra. Ana Paula">Dra. Ana Paula</option>
            </select>
          </div>

          <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 border-b border-slate-200/40 dark:border-slate-800">
                  <th className="py-3 px-4 font-bold">Data</th>
                  <th className="py-3 px-4 font-bold">Paciente</th>
                  <th className="py-3 px-4 font-bold">Procedimento</th>
                  <th className="py-3 px-4 font-bold">Valor Total</th>
                  <th className="py-3 px-4 font-bold">Percentual</th>
                  <th className="py-3 px-4 font-bold">Comissão Devida</th>
                  <th className="py-3 px-4 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                {commissionLogs.filter(log => log.dentist === selectedDentist).map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium">{log.date}</td>
                    <td className="py-3 px-4 font-bold">{log.patient}</td>
                    <td className="py-3 px-4 font-semibold">{log.procedure}</td>
                    <td className="py-3 px-4 font-bold">R$ {log.total}</td>
                    <td className="py-3 px-4 font-bold">{log.percent}%</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-500">R$ {log.commission}</td>
                    <td className="py-3 px-4">
                      {log.status === 'UNPAID' ? (
                        <button
                          onClick={() => handlePayCommission(log.dentist, log.commission, log.patient)}
                          className="px-2.5 py-1 bg-emerald-500 text-white font-bold rounded-lg text-[9px] hover:opacity-90 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Pagar Dentista
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Pago</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA: PARCELAMENTOS */}
      {activeSubTab === 'parcelas' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 border-b border-slate-200/40 dark:border-slate-800">
                  <th className="py-3 px-4 font-bold">Paciente</th>
                  <th className="py-3 px-4 font-bold">Tratamento</th>
                  <th className="py-3 px-4 font-bold">Nº Parcela</th>
                  <th className="py-3 px-4 font-bold">Valor</th>
                  <th className="py-3 px-4 font-bold">Vencimento</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                {installments.map(inst => (
                  <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-850 dark:text-white">{inst.patient}</td>
                    <td className="py-3 px-4 font-semibold">{inst.desc}</td>
                    <td className="py-3 px-4 font-bold text-slate-450">{inst.number}</td>
                    <td className="py-3 px-4 font-extrabold">R$ {inst.amount}</td>
                    <td className="py-3 px-4 font-medium">{inst.dueDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        inst.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {inst.status === 'PAID' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {inst.status === 'PENDING' ? (
                        <button
                          onClick={() => handlePayInstallment(inst.id, inst.amount, inst.patient, inst.desc)}
                          className="px-2.5 py-1 bg-violet-600 text-white font-bold rounded-lg text-[9px] hover:opacity-90 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Baixar Parcela
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Confirmada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NOVO LANÇAMENTO */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title">Adicionar Transação Manual</h3>
              <button 
                onClick={() => setShowAddTransaction(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTransactionSubmit} className="space-y-4 text-slate-800 dark:text-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Compra de luvas e agulhas"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="350"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                  >
                    <option value="INCOME">Receita (Entrada)</option>
                    <option value="EXPENSE">Despesa (Saída)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                >
                  <option value="TREATMENT">Tratamento</option>
                  <option value="SALARY">Salários e Comissões</option>
                  <option value="RENT">Aluguel e Infra</option>
                  <option value="SUPPLIES">Insumos e Produtos</option>
                  <option value="OTHER">Outros</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl shadow text-xs mt-2"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Salvar Transação
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-ABA: CONTAS A PAGAR */}
      {activeSubTab === 'pagar' && (() => {
        const isAuthorized = user?.role === 'CLINIC_ADMIN' || user?.role === 'SUPER_ADMIN';
        return (
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Obrigações Financeiras</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddSupplier(true)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98]"
                >
                  Novo Fornecedor
                </button>
                <button
                  onClick={() => setShowAddPayable(true)}
                  className="px-3 py-1.5 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98]"
                  style={{ backgroundColor: currentTheme.secondary_color }}
                >
                  Nova Despesa
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 border-b border-slate-200/40 dark:border-slate-800">
                    <th className="py-3 px-4 font-bold">Descrição</th>
                    <th className="py-3 px-4 font-bold">Fornecedor</th>
                    <th className="py-3 px-4 font-bold">Valor</th>
                    <th className="py-3 px-4 font-bold">Vencimento</th>
                    <th className="py-3 px-4 font-bold">Categoria</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                  {accountsPayable.map(ap => {
                    const supplier = suppliers.find(s => s.id === ap.supplier_id);
                    return (
                      <tr key={ap.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-850 dark:text-white">{ap.description}</td>
                        <td className="py-3 px-4 font-semibold text-slate-500">{supplier ? supplier.name : 'Nenhum'}</td>
                        <td className="py-3 px-4 font-extrabold text-red-500">R$ {ap.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 font-medium">{ap.due_date}</td>
                        <td className="py-3 px-4 font-semibold uppercase">{ap.category}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            ap.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                            ap.status === 'AWAITING_APPROVAL' ? 'bg-amber-500/10 text-amber-500' :
                            ap.status === 'OVERDUE' ? 'bg-red-500/10 text-red-550' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {ap.status === 'PAID' ? 'Pago' :
                             ap.status === 'AWAITING_APPROVAL' ? 'Aprov. Pendente' :
                             ap.status === 'OVERDUE' ? 'Atrasado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {ap.status === 'AWAITING_APPROVAL' ? (
                            isAuthorized ? (
                              <button
                                onClick={() => approveAccountsPayable(ap.id)}
                                className="px-2.5 py-1 bg-amber-500 text-white font-bold rounded-lg text-[9px] hover:opacity-90 flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Aprovar despesa
                              </button>
                            ) : (
                              <span className="text-[10px] text-amber-500 font-bold uppercase">Precisa aprovação</span>
                            )
                          ) : ap.status === 'PENDING' || ap.status === 'OVERDUE' ? (
                            <button
                              onClick={() => payAccountsPayable(ap.id)}
                              className="px-2.5 py-1 bg-emerald-500 text-white font-bold rounded-lg text-[9px] hover:opacity-90 flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Marcar como Pago
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Liquidado</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {accountsPayable.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                        Nenhuma conta a pagar cadastrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* MODAL: NOVO FORNECEDOR */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title text-left">Cadastrar Fornecedor</h3>
              <button 
                onClick={() => setShowAddSupplier(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="space-y-4 text-slate-850 dark:text-slate-200 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Dental Cremer"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CNPJ</label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={supCnpj}
                  onChange={(e) => setSupCnpj(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Telefone</label>
                <input
                  type="text"
                  placeholder="0800 727 7527"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="comercial@dental.com"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl shadow text-xs mt-2"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Salvar Fornecedor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CONTAS A PAGAR */}
      {showAddPayable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title text-left">Cadastrar Nova Despesa</h3>
              <button 
                onClick={() => setShowAddPayable(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPayableSubmit} className="space-y-4 text-slate-850 dark:text-slate-200 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Compra de Envelopes de Autoclave"
                  value={apDesc}
                  onChange={(e) => setApDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="350"
                    value={apAmount}
                    onChange={(e) => setApAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vencimento</label>
                  <input
                    type="date"
                    required
                    value={apDueDate}
                    onChange={(e) => setApDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fornecedor</label>
                <select
                  value={apSupplierId}
                  onChange={(e) => setApSupplierId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                >
                  <option value="">Nenhum Fornecedor</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Categoria</label>
                <select
                  value={apCategory}
                  onChange={(e) => setApCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                >
                  <option value="SUPPLIES">Insumos e Produtos</option>
                  <option value="RENT">Aluguel e Infra</option>
                  <option value="SALARY">Salários e Comissões</option>
                  <option value="OTHER">Outros Custos</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl shadow text-xs mt-2"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Salvar Conta a Pagar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
