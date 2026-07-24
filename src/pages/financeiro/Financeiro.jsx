import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  DollarSign, Plus, ArrowUpRight, ArrowDownRight, CreditCard, 
  Award, FileText, Check, Calendar, User, Trash2, X,
  Download, Printer, Filter, ShieldCheck, Clock
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
  const [activeSubTab, setActiveSubTab] = useState('fluxo'); // 'fluxo' | 'pagar' | 'comissoes' | 'parcelas'
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddPayable, setShowAddPayable] = useState(false);
  
  // Form Nova Transação
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('INCOME'); // 'INCOME' | 'EXPENSE'
  const [category, setCategory] = useState('TREATMENT');

  // Estado da comissão do dentista
  const [selectedDentist, setSelectedDentist] = useState(() => user?.full_name || '');
  
  // Regra de Liberação de Comissão: 'CAIXA' (Após quitação do paciente) | 'FATURAMENTO' (Conclusão do atendimento)
  const [commissionReleaseRule, setCommissionReleaseRule] = useState('CAIXA');

  // Mapeamento enriquecido de comissões com deduções de custos (Protético/Laboratório, Taxas de Cartão)
  const [commissionLogs, setCommissionLogs] = useState([]);

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

  // Função auxiliar de exportação para CSV
  const exportToCSV = (filename, headers, dataRows) => {
    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintTable = () => {
    window.print();
  };

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

  const handlePayCommission = (logId, dentistName, amountVal, patientName) => {
    setCommissionLogs(prev => prev.map(item => item.id === logId ? { ...item, status: 'PAID' } : item));
    addTransaction({
      description: `Comissão paga a ${dentistName} - Paciente: ${patientName}`,
      amount: parseFloat(amountVal),
      type: 'EXPENSE',
      category: 'SALARY'
    });
    alert(`Comissão de R$ ${amountVal.toFixed(2)} para ${dentistName} paga com sucesso!`);
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-[#0D0D0D] backdrop-blur border border-slate-200/40 dark:border-white/10 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-violet-500" />
          <h2 className="text-sm font-bold font-title">Gestão Financeira & Comissões</h2>
        </div>

        <div className="flex bg-slate-100 dark:bg-black p-1 rounded-xl flex border border-slate-200/30 dark:border-white/10">
          {[
            { id: 'fluxo', label: 'Fluxo de Caixa' },
            { id: 'pagar', label: 'Contas a Pagar' },
            { id: 'comissoes', label: 'Comissões Dentistas' },
            { id: 'parcelas', label: 'Parcelamentos Recorrentes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                activeSubTab === tab.id 
                  ? 'bg-white dark:bg-[#18181B] text-slate-800 dark:text-white shadow-sm' 
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
            <div className="bg-white dark:bg-[#0D0D0D] p-5 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex justify-between items-center text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receitas Totais</span>
                <span className="text-xl font-extrabold font-title text-emerald-500 block mt-1.5">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#0D0D0D] p-5 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex justify-between items-center text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Despesas / Comissões</span>
                <span className="text-xl font-extrabold font-title text-red-500 block mt-1.5">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#0D0D0D] p-5 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex justify-between items-center text-left">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(
                  `fluxo-de-caixa-${new Date().toISOString().split('T')[0]}`,
                  ['Descrição', 'Valor (R$)', 'Categoria', 'Tipo', 'Data'],
                  financeTransactions.map(t => [t.description, t.amount, t.category, t.type === 'INCOME' ? 'Entrada' : 'Saída', t.date])
                )}
                className="px-3 py-1.5 bg-slate-100 dark:bg-[#0D0D0D] hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Exportar em Planilha Excel / CSV"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={handlePrintTable}
                className="px-3 py-1.5 bg-slate-100 dark:bg-[#0D0D0D] hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Imprimir ou Salvar em PDF"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
              </button>
              <button
                onClick={() => setShowAddTransaction(true)}
                className="px-3.5 py-1.5 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] cursor-pointer"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                + Novo Lançamento
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D0D0D] border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-black text-slate-500 border-b border-slate-200/40 dark:border-white/10">
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
          {/* BARRA DE CONFIGURAÇÕES & FILTROS DE REPASSE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-[#0D0D0D] p-4 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-400 uppercase">Filtrar Dentista:</span>
              <select
                value={selectedDentist}
                onChange={(e) => setSelectedDentist(e.target.value)}
                className="bg-slate-100 dark:bg-black border border-slate-200/50 dark:border-white/10 rounded-xl py-1.5 px-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-bold flex-1"
              >
                <option value="Dr. Pedro Ramos">Dr. Pedro Ramos (Ortodontia & Implantes)</option>
                <option value="Dra. Ana Paula">Dra. Ana Paula (Estética & Clareamento)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-400 uppercase">Regra de Liberação:</span>
              <select
                value={commissionReleaseRule}
                onChange={(e) => setCommissionReleaseRule(e.target.value)}
                className="bg-slate-100 dark:bg-black border border-slate-200/50 dark:border-white/10 rounded-xl py-1.5 px-3 text-xs text-emerald-600 dark:text-emerald-400 focus:outline-none cursor-pointer font-extrabold"
              >
                <option value="CAIXA">Caixa / Liquidação (Após quitação do paciente)</option>
                <option value="FATURAMENTO">Faturamento / Realizado (Conclusão da consulta)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500 font-medium">
              <span className="font-bold text-slate-700 dark:text-slate-300">Deduções automáticas aplicadas:</span> Taxa de Cartão/Maquininha (3.5%) + Custo de Protético/Laboratório.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(
                  `comissoes-${selectedDentist.replace(/\s+/g, '-')}`,
                  ['Data', 'Dentista', 'Paciente', 'Procedimento', 'Valor Bruto (R$)', 'Abatimentos (R$)', 'Valor Líquido (R$)', '% Dentista', 'Comissão (R$)', 'Status Repasse'],
                  commissionLogs.filter(log => log.dentist === selectedDentist).map(log => {
                    const cardFee = (log.grossAmount * (log.cardFeePercent || 0)) / 100;
                    const deductions = cardFee + (log.labCost || 0);
                    const netAmount = Math.max(0, log.grossAmount - deductions);
                    const commissionVal = (netAmount * log.percent) / 100;
                    return [log.date, log.dentist, log.patient, log.procedure, log.grossAmount, deductions.toFixed(2), netAmount.toFixed(2), `${log.percent}%`, commissionVal.toFixed(2), log.status === 'PAID' ? 'Pago' : 'Pendente'];
                  })
                )}
                className="px-3 py-1.5 bg-slate-100 dark:bg-[#0D0D0D] hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> CSV / Excel
              </button>
              <button
                onClick={handlePrintTable}
                className="px-3 py-1.5 bg-slate-100 dark:bg-[#0D0D0D] hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> PDF / Imprimir
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D0D0D] border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-black text-slate-500 border-b border-slate-200/40 dark:border-white/10">
                  <th className="py-3 px-4 font-bold">Data</th>
                  <th className="py-3 px-4 font-bold">Paciente & Procedimento</th>
                  <th className="py-3 px-4 font-bold">Valor Bruto</th>
                  <th className="py-3 px-4 font-bold">Abatimentos (Protético/Taxas)</th>
                  <th className="py-3 px-4 font-bold">Base Líquida</th>
                  <th className="py-3 px-4 font-bold">% Repasse</th>
                  <th className="py-3 px-4 font-bold">Comissão Final</th>
                  <th className="py-3 px-4 font-bold">Status & Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-350">
                {commissionLogs.filter(log => log.dentist === selectedDentist).map((log) => {
                  const cardFee = (log.grossAmount * (log.cardFeePercent || 0)) / 100;
                  const totalDeductions = cardFee + (log.labCost || 0);
                  const netAmount = Math.max(0, log.grossAmount - totalDeductions);
                  const commissionValue = (netAmount * log.percent) / 100;
                  const isEligibleForPayment = commissionReleaseRule === 'FATURAMENTO' || log.patientPaymentStatus === 'PAID';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <td className="py-3 px-4 font-medium">{log.date}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-850 dark:text-white">{log.patient}</div>
                        <div className="text-[11px] text-slate-400 font-semibold">{log.procedure}</div>
                      </td>
                      <td className="py-3 px-4 font-bold">R$ {log.grossAmount.toFixed(2).replace('.', ',')}</td>
                      <td className="py-3 px-4 text-red-500 font-medium">
                        <div>- R$ {totalDeductions.toFixed(2).replace('.', ',')}</div>
                        <div className="text-[9px] text-slate-400">
                          {log.labCost > 0 ? `(Protético: R$ ${log.labCost} + Cartão: ${log.cardFeePercent}%)` : `(Taxa Cartão: ${log.cardFeePercent}%)`}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        R$ {netAmount.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3 px-4 font-bold">{log.percent}%</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-500 text-sm">
                        R$ {commissionValue.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3 px-4">
                        {log.status === 'PAID' ? (
                          <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px] uppercase">
                            ✓ PAGO (LIQUIDADO)
                          </span>
                        ) : isEligibleForPayment ? (
                          <button
                            onClick={() => handlePayCommission(log.id, log.dentist, commissionValue, log.patient)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-[10px] shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Pagar Dentista
                          </button>
                        ) : (
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-[9px] uppercase block">
                              Aguardando Quitação
                            </span>
                            <span className="text-[9px] text-slate-400 block">Paciente não pagou</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA: PARCELAMENTOS */}
      {activeSubTab === 'parcelas' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Carnês e Parcelas de Pacientes</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(
                  `parcelas-pacientes-${new Date().toISOString().split('T')[0]}`,
                  ['Paciente', 'Tratamento', 'Nº Parcela', 'Valor (R$)', 'Vencimento', 'Status'],
                  installments.map(inst => [inst.patient, inst.desc, inst.number, inst.amount, inst.dueDate, inst.status === 'PAID' ? 'Pago' : 'Pendente'])
                )}
                className="px-3 py-1.5 bg-slate-100 dark:bg-[#0D0D0D] hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> CSV / Excel
              </button>
              <button
                onClick={handlePrintTable}
                className="px-3 py-1.5 bg-slate-100 dark:bg-[#0D0D0D] hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> PDF / Imprimir
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D0D0D] border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-black text-slate-500 border-b border-slate-200/40 dark:border-white/10">
                  <th className="py-3 px-4 font-bold">Paciente</th>
                  <th className="py-3 px-4 font-bold">Tratamento</th>
                  <th className="py-3 px-4 font-bold">Nº Parcela</th>
                  <th className="py-3 px-4 font-bold">Valor</th>
                  <th className="py-3 px-4 font-bold">Vencimento</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-350">
                {installments.map(inst => (
                  <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
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
                          className="px-2.5 py-1 bg-violet-600 text-white font-bold rounded-lg text-[9px] hover:opacity-90 flex items-center gap-1 cursor-pointer"
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
          <div className="bg-white dark:bg-[#0D0D0D] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title">Adicionar Transação Manual</h3>
              <button 
                onClick={() => setShowAddTransaction(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
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
                  className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none"
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
                    className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
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
                  className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none"
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
                  className="px-3 py-1.5 bg-slate-100 dark:bg-[#0D0D0D] text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-white/10 font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98]"
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

            <div className="bg-white dark:bg-[#0D0D0D] border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-black text-slate-500 border-b border-slate-200/40 dark:border-white/10">
                    <th className="py-3 px-4 font-bold">Descrição</th>
                    <th className="py-3 px-4 font-bold">Fornecedor</th>
                    <th className="py-3 px-4 font-bold">Valor</th>
                    <th className="py-3 px-4 font-bold">Vencimento</th>
                    <th className="py-3 px-4 font-bold">Categoria</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-350">
                  {accountsPayable.map(ap => {
                    const supplier = suppliers.find(s => s.id === ap.supplier_id);
                    return (
                      <tr key={ap.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
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
          <div className="bg-white dark:bg-[#0D0D0D] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title text-left">Cadastrar Fornecedor</h3>
              <button 
                onClick={() => setShowAddSupplier(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
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
                  className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CNPJ</label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={supCnpj}
                  onChange={(e) => setSupCnpj(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Telefone</label>
                <input
                  type="text"
                  placeholder="0800 727 7527"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="comercial@dental.com"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none"
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
          <div className="bg-white dark:bg-[#0D0D0D] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title text-left">Cadastrar Nova Despesa</h3>
              <button 
                onClick={() => setShowAddPayable(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
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
                  className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none"
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
                    className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vencimento</label>
                  <input
                    type="date"
                    required
                    value={apDueDate}
                    onChange={(e) => setApDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fornecedor</label>
                <select
                  value={apSupplierId}
                  onChange={(e) => setApSupplierId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
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
                  className="w-full bg-slate-50 dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
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
