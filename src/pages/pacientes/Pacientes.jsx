import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, User, Phone, Mail, FileText, Calendar, 
  DollarSign, Activity, Image, MessageSquare, ShieldAlert, 
  Trash2, X, PlusCircle, CheckCircle, Clock 
} from 'lucide-react';

export default function Pacientes({ selectedPatient: propSelectedPatient, setSelectedPatient: propSetSelectedPatient }) {
  const { 
    patients, 
    addPatient, 
    updatePatient, 
    appointments, 
    procedures, 
    financeTransactions, 
    addTransaction, 
    checkPatientInadimplente,
    medicalRecords,
    prescriptions,
    addMedicalRecord,
    addPrescription,
    generateAiEvolution,
    sendPrescriptionWhatsapp,
    toothRecords,
    updateToothRecord
  } = useClinic();
  const { currentTheme } = useTheme();
  const { user, clinic } = useAuth();

  // Estados locais
  const [search, setSearch] = useState('');
  const [localSelectedPatient, localSetSelectedPatient] = useState(null);
  const selectedPatient = propSelectedPatient !== undefined ? propSelectedPatient : localSelectedPatient;
  const setSelectedPatient = propSetSelectedPatient !== undefined ? propSetSelectedPatient : localSetSelectedPatient;

  // Auto-selecionar o primeiro paciente se nenhum estiver selecionado
  useEffect(() => {
    if (!selectedPatient && patients.length > 0) {
      setSelectedPatient(patients[0]);
    }
  }, [patients, selectedPatient, setSelectedPatient]);
  const [activeSubTab, setActiveSubTab] = useState('ficha'); // 'ficha' | 'odontograma' | 'tratamentos' | 'documentos' | 'financeiro' | 'consultas'
  
  // Modais de Criação
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pNotes, setPNotes] = useState('');

  // Estados do Odontograma FDI
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [showToothModal, setShowToothModal] = useState(false);
  const [toothProcedure, setToothProcedure] = useState('');
  const [toothStatus, setToothStatus] = useState('NEED_TREATMENT'); // 'NEED_TREATMENT' | 'TREATED' | 'IMPLANT' | 'MISSING'

  // Estados do Pincel Rápido (Modo Pincel)
  const [isPaintMode, setIsPaintMode] = useState(false);
  const [paintProcedure, setPaintProcedure] = useState('');
  const [paintStatus, setPaintStatus] = useState('NEED_TREATMENT');

  // Estados do Módulo Clínico (Evolução & Sofia IA)
  const [newRecordText, setNewRecordText] = useState('');
  const [isGeneratingAiRecord, setIsGeneratingAiRecord] = useState(false);
  const [adendoTargetId, setAdendoTargetId] = useState(null);
  const [adendoText, setAdendoText] = useState('');

  // Estados de Prescrição Digital
  const [showAddPresc, setShowAddPresc] = useState(false);
  const [prescTitle, setPrescTitle] = useState('');
  const [prescText, setPrescText] = useState('');
  const [selectedPrescTemplate, setSelectedPrescTemplate] = useState('');
  const [sendViaWa, setSendViaWa] = useState(true);
  const [viewingPrescription, setViewingPrescription] = useState(null);

  // Estados de Ficha de Anamnese Estruturada
  const [showEditAnamnese, setShowEditAnamnese] = useState(false);
  const [hasHeartDisease, setHasHeartDisease] = useState(false);
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHypertension, setHasHypertension] = useState(false);
  const [hasAllergies, setHasAllergies] = useState(false);
  const [allergyDetails, setAllergyDetails] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);
  const [hasBleedingDisorder, setHasBleedingDisorder] = useState(false);
  const [usesMedication, setUsesMedication] = useState(false);
  const [medicationDetails, setMedicationDetails] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');

  const handleTemplateChange = (templateId) => {
    setSelectedPrescTemplate(templateId);
    if (templateId === 'analgesico') {
      setPrescTitle('Receita Analgésica Padrão');
      setPrescText(`Uso Oral:\n1. Dipirona Sódica 500mg ------------------ Tomar 1 comprimido de 6 em 6 horas em caso de dor.\n2. Ibuprofeno 600mg ---------------------- Tomar 1 comprimido de 12 em 12 horas por 3 dias.`);
    } else if (templateId === 'antibiotico') {
      setPrescTitle('Receita Antibiótica Padrão');
      setPrescText(`Uso Oral:\n1. Amoxicilina 500mg ------------------ Tomar 1 comprimido de 8 em 8 horas por 7 dias.`);
    } else if (templateId === 'comparecimento') {
      setPrescTitle('Atestado de Comparecimento');
      const todayFormatted = new Date().toLocaleDateString('pt-BR');
      setPrescText(`Atesto para os devidos fins que o(a) paciente ${selectedPatient?.name || 'paciente'} esteve sob consulta odontológica na data de hoje (${todayFormatted}) das 09:00 às 10:00.`);
    } else if (templateId === 'afastamento') {
      setPrescTitle('Atestado de Afastamento');
      setPrescText(`Atesto para os devidos fins que o(a) paciente ${selectedPatient?.name || 'paciente'} necessita de 1 (um) dia de afastamento de suas atividades laborais por motivos de tratamento odontológico na data de hoje.`);
    } else {
      setPrescTitle('');
      setPrescText('');
    }
  };

  const handleAddPrescSubmit = async (e) => {
    e.preventDefault();
    if (!prescTitle || !prescText) return;
    
    const newPresc = await addPrescription({
      patient_id: selectedPatient.id,
      title: prescTitle,
      description: prescText
    });

    if (sendViaWa) {
      await sendPrescriptionWhatsapp(newPresc.id);
    }

    setShowAddPresc(false);
    setPrescTitle('');
    setPrescText('');
    setSelectedPrescTemplate('');
  };

  const handleAddRecordSubmit = async (e) => {
    e.preventDefault();
    if (!newRecordText) return;
    await addMedicalRecord({
      patient_id: selectedPatient.id,
      description: newRecordText,
      is_adendo: false
    });
    setNewRecordText('');
  };

  const handleAddAdendoSubmit = async (recordId) => {
    if (!adendoText) return;
    await addMedicalRecord({
      patient_id: selectedPatient.id,
      description: `[ADENDO DE RETIFICAÇÃO]: ${adendoText}`,
      is_adendo: true,
      parent_record_id: recordId
    });
    setAdendoText('');
    setAdendoTargetId(null);
  };

  const handleOpenEditAnamnese = () => {
    if (!selectedPatient) return;
    const history = parseHistory(selectedPatient.medical_history);
    const anamnese = history.anamnese || {};
    setHasHeartDisease(!!anamnese.has_heart_disease);
    setHasDiabetes(!!anamnese.has_diabetes);
    setHasHypertension(!!anamnese.has_hypertension);
    setHasAllergies(!!anamnese.has_allergies);
    setAllergyDetails(anamnese.allergy_details || '');
    setIsPregnant(!!anamnese.is_pregnant);
    setHasBleedingDisorder(!!anamnese.has_bleeding_disorder);
    setUsesMedication(!!anamnese.uses_medication);
    setMedicationDetails(anamnese.medication_details || '');
    setGeneralNotes(history.notes || '');
    setShowEditAnamnese(true);
  };

  const handleSaveAnamneseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const history = parseHistory(selectedPatient.medical_history);
    const updatedHistory = {
      ...history,
      notes: generalNotes,
      anamnese: {
        has_heart_disease: hasHeartDisease,
        has_diabetes: hasDiabetes,
        has_hypertension: hasHypertension,
        has_allergies: hasAllergies,
        allergy_details: hasAllergies ? allergyDetails : '',
        is_pregnant: isPregnant,
        has_bleeding_disorder: hasBleedingDisorder,
        uses_medication: usesMedication,
        medication_details: usesMedication ? medicationDetails : ''
      }
    };

    const updatedPatient = {
      ...selectedPatient,
      medical_history: JSON.stringify(updatedHistory)
    };

    try {
      await updatePatient(updatedPatient);
      setSelectedPatient(updatedPatient);
      setShowEditAnamnese(false);
    } catch (err) {
      console.error('Erro ao salvar anamnese:', err);
      alert('Erro ao salvar ficha de anamnese.');
    }
  };

  const handleAiImproveRecord = async () => {
    if (!newRecordText) return;
    setIsGeneratingAiRecord(true);
    const enriched = await generateAiEvolution(newRecordText);
    setNewRecordText(enriched);
    setIsGeneratingAiRecord(false);
  };

  // Estados de Fotos
  const [patientPhotos, setPatientPhotos] = useState([
    { id: 1, title: 'Intraoral Inicial - Sorriso', date: '2026-06-01', url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
    { id: 2, title: 'Panorâmica Digital', date: '2026-06-01', url: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
  ]);

  // Odontograma FDI Teeth Arrays
  const upperTeethRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperTeethLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeethRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerTeethLeft = [31, 32, 33, 34, 35, 36, 37, 38];

  const parseHistory = (historyText) => {
    try {
      if (historyText && typeof historyText === 'object') {
        return {
          notes: '',
          odontogram: {},
          evolutions: [],
          exams: [],
          ...historyText
        };
      }
      if (historyText && typeof historyText === 'string' && historyText.startsWith('{')) {
        return JSON.parse(historyText);
      }
    } catch (e) {
      console.warn('Erro ao parsear historico do paciente:', e);
    }
    return { notes: typeof historyText === 'string' ? historyText : '', odontogram: {}, evolutions: [], exams: [] };
  };

  const handleAddPatientSubmit = (e) => {
    e.preventDefault();
    if (!pName || !pPhone) return;

    const fresh = addPatient({
      name: pName,
      phone: pPhone,
      email: pEmail,
      medical_history: JSON.stringify({
        notes: pNotes,
        odontogram: {},
        evolutions: [{ date: new Date().toISOString().split('T')[0], text: 'Paciente cadastrado no sistema.', dentist: user?.full_name || 'Admin' }],
        exams: []
      })
    });

    setPName('');
    setPPhone('');
    setPEmail('');
    setPNotes('');
    setShowAddPatient(false);
    setSelectedPatient(fresh);
  };

  const handleToothClick = async (toothNumber) => {
    if (isPaintMode) {
      // Aplicar pincel rápido diretamente no estado de toothRecords
      await updateToothRecord({
        patient_id: selectedPatient.id,
        tooth_number: toothNumber,
        procedure_name: paintProcedure,
        status: paintStatus
      });

      // Adicionar log seguro no prontuário oficial (medical_records)
      await addMedicalRecord({
        patient_id: selectedPatient.id,
        description: `[Pincel Rápido] Dente ${toothNumber} atualizado para: ${paintProcedure || 'Sem procedimento'} (${
          paintStatus === 'NEED_TREATMENT' ? 'Necessita de Tratamento' :
          paintStatus === 'TREATED' ? 'Tratado' :
          paintStatus === 'IMPLANT' ? 'Implante' : 'Extraído/Ausente'
        })`,
        is_adendo: false
      });

      // Lançar transação financeira simulada se marcar como Tratado
      if (paintStatus === 'TREATED' && paintProcedure) {
        const budgetPrice = procedures.find(p => p.name === paintProcedure)?.price || 300;
        addTransaction({
          description: `[Pincel Rápido] ${paintProcedure} - Dente ${toothNumber} (${selectedPatient.name})`,
          amount: budgetPrice,
          type: 'INCOME',
          category: 'TREATMENT'
        });
      }
    } else {
      // Modo clássico (abre modal)
      setSelectedTooth(toothNumber);
      
      const existing = toothRecords.find(r => r.patient_id === selectedPatient.id && r.tooth_number === toothNumber);
      if (existing) {
        setToothProcedure(existing.procedure_name || '');
        setToothStatus(existing.status || 'NEED_TREATMENT');
      } else {
        setToothProcedure('');
        setToothStatus('NEED_TREATMENT');
      }
      
      setShowToothModal(true);
    }
  };

  const handleSaveToothConfig = async () => {
    // Atualizar registro do dente
    await updateToothRecord({
      patient_id: selectedPatient.id,
      tooth_number: selectedTooth,
      procedure_name: toothProcedure,
      status: toothStatus
    });

    // Adicionar log no prontuário oficial
    await addMedicalRecord({
      patient_id: selectedPatient.id,
      description: `Dente ${selectedTooth} atualizado: ${toothProcedure || 'Removido procedimento'} (${
        toothStatus === 'NEED_TREATMENT' ? 'Necessita de Tratamento' :
        toothStatus === 'TREATED' ? 'Tratado' :
        toothStatus === 'IMPLANT' ? 'Implante' : 'Extraído/Ausente'
      })`,
      is_adendo: false
    });

    setShowToothModal(false);

    // Se criou orçamento, lançar transação financeira simulada
    if (toothStatus === 'TREATED' && toothProcedure) {
      const budgetPrice = procedures.find(p => p.name === toothProcedure)?.price || 300;
      addTransaction({
        description: `${toothProcedure} - Dente ${selectedTooth} (${selectedPatient.name})`,
        amount: budgetPrice,
        type: 'INCOME',
        category: 'TREATMENT'
      });
    }
  };

  const getToothColor = (toothNumber) => {
    const data = toothRecords.find(r => r.patient_id === selectedPatient.id && r.tooth_number === toothNumber);
    if (!data) return 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-350 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300';
    
    switch (data.status) {
      case 'NEED_TREATMENT':
        return 'bg-red-500 text-white hover:bg-red-650';
      case 'TREATED':
        return 'bg-emerald-500 text-white hover:bg-emerald-650';
      case 'IMPLANT':
        return 'bg-blue-500 text-white hover:bg-blue-650';
      case 'MISSING':
        return 'bg-slate-450 text-white hover:bg-slate-500';
      default:
        return 'bg-slate-200 dark:bg-slate-850 text-slate-650';
    }
  };

  // Filtrar Pacientes
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search) || 
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-850 rounded-[28px] border border-slate-200/40 dark:border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.01)] overflow-hidden">
      {selectedPatient ? (
        <>
            {/* Header Prontuário */}
            <div className="p-5 border-b border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex-shrink-0 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-md font-black text-slate-800 dark:text-white font-title tracking-tight">{selectedPatient.name}</h3>
                  {checkPatientInadimplente(selectedPatient.id) && (
                    <span className="px-2 py-0.5 bg-red-500 text-white font-extrabold rounded-lg text-[9px] uppercase animate-pulse">
                      Inadimplente
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-450 mt-1 font-semibold">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selectedPatient.phone}</span>
                  {selectedPatient.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedPatient.email}</span>}
                </div>
              </div>

              {/* Sub-Abas do Prontuário */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/30 dark:border-slate-700/30">
                {[
                  { id: 'ficha', label: 'Ficha Clínica' },
                  { id: 'odontograma', label: 'Odontograma FDI' },
                  { id: 'tratamentos', label: 'Tratamentos' },
                  { id: 'receitas', label: 'Receitas & Atestados' },
                  { id: 'documentos', label: 'Arquivos & Fotos' },
                  { id: 'financeiro', label: 'Financeiro' },
                  { id: 'consultas', label: 'Consultas' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      activeSubTab === tab.id 
                        ? 'bg-white dark:bg-slate-700 text-slate-850 dark:text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conteúdo da Sub-Aba */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* SUB-ABA: FICHA CLÍNICA */}
              {activeSubTab === 'ficha' && (() => {
                const history = parseHistory(selectedPatient.medical_history);
                const anamnese = history.anamnese || {};
                const criticalConditions = [];

                // Validar dados estruturados
                if (anamnese.has_heart_disease) criticalConditions.push('Cardiopatia');
                if (anamnese.has_diabetes) criticalConditions.push('Diabetes');
                if (anamnese.has_hypertension) criticalConditions.push('Hipertensão');
                if (anamnese.has_allergies) criticalConditions.push(anamnese.allergy_details ? `Alergia: ${anamnese.allergy_details}` : 'Alergia');
                if (anamnese.is_pregnant) criticalConditions.push('Gestante');
                if (anamnese.has_bleeding_disorder) criticalConditions.push('Distúrbio Hemorrágico');
                if (anamnese.uses_medication) criticalConditions.push(anamnese.medication_details ? `Medicação: ${anamnese.medication_details}` : 'Uso de Medicação Contínua');

                // Fallback para texto livre anterior
                if (criticalConditions.length === 0 && history.notes) {
                  const notesLower = (history.notes || '').toLowerCase();
                  if (notesLower.includes('alergia') || notesLower.includes('penicilina')) {
                    criticalConditions.push('Alergias (ex: Penicilina)');
                  }
                  if (notesLower.includes('cardiopatia') || notesLower.includes('coração') || notesLower.includes('cardíaco')) {
                    criticalConditions.push('Cardiopatia');
                  }
                  if (notesLower.includes('hipertens') || notesLower.includes('pressão')) {
                    criticalConditions.push('Hipertensão');
                  }
                  if (notesLower.includes('diabet')) {
                    criticalConditions.push('Diabetes');
                  }
                }

                // Filtrar evoluções reais do context
                const allRecords = medicalRecords.filter(r => r.patient_id === selectedPatient.id);

                // Filtrar registros pai e adendos
                const parentRecords = allRecords.filter(r => !r.is_adendo);
                const adendos = allRecords.filter(r => r.is_adendo);

                return (
                  <div className="space-y-6 text-left">
                    {/* Alerta Anamnese Crítica */}
                    {criticalConditions.length > 0 && (
                      <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 rounded-2xl p-4 flex gap-3 text-xs animate-in fade-in">
                        <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h5 className="font-bold text-amber-500 uppercase tracking-wider text-[10px]">Alerta Médico Crítico (Anamnese)</h5>
                          <p className="font-semibold text-slate-700 dark:text-slate-350">
                            Atenção: O paciente apresenta a(s) seguinte(s) condição(ões): <span className="underline font-bold text-slate-800 dark:text-white">{criticalConditions.join(', ')}</span>.
                            Evitar vasoconstritores adstringentes e medicamentos contraindicados.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Lado Esquerdo: Observações Anamnese e Nova Evolução */}
                      <div className="lg:col-span-6 space-y-5">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                              <Activity className="w-4 h-4 text-secondary" /> Anamnese & Observações
                            </h4>
                            <button
                              type="button"
                              onClick={handleOpenEditAnamnese}
                              className="px-2.5 py-1 bg-secondary/10 hover:bg-secondary/20 text-secondary font-extrabold text-[9px] rounded-lg transition-all active:scale-95"
                            >
                              ⚙️ Editar Ficha
                            </button>
                          </div>
                          
                          {criticalConditions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {criticalConditions.map((cond, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black rounded-lg">
                                  ⚠️ {cond}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-2">
                            {history.notes || 'Nenhuma observação clínica adicional.'}
                          </p>
                        </div>

                        {/* Formulário: Nova Evolução com Sofia IA */}
                        <form onSubmit={handleAddRecordSubmit} className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                              <PlusCircle className="w-4 h-4 text-secondary" /> Lançar Evolução Clínica
                            </h4>
                            <button
                              type="button"
                              onClick={handleAiImproveRecord}
                              disabled={!newRecordText || isGeneratingAiRecord}
                              className="px-2.5 py-1 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white disabled:opacity-50 disabled:hover:bg-secondary/10 disabled:hover:text-secondary font-extrabold text-[10px] rounded-lg flex items-center gap-1 transition-all active:scale-[0.97]"
                            >
                              {isGeneratingAiRecord ? 'Processando...' : '✨ Sofia: Melhorar com IA'}
                            </button>
                          </div>

                          <textarea
                            rows={4}
                            required
                            placeholder="Descreva as anotações do atendimento de hoje (ex: canal dente 11, anestesia, prescrição dipirona)..."
                            value={newRecordText}
                            onChange={(e) => setNewRecordText(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 dark:text-slate-100 font-body"
                          />

                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                            <span className="flex items-center gap-1 text-emerald-500">
                              <CheckCircle className="w-3.5 h-3.5" /> Assinatura Digital Ativa (RN-001)
                            </span>
                            <button
                              type="submit"
                              className="px-3.5 py-2 bg-secondary text-white font-extrabold rounded-xl shadow transition-all active:scale-[0.98]"
                              style={{ backgroundColor: currentTheme.secondary_color }}
                            >
                              Salvar Evolução
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Lado Direito: Timeline de Evoluções e Adendos */}
                      <div className="lg:col-span-6 space-y-4">
                        <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-secondary" /> Prontuário Clínico (Histórico)
                        </h4>
                        
                        <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-5">
                          {parentRecords.map(rec => {
                            const recAdendos = adendos.filter(a => a.parent_record_id === rec.id);
                            return (
                              <div key={rec.id} className="relative group">
                                <span className="absolute -left-[21.5px] top-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white dark:border-slate-900" />
                                
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                                  <span>{rec.dentistName}</span>
                                  <span>{new Date(rec.created_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="bg-slate-50/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                                      {rec.description}
                                    </p>
                                    
                                    <div className="mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-700/40 flex justify-between items-center text-[9px] text-slate-400 font-bold">
                                      <span className="truncate max-w-[200px]" title={rec.signature_hash}>🔑 SIGN: {rec.signature_hash}</span>
                                      <button
                                        onClick={() => setAdendoTargetId(adendoTargetId === rec.id ? null : rec.id)}
                                        className="text-secondary hover:underline flex items-center gap-0.5"
                                      >
                                        Adicionar Retificação
                                      </button>
                                    </div>
                                  </div>

                                  {/* Sub-lista de Adendos (RN-002) */}
                                  {recAdendos.map(ade => (
                                    <div key={ade.id} className="ml-4 pl-3 border-l-2 border-amber-500 bg-amber-500/5 dark:bg-amber-500/5 p-2 rounded-lg text-slate-700 dark:text-slate-350">
                                      <div className="flex justify-between items-center text-[9px] text-amber-500 font-bold mb-1">
                                        <span>Adendo de {ade.dentistName}</span>
                                        <span>{new Date(ade.created_at).toLocaleDateString('pt-BR')}</span>
                                      </div>
                                      <p className="text-[11px] font-semibold">{ade.description}</p>
                                      <span className="block text-[8px] text-slate-400 font-mono mt-1">🔑 HASH: {ade.signature_hash}</span>
                                    </div>
                                  ))}

                                  {/* Input do Adendo */}
                                  {adendoTargetId === rec.id && (
                                    <div className="ml-4 space-y-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-750">
                                      <textarea
                                        rows={2}
                                        required
                                        placeholder="Digite o texto de retificação corretivo..."
                                        value={adendoText}
                                        onChange={(e) => setAdendoText(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-850 border border-slate-250 dark:border-slate-700 rounded-lg p-1.5 text-xs focus:outline-none"
                                      />
                                      <div className="flex justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => { setAdendoTargetId(null); setAdendoText(''); }}
                                          className="px-2 py-1 bg-slate-200 dark:bg-slate-700 font-bold text-[9px] rounded"
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleAddAdendoSubmit(rec.id)}
                                          className="px-2 py-1 bg-secondary text-white font-bold text-[9px] rounded"
                                        >
                                          Salvar Adendo
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SUB-ABA: ODONTOGRAMA FDI */}
              {activeSubTab === 'odontograma' && (() => {
                return (
                  <div className="flex flex-col items-center space-y-6">
                    
                    {/* Barra de Ferramentas: Seleção vs Pincel Rápido */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-center bg-slate-50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-150 dark:border-slate-800 gap-3">
                      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/30 dark:border-slate-700/30">
                        <button
                          type="button"
                          onClick={() => setIsPaintMode(false)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            !isPaintMode 
                              ? 'bg-white dark:bg-slate-700 text-slate-850 dark:text-white shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                          }`}
                        >
                          Modo Seleção (Modal)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPaintMode(true);
                            if (!paintProcedure && procedures.length > 0) {
                              setPaintProcedure(procedures[0].name);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            isPaintMode 
                              ? 'bg-white dark:bg-slate-700 text-slate-850 dark:text-white shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                          }`}
                        >
                          Modo Pincel Rápido (Pintar)
                        </button>
                      </div>

                      {/* Legenda de Status */}
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                        <div className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-red-500 rounded-lg" /> Necessita</div>
                        <div className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-emerald-500 rounded-lg" /> Tratado</div>
                        <div className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-blue-500 rounded-lg" /> Implante</div>
                        <div className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-slate-450 rounded-lg" /> Ausente</div>
                      </div>
                    </div>

                    {/* Configuração do Pincel (Exibido apenas em Modo Pincel) */}
                    {isPaintMode && (
                      <div className="w-full bg-secondary/5 p-3 rounded-2xl border border-secondary/20 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Procedimento:</span>
                          <select
                            value={paintProcedure}
                            onChange={(e) => setPaintProcedure(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-750 rounded-xl py-1.5 px-3 text-xs text-slate-650 focus:outline-none cursor-pointer font-bold"
                          >
                            {procedures.map(p => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Status a Aplicar:</span>
                          <select
                            value={paintStatus}
                            onChange={(e) => setPaintStatus(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-750 rounded-xl py-1.5 px-3 text-xs text-slate-650 focus:outline-none cursor-pointer font-bold"
                          >
                            <option value="NEED_TREATMENT">Necessita Tratamento</option>
                            <option value="TREATED">Tratado (Concluído)</option>
                            <option value="IMPLANT">Implante</option>
                            <option value="MISSING">Ausente (Extraído)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Odontograma Visual FDI (Arcada Superior e Inferior) */}
                    <div className="space-y-8 p-6 bg-slate-50 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-[28px] max-w-3xl w-full flex flex-col justify-center items-center">
                      
                      {/* ARCADA SUPERIOR */}
                      <div className="flex flex-col items-center space-y-3">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Arcada Superior</span>
                        <div className="flex gap-1.5 flex-wrap justify-center">
                          {/* Quadrante 1 (Direita Superior) */}
                          <div className="flex gap-1">
                            {upperTeethRight.map(t => (
                              <button
                                key={t}
                                onClick={() => handleToothClick(t)}
                                className={`w-9 h-11 rounded-lg text-xs font-extrabold flex flex-col items-center justify-between p-1 transition-all active:scale-90 ${getToothColor(t)}`}
                              >
                                <span>{t}</span>
                                <span className="text-[9px] opacity-75">🦷</span>
                              </button>
                            ))}
                          </div>
                          {/* Separador de quadrante central */}
                          <div className="w-px bg-slate-350 dark:bg-slate-700 h-10 self-center" />
                          {/* Quadrante 2 (Esquerda Superior) */}
                          <div className="flex gap-1">
                            {upperTeethLeft.map(t => (
                              <button
                                key={t}
                                onClick={() => handleToothClick(t)}
                                className={`w-9 h-11 rounded-lg text-xs font-extrabold flex flex-col items-center justify-between p-1 transition-all active:scale-90 ${getToothColor(t)}`}
                              >
                                <span>{t}</span>
                                <span className="text-[9px] opacity-75">🦷</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ARCADA INFERIOR */}
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex gap-1.5 flex-wrap justify-center">
                          {/* Quadrante 4 (Direita Inferior) */}
                          <div className="flex gap-1">
                            {lowerTeethRight.map(t => (
                              <button
                                key={t}
                                onClick={() => handleToothClick(t)}
                                className={`w-9 h-11 rounded-lg text-xs font-extrabold flex flex-col items-center justify-between p-1 transition-all active:scale-90 ${getToothColor(t)}`}
                              >
                                <span className="text-[9px] opacity-75">🦷</span>
                                <span>{t}</span>
                              </button>
                            ))}
                          </div>
                          {/* Separador de quadrante central */}
                          <div className="w-px bg-slate-350 dark:bg-slate-700 h-10 self-center" />
                          {/* Quadrante 3 (Esquerda Inferior) */}
                          <div className="flex gap-1">
                            {lowerTeethLeft.map(t => (
                              <button
                                key={t}
                                onClick={() => handleToothClick(t)}
                                className={`w-9 h-11 rounded-lg text-xs font-extrabold flex flex-col items-center justify-between p-1 transition-all active:scale-90 ${getToothColor(t)}`}
                              >
                                <span className="text-[9px] opacity-75">🦷</span>
                                <span>{t}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Arcada Inferior</span>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* SUB-ABA: TRATAMENTOS E ORÇAMENTOS */}
              {activeSubTab === 'tratamentos' && (() => {
                const odontogramProcedures = toothRecords.filter(r => r.patient_id === selectedPatient.id && r.procedure_name);
                
                return (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planos e Itens Lançados</h4>
                    <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 border-b border-slate-200/40 dark:border-slate-800">
                            <th className="py-3 px-4 font-bold">Dente</th>
                            <th className="py-3 px-4 font-bold">Procedimento</th>
                            <th className="py-3 px-4 font-bold">Status</th>
                            <th className="py-3 px-4 font-bold">Data</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                          {odontogramProcedures.map(rec => (
                            <tr key={rec.id || rec.tooth_number} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-4 font-bold">Dente {rec.tooth_number}</td>
                              <td className="py-3 px-4 font-semibold">{rec.procedure_name}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  rec.status === 'TREATED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  {rec.status === 'TREATED' ? 'Concluído' : 'Pendente'}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium">{rec.updated_at ? new Date(rec.updated_at).toLocaleDateString('pt-BR') : '-'}</td>
                            </tr>
                          ))}
                          {odontogramProcedures.length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                                Nenhum tratamento lançado. Adicione no Odontograma.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* SUB-ABA: RECEITAS & ATESTADOS */}
              {activeSubTab === 'receitas' && (() => {
                const patientPrescriptions = prescriptions.filter(p => p.patient_id === selectedPatient.id);
                return (
                  <div className="space-y-6 text-left animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-secondary" /> Prescrições & Documentos Emitidos
                      </h4>
                      <button
                        onClick={() => setShowAddPresc(true)}
                        className="px-3.5 py-2 bg-secondary text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-[0.98]"
                        style={{ backgroundColor: currentTheme.secondary_color }}
                      >
                        Nova Prescrição Digital
                      </button>
                    </div>

                    <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 border-b border-slate-200/40 dark:border-slate-800">
                            <th className="py-3 px-4 font-bold">Data</th>
                            <th className="py-3 px-4 font-bold">Documento</th>
                            <th className="py-3 px-4 font-bold">Dentista</th>
                            <th className="py-3 px-4 font-bold">Status Assinatura</th>
                            <th className="py-3 px-4 font-bold text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                          {patientPrescriptions.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-4 font-semibold">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                              <td className="py-3 px-4 font-bold text-slate-850 dark:text-white">{p.title}</td>
                              <td className="py-3 px-4 font-semibold">{p.dentistName}</td>
                              <td className="py-3 px-4 font-mono text-[9px] text-slate-400 select-all" title={p.signature_hash}>
                                🔒 SIGN: {p.signature_hash.substring(0, 12)}...
                              </td>
                              <td className="py-3 px-4 text-right flex justify-end gap-1.5">
                                <button
                                  onClick={() => setViewingPrescription(p)}
                                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-330 font-bold rounded-lg text-[9px] hover:bg-slate-200"
                                >
                                  Visualizar
                                </button>
                                <button
                                  onClick={() => sendPrescriptionWhatsapp(p.id)}
                                  className="px-2 py-1 bg-emerald-500 text-white font-bold rounded-lg text-[9px] hover:opacity-90 flex items-center gap-0.5"
                                >
                                  WhatsApp
                                </button>
                              </td>
                            </tr>
                          ))}
                          {patientPrescriptions.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                                Nenhuma receita ou atestado emitido para este paciente.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* SUB-ABA: DOCUMENTOS & FOTOS */}
              {activeSubTab === 'documentos' && (
                <div className="space-y-6">
                  {/* Galeria de Fotos */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Image className="w-4 h-4 text-secondary" /> Galeria de Fotos Clínicas
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {patientPhotos.map(photo => (
                        <div key={photo.id} className="group relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900/30 p-1.5 shadow-sm">
                          <img src={photo.url} alt={photo.title} className="w-full h-28 object-cover rounded-lg" />
                          <div className="mt-2 text-[10px]">
                            <h5 className="font-bold text-slate-700 dark:text-slate-350 truncate">{photo.title}</h5>
                            <span className="text-slate-400 font-semibold">{photo.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Radiografias / Exames */}
                  <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-4 h-4 text-secondary" /> Exames e Documentos Radiográficos
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-red-500" />
                          <div>
                            <h5 className="font-bold">Radiografia_Panoramica_Completa.pdf</h5>
                            <span className="text-[10px] text-slate-400 font-semibold">2.4 MB • Modificado há 1 mês</span>
                          </div>
                        </div>
                        <button className="text-[10px] text-secondary font-bold hover:underline">Download</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-ABA: FINANCEIRO */}
              {activeSubTab === 'financeiro' && (() => {
                const patTrans = financeTransactions.filter(t => t.description.includes(selectedPatient.name));
                return (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histórico de Cobranças e Recibos</h4>
                    <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 border-b border-slate-200/40 dark:border-slate-800">
                            <th className="py-3 px-4 font-bold">Descrição</th>
                            <th className="py-3 px-4 font-bold">Valor</th>
                            <th className="py-3 px-4 font-bold">Tipo</th>
                            <th className="py-3 px-4 font-bold">Data</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                          {patTrans.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-4 font-bold">{t.description}</td>
                              <td className="py-3 px-4 font-extrabold text-emerald-500">R$ {t.amount}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500">
                                  Recebido
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium">{t.date}</td>
                            </tr>
                          ))}
                          {patTrans.length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                                Nenhuma transação lançada para este paciente.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* SUB-ABA: CONSULTAS */}
              {activeSubTab === 'consultas' && (() => {
                const patApps = appointments.filter(a => a.patient_id === selectedPatient.id);
                return (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histórico de Agendamentos</h4>
                    <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 border-b border-slate-200/40 dark:border-slate-800">
                            <th className="py-3 px-4 font-bold">Data/Horário</th>
                            <th className="py-3 px-4 font-bold">Procedimento</th>
                            <th className="py-3 px-4 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                          {patApps.map(a => (
                            <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-4 font-bold">
                                {new Date(a.start_time).toLocaleDateString('pt-BR')} às {new Date(a.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3 px-4 font-semibold">{a.procedureName}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  a.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500' :
                                  a.status === 'PENDING' ? 'bg-amber-400/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  {a.status === 'CONFIRMED' ? 'Confirmado' : a.status === 'PENDING' ? 'Pendente' : 'Cancelado'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {patApps.length === 0 && (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-slate-400 font-semibold">
                                Nenhuma consulta agendada.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3 select-none">
            <User className="w-12 h-12 text-slate-300 stroke-1" />
            <h4 className="font-title font-bold text-slate-700 dark:text-slate-300 text-sm">Prontuário Odontológico</h4>
            <p className="text-xs max-w-xs text-center leading-relaxed">Selecione um paciente na lista lateral para visualizar sua ficha clínica, odontograma interativo e histórico.</p>
            <button
              onClick={() => setShowAddPatient(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center gap-1.5 mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Novo Paciente</span>
            </button>
          </div>
        )}

      {/* MODAL: ADICIONAR PACIENTE */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title">Cadastrar Novo Paciente</h3>
              <button 
                onClick={() => setShowAddPatient(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPatientSubmit} className="space-y-4 text-slate-800 dark:text-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ex: João da Silva"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">WhatsApp / Celular</label>
                <input
                  type="text"
                  required
                  placeholder="5511999998888"
                  value={pPhone}
                  onChange={(e) => setPPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail (Opcional)</label>
                <input
                  type="email"
                  placeholder="joao@email.com"
                  value={pEmail}
                  onChange={(e) => setPEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Observações Médicas Iniciais</label>
                <textarea
                  placeholder="ex: Hipertenso, Alérgico a penicilina..."
                  value={pNotes}
                  onChange={(e) => setPNotes(e.target.value)}
                  className="w-full h-20 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl shadow text-xs mt-2"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Registrar Paciente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURAÇÃO DE DENTE (ODONTOGRAMA) */}
      {showToothModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title">Editar Procedimento: Dente {selectedTooth}</h3>
              <button 
                onClick={() => setShowToothModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-slate-800 dark:text-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Escolher Procedimento</label>
                <select
                  value={toothProcedure}
                  onChange={(e) => setToothProcedure(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                >
                  <option value="">Nenhum / Saudável</option>
                  {procedures.map(p => (
                    <option key={p.id} value={p.name}>{p.name} - R$ {p.price}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado Clínico</label>
                <select
                  value={toothStatus}
                  onChange={(e) => setToothStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                >
                  <option value="NEED_TREATMENT">Necessita de Tratamento (Cárie/Infiltração)</option>
                  <option value="TREATED">Tratado / Concluído</option>
                  <option value="IMPLANT">Implante Realizado</option>
                  <option value="MISSING">Extraído / Ausente</option>
                </select>
              </div>

              <button
                onClick={handleSaveToothConfig}
                className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl shadow text-xs mt-2"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA PRESCRIÇÃO */}
      {showAddPresc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title">Emitir Prescrição Digital</h3>
              <button 
                onClick={() => setShowAddPresc(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPrescSubmit} className="space-y-4 text-slate-850 dark:text-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Modelo de Documento</label>
                <select
                  value={selectedPrescTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                >
                  <option value="">-- Personalizado / Sem Modelo --</option>
                  <option value="analgesico">Receita Analgésica Padrão</option>
                  <option value="antibiotico">Receita Antibiótica Padrão</option>
                  <option value="comparecimento">Atestado de Comparecimento</option>
                  <option value="afastamento">Atestado de Afastamento (1 dia)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1">Título do Documento</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Receita de Anti-inflamatório"
                  value={prescTitle}
                  onChange={(e) => setPrescTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1">Corpo da Prescrição / Atestado</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Uso Oral..."
                  value={prescText}
                  onChange={(e) => setPrescText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendViaWa"
                  checked={sendViaWa}
                  onChange={(e) => setSendViaWa(e.target.checked)}
                  className="rounded border-slate-300 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="sendViaWa" className="text-xs font-bold text-slate-450 cursor-pointer select-none">
                  Enviar PDF por WhatsApp automaticamente
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl shadow text-xs mt-2"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Emitir e Assinar Documento (RN-001)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZAR PRESCRIÇÃO */}
      {viewingPrescription && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-850 rounded-[32px] max-w-xl w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-left space-y-6">
            
            {/* Header com Ações Rápidas */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <span className="text-[9px] bg-sky-500/10 text-sky-500 font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">Prescrição Assinada</span>
                <h3 className="text-base font-black text-slate-850 dark:text-white font-title mt-1">{viewingPrescription.title}</h3>
              </div>
              <button 
                onClick={() => setViewingPrescription(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 active:scale-90 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Documento Físico Simulado (Papel Timbrado) */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-inner text-slate-800 dark:text-slate-200">
              
              {/* Timbre da Clínica */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-200/40 dark:border-slate-800/60">
                <div className="space-y-1">
                  <h4 className="text-sm font-black font-title text-slate-900 dark:text-white uppercase tracking-wider">{clinic?.name || 'FlowDent Dental Clinic'}</h4>
                  <span className="text-[10px] text-slate-400 font-bold block">FATOR DE INTEGRIDADE CLÍNICA • CFO</span>
                </div>
                {clinic?.logo_url ? (
                  <img src={clinic.logo_url} alt="Logo" className="h-8 object-contain" />
                ) : (
                  <span className="text-xl">🦷</span>
                )}
              </div>

              {/* Dados do Paciente e Emissão */}
              <div className="grid grid-cols-2 gap-4 text-[10px] bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 font-bold uppercase block">Paciente</span>
                  <span className="font-extrabold text-slate-800 dark:text-white text-xs">{selectedPatient?.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold uppercase block">Data de Emissão</span>
                  <span className="font-extrabold text-slate-850 dark:text-white text-xs">
                    {new Date(viewingPrescription.created_at).toLocaleDateString('pt-BR')} às {new Date(viewingPrescription.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Conteúdo Clínico */}
              <div className="min-h-[140px] text-xs font-semibold leading-relaxed font-mono whitespace-pre-wrap py-2 border-b border-slate-200/40 dark:border-slate-800/60">
                {viewingPrescription.description}
              </div>

              {/* Rodapé com Assinatura Eletrônica e QR Code */}
              <div className="flex justify-between items-center gap-4 pt-2">
                <div className="space-y-2 flex-1">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Assinante</span>
                    <span className="font-extrabold text-xs text-slate-800 dark:text-white">{viewingPrescription.dentistName}</span>
                    <span className="text-[9px] text-slate-400 block font-semibold">Cirurgião-Dentista Responsável</span>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-200/40 dark:border-slate-800/60">
                    <span className="text-[9px] text-emerald-500 font-extrabold flex items-center gap-1">
                      🛡️ Assinatura Conforme ICP-Brasil / CFO
                    </span>
                    <span className="block font-mono text-[8px] text-slate-400 select-all leading-tight break-all">
                      HASH: {viewingPrescription.signature_hash}
                    </span>
                  </div>
                </div>

                {/* QR Code de Validação Real */}
                <div className="flex flex-col items-center gap-1.5 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=76x76&data=${encodeURIComponent(`https://flowdent.com.br/verificar?hash=${viewingPrescription.signature_hash}`)}`} 
                    alt="QR Code de Validação" 
                    className="w-[76px] h-[76px]"
                  />
                  <span className="text-[7px] text-slate-450 font-bold uppercase tracking-wider">E-VALIDAR</span>
                </div>
              </div>

            </div>

            {/* Ações de Impressão e WhatsApp */}
            <div className="flex gap-2.5 justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Imprimir Prescrição
              </button>
              <button
                onClick={() => {
                  sendPrescriptionWhatsapp(viewingPrescription.id);
                  setViewingPrescription(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Enviar p/ WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR ANAMNESE ESTRUTURADA */}
      {showEditAnamnese && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[28px] max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-850 dark:text-white font-title">Editar Ficha de Anamnese</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Paciente: {selectedPatient?.name}</span>
              </div>
              <button 
                onClick={() => setShowEditAnamnese(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAnamneseSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <div className="grid grid-cols-2 gap-4">
                {/* Checkbox 1: Cardiopatia */}
                <label className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300">
                  <input
                    type="checkbox"
                    checked={hasHeartDisease}
                    onChange={(e) => setHasHeartDisease(e.target.checked)}
                    className="rounded border-slate-350 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                  />
                  <span>Cardiopatia / Sopro</span>
                </label>

                {/* Checkbox 2: Diabetes */}
                <label className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300">
                  <input
                    type="checkbox"
                    checked={hasDiabetes}
                    onChange={(e) => setHasDiabetes(e.target.checked)}
                    className="rounded border-slate-350 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                  />
                  <span>Diabetes</span>
                </label>

                {/* Checkbox 3: Hipertensão */}
                <label className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300">
                  <input
                    type="checkbox"
                    checked={hasHypertension}
                    onChange={(e) => setHasHypertension(e.target.checked)}
                    className="rounded border-slate-350 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                  />
                  <span>Hipertensão</span>
                </label>

                {/* Checkbox 4: Gestante */}
                <label className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300">
                  <input
                    type="checkbox"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    className="rounded border-slate-350 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                  />
                  <span>Gestante</span>
                </label>

                {/* Checkbox 5: Distúrbio Hemorrágico */}
                <label className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300">
                  <input
                    type="checkbox"
                    checked={hasBleedingDisorder}
                    onChange={(e) => setHasBleedingDisorder(e.target.checked)}
                    className="rounded border-slate-350 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                  />
                  <span>Distúrbio Hemorrágico</span>
                </label>
              </div>

              {/* Alergias */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAllergies}
                    onChange={(e) => setHasAllergies(e.target.checked)}
                    className="rounded border-slate-350 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                  />
                  <span>Apresenta Alergias Medicamentosas ou a Materiais?</span>
                </label>
                {hasAllergies && (
                  <input
                    type="text"
                    required
                    placeholder="Descreva as alergias (ex: Penicilina, Látex, Dipirona)..."
                    value={allergyDetails}
                    onChange={(e) => setAllergyDetails(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                )}
              </div>

              {/* Medicação Contínua */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usesMedication}
                    onChange={(e) => setUsesMedication(e.target.checked)}
                    className="rounded border-slate-350 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                  />
                  <span>Faz uso de alguma medicação de uso contínuo?</span>
                </label>
                {usesMedication && (
                  <input
                    type="text"
                    required
                    placeholder="Quais medicações e dosagens?..."
                    value={medicationDetails}
                    onChange={(e) => setMedicationDetails(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                )}
              </div>

              {/* Observações Gerais */}
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Notas Clínicas e Observações Gerais</label>
                <textarea
                  rows={3}
                  placeholder="Instruções gerais, histórico familiar ou observações secundárias..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowEditAnamnese(false)}
                  className="px-4 py-2 bg-slate-150 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-white font-extrabold rounded-xl shadow transition-all active:scale-95"
                  style={{ backgroundColor: currentTheme.secondary_color }}
                >
                  Salvar Ficha Clínica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
