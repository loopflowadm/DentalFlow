import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, User, Phone, Mail, FileText, Calendar, 
  DollarSign, Activity, Image, MessageSquare, ShieldAlert, 
  Trash2, X, PlusCircle, CheckCircle, Clock, Edit, FileDigit,
  ArrowRight, AlertCircle, Printer, Download, Sparkles, Send,
  Check, MoreVertical, Bold, Italic, Link2, AlignLeft, AlignCenter,
  AlignRight, List, Undo, Redo, ImageIcon, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    updateToothRecord,
    installments: globalInstallments,
    payInstallment: globalPayInstallment,
    dentists
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

  const [activeSubTab, setActiveSubTab] = useState('visao_geral'); // 'visao_geral' | 'anamnese' | 'orcamentos' | 'tratamentos' | 'pagamentos' | 'evolucao' | 'documentos' | 'arquivos'
  
  // Modais
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showEditPatient, setShowEditPatient] = useState(false);

  // Campos de criação/edição de paciente
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pCPF, setPCPF] = useState('');
  const [pRG, setPRG] = useState('');
  const [pBirthDate, setPBirthDate] = useState('');
  const [pGender, setPGender] = useState('Masculino');
  const [pAddress, setPAddress] = useState('');
  const [pReminderPref, setPReminderPref] = useState('WhatsApp');
  const [pNotes, setPNotes] = useState('');

  // Banners dismiss
  const [showSerasaBanner, setShowSerasaBanner] = useState(true);
  const [showCadastroBanner, setShowCadastroBanner] = useState(true);

  // Filtro de pagamentos
  const [payFilter, setPayFilter] = useState('Todos'); // 'Todos' | 'Pagos' | 'Aguardando' | 'Em aberto' | 'Em atraso'

  // Parcelas pagas localmente (para mocks de fallback)
  const [localPaidInstallmentIds, setLocalPaidInstallmentIds] = useState([]);

  // Parcelas do paciente (Pagamentos) obtidas do banco ou mockadas
  const getPatientInstallments = () => {
    if (!selectedPatient) return [];
    
    // Filtrar parcelas reais do Supabase
    const dbInsts = globalInstallments.filter(i => i.patient_id === selectedPatient.id || i.patientId === selectedPatient.id);
    
    if (dbInsts.length > 0) {
      return dbInsts.map(i => ({
        id: i.id,
        desc: i.description || `Parcela ${i.installment_number} de orçamento`,
        due: new Date(i.due_date).toLocaleDateString('pt-BR'),
        amount: parseFloat(i.amount) || 0,
        status: i.status === 'PAID' ? 'PAGO' : (new Date(i.due_date) < new Date() ? 'ATRASO' : 'ABERTO'),
        number: `${i.installment_number}/${dbInsts.length}`,
        orc: `#${i.budget_id ? i.budget_id.substring(0, 7).toUpperCase() : 'ORC'}`
      }));
    }
    
    // Fallback limpo para produção
    return [];
  };

  const handlePayInstallment = async (id) => {
    if (typeof id === 'string' && id.startsWith('inst-')) {
      // Mock local
      setLocalPaidInstallmentIds(prev => [...prev, id]);
    } else {
      // Supabase real
      try {
        await globalPayInstallment(id);
      } catch (err) {
        console.error('Erro ao liquidar parcela no Supabase:', err);
      }
    }
  };

  const activeInstallments = getPatientInstallments();

  // Computar totais de pagamento
  const totalPago = activeInstallments.filter(i => i.status === 'PAGO').reduce((acc, curr) => acc + curr.amount, 0);
  const totalAReceber = activeInstallments.filter(i => i.status !== 'PAGO').reduce((acc, curr) => acc + curr.amount, 0);

  // Sincronizar campos de edição
  const openEditModal = () => {
    if (!selectedPatient) return;
    const history = parseHistory(selectedPatient.medical_history);
    
    setPName(selectedPatient.name || '');
    setPPhone(selectedPatient.phone || '');
    setPEmail(selectedPatient.email || '');
    setPCPF(history.cpf || '');
    setPRG(history.rg || '');
    setPBirthDate(history.birth_date || '');
    setPGender(history.gender || 'Masculino');
    setPAddress(history.address || '');
    setPReminderPref(history.reminder_preference || 'WhatsApp');
    setPNotes(history.notes || '');

    setShowEditPatient(true);
  };

  // Estados do Odontograma FDI
  const [selectedTooth, setSelectedTooth] = useState(26); 
  const [activeTool, setActiveTool] = useState('Cárie'); 
  const [arcadaType, setArcadaType] = useState('permanentes'); 
  const [historyUndoStack, setHistoryUndoStack] = useState([]);

  // Estados do Módulo Clínico (Evolução & Sofia IA)
  const [newRecordText, setNewRecordText] = useState('');
  const [isGeneratingAiRecord, setIsGeneratingAiRecord] = useState(false);
  const [adendoTargetId, setAdendoTargetId] = useState(null);
  const [adendoText, setAdendoText] = useState('');
  const [isEvolucaoSigned, setIsEvolucaoSigned] = useState(false);
  const [evolucaoDentist, setEvolucaoDentist] = useState(user?.full_name || '');
  const [evolucaoDate, setEvolucaoDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados de Prescrição Digital
  const [showAddPresc, setShowAddPresc] = useState(false);
  const [prescTitle, setPrescTitle] = useState('');
  const [prescText, setPrescText] = useState('');
  const [selectedPrescTemplate, setSelectedPrescTemplate] = useState('');
  const [sendViaWa, setSendViaWa] = useState(true);
  const [viewingPrescription, setViewingPrescription] = useState(null);

  // Estados das 23 Questões de Anamnese Padrão
  const [queixaPrincipal, setQueixaPrincipal] = useState('');
  const [hasPressaoAlta, setHasPressaoAlta] = useState('Nao'); // 'Sim' | 'Nao' | 'Nao sei'
  const [hasPressaoAltaDetail, setHasPressaoAltaDetail] = useState('');
  const [hasAlergia, setHasAlergia] = useState('Nao');
  const [hasAlergiaDetail, setHasAlergiaDetail] = useState('');
  const [hasAlteracaoSangue, setHasAlteracaoSangue] = useState('Nao');
  const [hasAlteracaoSangueDetail, setHasAlteracaoSangueDetail] = useState('');
  const [hasHemorragia, setHasHemorragia] = useState('Nao');
  const [hasAlteracaoCardio, setHasAlteracaoCardio] = useState('Nao');
  const [hasAlteracaoCardioDetail, setHasAlteracaoCardioDetail] = useState('');
  const [hasDiabetes, setHasDiabetes] = useState('Nao');
  const [hasDiabetesDetail, setHasDiabetesDetail] = useState('');
  const [hasAsma, setHasAsma] = useState('Nao');
  const [hasXerostomia, setHasXerostomia] = useState('Nao');
  const [hasDisfuncaoHepatica, setHasDisfuncaoHepatica] = useState('Nao');
  const [hasDisfuncaoHepaticaDetail, setHasDisfuncaoHepaticaDetail] = useState('');
  const [hasDisfuncaoRenal, setHasDisfuncaoRenal] = useState('Nao');
  const [hasDisfuncaoRenalDetail, setHasDisfuncaoRenalDetail] = useState('');
  const [hasDisfuncaoRespiratoria, setHasDisfuncaoRespiratoria] = useState('Nao');
  const [hasDisfuncaoRespiratoriaDetail, setHasDisfuncaoRespiratoriaDetail] = useState('');
  const [hasAlteracaoOssea, setHasAlteracaoOssea] = useState('Nao');
  const [hasAlteracaoOsseaDetail, setHasAlteracaoOsseaDetail] = useState('');
  const [hasDoencaTransmissivel, setHasDoencaTransmissivel] = useState('Nao');
  const [hasDoencaTransmissivelDetail, setHasDoencaTransmissivelDetail] = useState('');
  const [hasOutraDoenca, setHasOutraDoenca] = useState('Nao');
  const [hasOutraDoencaDetail, setHasOutraDoencaDetail] = useState('');
  const [hasAlergiaAnestesia, setHasAlergiaAnestesia] = useState('Nao');
  const [hasAlergiaAnestesiaDetail, setHasAlergiaAnestesiaDetail] = useState('');
  const [hasGastriteRefluxo, setHasGastriteRefluxo] = useState('Nao');
  const [hasDificuldadeBoca, setHasDificuldadeBoca] = useState('Nao');
  const [hasFebreReumatica, setHasFebreReumatica] = useState('Nao');
  const [hasEstaloBoca, setHasEstaloBoca] = useState('Nao');
  const [isGestante, setIsGestante] = useState('Nao');
  const [isGestanteDetail, setIsGestanteDetail] = useState('');
  const [isAmamentando, setIsAmamentando] = useState('Nao');
  const [isAnticoncepcional, setIsAnticoncepcional] = useState('Nao');
  const [isAnticoncepcionalDetail, setIsAnticoncepcionalDetail] = useState('');
  const [anamneseNotes, setAnamneseNotes] = useState('');

  // Carregar dados de Anamnese Estruturada ao mudar paciente
  useEffect(() => {
    if (!selectedPatient) return;
    const history = parseHistory(selectedPatient.medical_history);
    const anamnese = history.anamnese_estruturada || {};

    setQueixaPrincipal(anamnese.queixa_principal || '');
    setHasPressaoAlta(anamnese.has_pressao_alta || 'Nao');
    setHasPressaoAltaDetail(anamnese.has_pressao_alta_detail || '');
    setHasAlergia(anamnese.has_alergia || 'Nao');
    setHasAlergiaDetail(anamnese.has_alergia_detail || '');
    setHasAlteracaoSangue(anamnese.has_alteracao_sangue || 'Nao');
    setHasAlteracaoSangueDetail(anamnese.has_alteracao_sangue_detail || '');
    setHasHemorragia(anamnese.has_hemorragia || 'Nao');
    setHasAlteracaoCardio(anamnese.has_alteracao_cardio || 'Nao');
    setHasAlteracaoCardioDetail(anamnese.has_alteracao_cardio_detail || '');
    setHasDiabetes(anamnese.has_diabetes || 'Nao');
    setHasDiabetesDetail(anamnese.has_diabetes_detail || '');
    setHasAsma(anamnese.has_asma || 'Nao');
    setHasXerostomia(anamnese.has_xerostomia || 'Nao');
    setHasDisfuncaoHepatica(anamnese.has_disfuncao_hepatica || 'Nao');
    setHasDisfuncaoHepaticaDetail(anamnese.has_disfuncao_hepatica_detail || '');
    setHasDisfuncaoRenal(anamnese.has_disfuncao_renal || 'Nao');
    setHasDisfuncaoRenalDetail(anamnese.has_disfuncao_renal_detail || '');
    setHasDisfuncaoRespiratoria(anamnese.has_disfuncao_respiratoria || 'Nao');
    setHasDisfuncaoRespiratoriaDetail(anamnese.has_disfuncao_respiratoria_detail || '');
    setHasAlteracaoOssea(anamnese.has_alteracao_ossea || 'Nao');
    setHasAlteracaoOsseaDetail(anamnese.has_alteracao_ossea_detail || '');
    setHasDoencaTransmissivel(anamnese.has_doenca_transmissivel || 'Nao');
    setHasDoencaTransmissivelDetail(anamnese.has_doenca_transmissivel_detail || '');
    setHasOutraDoenca(anamnese.has_outra_doenca || 'Nao');
    setHasOutraDoencaDetail(anamnese.has_outra_doenca_detail || '');
    setHasAlergiaAnestesia(anamnese.has_alergia_anestesia || 'Nao');
    setHasAlergiaAnestesiaDetail(anamnese.has_alergia_anestesia_detail || '');
    setHasGastriteRefluxo(anamnese.has_gastrite_refluxo || 'Nao');
    setHasDificuldadeBoca(anamnese.has_dificuldade_boca || 'Nao');
    setHasFebreReumatica(anamnese.has_febre_reumatica || 'Nao');
    setHasEstaloBoca(anamnese.has_estalo_boca || 'Nao');
    setIsGestante(anamnese.is_gestante || 'Nao');
    setIsGestanteDetail(anamnese.is_gestante_detail || '');
    setIsAmamentando(anamnese.is_amamentando || 'Nao');
    setIsAnticoncepcional(anamnese.is_anticoncepcional || 'Nao');
    setIsAnticoncepcionalDetail(anamnese.is_anticoncepcional_detail || '');
    setAnamneseNotes(anamnese.anamnese_notes || '');
  }, [selectedPatient]);

  // Odontograma FDI Teeth Arrays
  const upperTeethRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperTeethLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeethRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerTeethLeft = [31, 32, 33, 34, 35, 36, 37, 38];

  const upperTeethDecRight = [55, 54, 53, 52, 51];
  const upperTeethDecLeft = [61, 62, 63, 64, 65];
  const lowerTeethDecRight = [85, 84, 83, 82, 81];
  const lowerTeethDecLeft = [71, 72, 73, 74, 75];

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

  // Calcular idade exata do paciente
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return 'Idade não cadastrada';
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months = 12 + months;
    }
    return `${years} anos e ${months} meses`;
  };

  // Cadastrar Paciente Geral
  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    if (!pName || !pPhone) return;

    const fresh = await addPatient({
      name: pName,
      phone: pPhone,
      email: pEmail || null,
      medical_history: JSON.stringify({
        notes: pNotes,
        cpf: pCPF,
        rg: pRG,
        birth_date: pBirthDate,
        gender: pGender,
        address: pAddress,
        reminder_preference: pReminderPref,
        odontogram: {},
        anamnese_estruturada: {}
      })
    });

    setPName('');
    setPPhone('');
    setPEmail('');
    setPCPF('');
    setPRG('');
    setPBirthDate('');
    setPGender('Masculino');
    setPAddress('');
    setPReminderPref('WhatsApp');
    setPNotes('');
    setShowAddPatient(false);
    if (fresh) setSelectedPatient(fresh);
  };

  // Editar Dados do Paciente
  const handleEditPatientSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const history = parseHistory(selectedPatient.medical_history);
    const updatedHistory = {
      ...history,
      notes: pNotes,
      cpf: pCPF,
      rg: pRG,
      birth_date: pBirthDate,
      gender: pGender,
      address: pAddress,
      reminder_preference: pReminderPref
    };

    const updated = {
      ...selectedPatient,
      name: pName,
      phone: pPhone,
      email: pEmail || null,
      medical_history: JSON.stringify(updatedHistory)
    };

    await updatePatient(updated);
    setSelectedPatient(updated);
    setShowEditPatient(false);
  };

  // Salvar respostas de Anamnese Padrão
  const handleSaveAnamneseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const history = parseHistory(selectedPatient.medical_history);
    const updatedHistory = {
      ...history,
      anamnese_estruturada: {
        queixa_principal: queixaPrincipal,
        has_pressao_alta: hasPressaoAlta,
        has_pressao_alta_detail: hasPressaoAltaDetail,
        has_alergia: hasAlergia,
        has_alergia_detail: hasAlergiaDetail,
        has_alteracao_sangue: hasAlteracaoSangue,
        has_alteracao_sangue_detail: hasAlteracaoSangueDetail,
        has_hemorragia: hasHemorragia,
        has_alteracao_cardio: hasAlteracaoCardio,
        has_alteracao_cardio_detail: hasAlteracaoCardioDetail,
        has_diabetes: hasDiabetes,
        has_diabetes_detail: hasDiabetesDetail,
        has_asma: hasAsma,
        has_xerostomia: hasXerostomia,
        has_disfuncao_hepatica: hasDisfuncaoHepatica,
        has_disfuncao_hepatica_detail: hasDisfuncaoHepaticaDetail,
        has_disfuncao_renal: hasDisfuncaoRenal,
        has_disfuncao_renal_detail: hasDisfuncaoRenalDetail,
        has_disfuncao_respiratoria: hasDisfuncaoRespiratoria,
        has_disfuncao_respiratoria_detail: hasDisfuncaoRespiratoriaDetail,
        has_alteracao_ossea: hasAlteracaoOssea,
        has_alteracao_ossea_detail: hasAlteracaoOsseaDetail,
        has_doenca_transmissivel: hasDoencaTransmissivel,
        has_doenca_transmissivel_detail: hasDoencaTransmissivelDetail,
        has_outra_doenca: hasOutraDoenca,
        has_outra_doenca_detail: hasOutraDoencaDetail,
        has_alergia_anestesia: hasAlergiaAnestesia,
        has_alergia_anestesia_detail: hasAlergiaAnestesiaDetail,
        has_gastrite_refluxo: hasGastriteRefluxo,
        has_dificuldade_boca: hasDificuldadeBoca,
        has_febre_reumatica: hasFebreReumatica,
        has_estalo_boca: hasEstaloBoca,
        is_gestante: isGestante,
        is_gestante_detail: isGestanteDetail,
        is_amamentando: isAmamentando,
        is_anticoncepcional: isAnticoncepcional,
        is_anticoncepcional_detail: isAnticoncepcionalDetail,
        anamnese_notes: anamneseNotes
      }
    };

    const updated = {
      ...selectedPatient,
      medical_history: JSON.stringify(updatedHistory)
    };

    await updatePatient(updated);
    setSelectedPatient(updated);
    alert('Ficha de Anamnese salva com sucesso!');
  };

  // Emitir receitas
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

    if (sendViaWa && newPresc) {
      await sendPrescriptionWhatsapp(newPresc.id);
    }

    setShowAddPresc(false);
    setPrescTitle('');
    setPrescText('');
    setSelectedPrescTemplate('');
  };

  // Evolução clínica
  const handleAddRecordSubmit = async (e) => {
    e.preventDefault();
    if (!newRecordText) return;
    
    await addMedicalRecord({
      patient_id: selectedPatient.id,
      description: newRecordText,
      is_adendo: false,
      signature_hash: isEvolucaoSigned ? `CFO-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null
    });
    
    setNewRecordText('Descreva a evolução do tratamento desse paciente.');
    setIsEvolucaoSigned(false);
  };

  const handleAiImproveRecord = async () => {
    if (!newRecordText || newRecordText === 'Descreva a evolução do tratamento desse paciente.') return;
    setIsGeneratingAiRecord(true);
    const enriched = await generateAiEvolution(newRecordText);
    setNewRecordText(enriched);
    setIsGeneratingAiRecord(false);
  };

  // Mapeia posições relativas do SVG para termos anatômicos corretos (Mesial/Distal)
  const getFaceLabel = (toothNumber, position) => {
    const q = Math.floor(toothNumber / 10);
    if (position === 'top') return 'Vestibular';
    if (position === 'bottom') return 'Palatina';
    if (position === 'center') return 'Oclusal';
    
    // Quadrantes 1 e 4 (Lado direito do paciente, esquerdo na tela)
    if (q === 1 || q === 4 || q === 5 || q === 8) {
      return position === 'left' ? 'Distal' : 'Mesial';
    } else {
      // Quadrantes 2 e 3 (Lado esquerdo do paciente, direito na tela)
      return position === 'left' ? 'Mesial' : 'Distal';
    }
  };

  const getOdontogramData = () => {
    if (!selectedPatient) return {};
    const parsed = parseHistory(selectedPatient.medical_history);
    return parsed.odontogram || {};
  };

  const saveOdontogramData = async (newOdontogram) => {
    if (!selectedPatient) return;
    const parsedHistory = parseHistory(selectedPatient.medical_history);
    const updatedHistory = {
      ...parsedHistory,
      odontogram: newOdontogram
    };
    
    const updatedPat = {
      ...selectedPatient,
      medical_history: JSON.stringify(updatedHistory)
    };
    
    // Atualiza estado local instantaneamente para feedback imediato (<50ms)
    setSelectedPatient(updatedPat);
    
    // Atualiza no Supabase em background
    try {
      await updatePatient(updatedPat);
    } catch (err) {
      console.error('Erro ao salvar histórico médico no Supabase:', err);
    }
  };

  const updateToothInOdontogram = async (toothNumber, toothData) => {
    if (!selectedPatient) return;
    const currentOdontogram = getOdontogramData();
    const updatedOdontogram = {
      ...currentOdontogram,
      [toothNumber]: toothData
    };
    
    // 1. Salva no histórico do paciente (JSONB)
    await saveOdontogramData(updatedOdontogram);
    
    // 2. Determina o status geral para sincronização com a tabela tooth_records
    let status = 'TREATED';
    const conds = toothData.conditions || [];
    if (conds.includes('Extraído') || conds.includes('Ausente')) {
      status = 'MISSING';
    } else if (conds.includes('Implante')) {
      status = 'IMPLANT';
    } else if (conds.some(c => ['Cárie', 'Fratura', 'Lesão Cervical'].includes(c))) {
      status = 'NEED_TREATMENT';
    } else if (conds.some(c => ['Restauração Resina', 'Restauração Amálgama', 'Coroa', 'Faceta', 'Endodontia', 'Selante', 'Outros / Obs.'].includes(c))) {
      status = 'TREATED';
    } else {
      status = 'TREATED';
    }
    
    const primaryProc = conds.find(c => c !== 'Saudável') || 'Saudável';
    
    // 3. Atualiza a tabela tooth_records
    try {
      await updateToothRecord({
        patient_id: selectedPatient.id,
        tooth_number: parseInt(toothNumber),
        procedure_name: primaryProc,
        status: status
      });
    } catch (err) {
      console.error('Erro ao sincronizar dente com tooth_records:', err);
    }
  };

  const handleFaceClick = async (toothNumber, faceName) => {
    if (!selectedPatient) return;
    const currentOdontogram = getOdontogramData();
    const toothData = currentOdontogram[toothNumber] || {
      faces: {},
      conditions: [],
      observations: '',
      history: []
    };
    
    // Salva estado para Desfazer
    setHistoryUndoStack(prev => [...prev, JSON.parse(JSON.stringify(currentOdontogram))]);

    const tool = activeTool;
    const updatedFaces = { ...toothData.faces };
    
    if (tool === 'Saudável') {
      delete updatedFaces[faceName];
    } else {
      updatedFaces[faceName] = tool;
    }
    
    const uniqueConditions = new Set();
    Object.values(updatedFaces).forEach(cond => {
      if (cond && cond !== 'Saudável') uniqueConditions.add(cond);
    });
    
    const toothLevelTools = ['Implante', 'Endodontia', 'Coroa', 'Faceta', 'Extraído', 'Ausente', 'Lesão Cervical'];
    (toothData.conditions || []).forEach(cond => {
      if (toothLevelTools.includes(cond)) uniqueConditions.add(cond);
    });
    
    let newConditions = Array.from(uniqueConditions);
    if (newConditions.length === 0) {
      newConditions = ['Saudável'];
    } else {
      newConditions = newConditions.filter(c => c !== 'Saudável');
    }
    
    const newHistoryItem = {
      date: new Date().toISOString(),
      user: user?.full_name || 'Profissional',
      text: tool === 'Saudável' 
        ? `Limpou a face ${faceName}.`
        : `Marcou ${tool} na face ${faceName}.`
    };

    const updatedToothData = {
      ...toothData,
      faces: updatedFaces,
      conditions: newConditions,
      history: [...(toothData.history || []), newHistoryItem]
    };
    
    setSelectedTooth(toothNumber);
    await updateToothInOdontogram(toothNumber, updatedToothData);
  };

  const handleToothOutlineClick = async (toothNumber) => {
    if (!selectedPatient) return;
    const currentOdontogram = getOdontogramData();
    const toothData = currentOdontogram[toothNumber] || {
      faces: {},
      conditions: [],
      observations: '',
      history: []
    };

    setSelectedTooth(toothNumber);
    
    const tool = activeTool;
    const toothLevelTools = ['Implante', 'Endodontia', 'Coroa', 'Faceta', 'Extraído', 'Ausente', 'Lesão Cervical', 'Saudável'];
    
    if (!toothLevelTools.includes(tool)) {
      return; 
    }

    setHistoryUndoStack(prev => [...prev, JSON.parse(JSON.stringify(currentOdontogram))]);

    let newConditions = [...(toothData.conditions || [])];
    
    if (tool === 'Saudável') {
      newConditions = ['Saudável'];
      toothData.faces = {};
    } else {
      if (newConditions.includes(tool)) {
        newConditions = newConditions.filter(c => c !== tool);
      } else {
        if (['Implante', 'Extraído', 'Ausente'].includes(tool)) {
          newConditions = newConditions.filter(c => !['Implante', 'Extraído', 'Ausente'].includes(c));
        }
        newConditions = newConditions.filter(c => c !== 'Saudável');
        newConditions.push(tool);
      }
    }
    
    if (newConditions.length === 0) {
      newConditions = ['Saudável'];
    }

    const newHistoryItem = {
      date: new Date().toISOString(),
      user: user?.full_name || 'Profissional',
      text: tool === 'Saudável'
        ? `Limpou todas as marcações do dente.`
        : `Aplicou a condição ${tool} no dente.`
    };

    const updatedToothData = {
      ...toothData,
      conditions: newConditions,
      history: [...(toothData.history || []), newHistoryItem]
    };
    
    await updateToothInOdontogram(toothNumber, updatedToothData);
  };

  const handleSaveObservation = async (text) => {
    if (!selectedTooth || !selectedPatient) return;
    const currentOdontogram = getOdontogramData();
    const toothData = currentOdontogram[selectedTooth] || {
      faces: {},
      conditions: [],
      observations: '',
      history: []
    };
    
    const updatedToothData = {
      ...toothData,
      observations: text
    };
    
    await updateToothInOdontogram(selectedTooth, updatedToothData);
  };

  const handleRemoveCondition = async (condToRemove) => {
    if (!selectedTooth || !selectedPatient) return;
    const currentOdontogram = getOdontogramData();
    const toothData = currentOdontogram[selectedTooth] || {
      faces: {},
      conditions: [],
      observations: '',
      history: []
    };
    
    let newConditions = (toothData.conditions || []).filter(c => c !== condToRemove);
    if (newConditions.length === 0) newConditions = ['Saudável'];
    
    const updatedFaces = { ...toothData.faces };
    Object.keys(updatedFaces).forEach(faceName => {
      if (updatedFaces[faceName] === condToRemove) {
        delete updatedFaces[faceName];
      }
    });
    
    const newHistoryItem = {
      date: new Date().toISOString(),
      user: user?.full_name || 'Profissional',
      text: `Removeu a marcação "${condToRemove}".`
    };

    const updatedToothData = {
      ...toothData,
      conditions: newConditions,
      faces: updatedFaces,
      history: [...(toothData.history || []), newHistoryItem]
    };
    
    await updateToothInOdontogram(selectedTooth, updatedToothData);
  };

  const handleUndo = async () => {
    if (historyUndoStack.length === 0) return;
    const previousState = historyUndoStack[historyUndoStack.length - 1];
    setHistoryUndoStack(prev => prev.slice(0, -1));
    await saveOdontogramData(previousState);
  };

  const handleClearAll = async () => {
    if (window.confirm('Tem certeza de que deseja limpar todas as marcações do odontograma deste paciente?')) {
      setHistoryUndoStack(prev => [...prev, getOdontogramData()]);
      await saveOdontogramData({});
    }
  };

  const getConditionCounts = () => {
    const odontogram = getOdontogramData();
    const counts = {
      'Saudável': 32,
      'Cárie': 0,
      'Restauração Resina': 0,
      'Restauração Amálgama': 0,
      'Coroa': 0,
      'Faceta': 0,
      'Implante': 0,
      'Endodontia': 0,
      'Selante': 0,
      'Extraído': 0,
      'Ausente': 0,
      'Fratura': 0,
      'Lesão Cervical': 0,
      'Outros / Obs.': 0
    };
    
    let markedTeethCount = 0;
    
    Object.keys(odontogram).forEach(toothNum => {
      const tooth = odontogram[toothNum];
      const conds = tooth.conditions || [];
      const realConds = conds.filter(c => c !== 'Saudável');
      
      if (realConds.length > 0) {
        markedTeethCount++;
        realConds.forEach(c => {
          if (counts[c] !== undefined) {
            counts[c]++;
          }
        });
      }
    });
    
    counts['Saudável'] = Math.max(0, 32 - markedTeethCount);
    return counts;
  };

  const getToothColor = (toothNumber) => {
    // 1. Tenta obter do prontuário JSON (Odontograma Novo)
    const odontogram = getOdontogramData();
    const toothData = odontogram[toothNumber];
    if (toothData && toothData.conditions && toothData.conditions.length > 0) {
      const conds = toothData.conditions;
      if (conds.includes('Extraído') || conds.includes('Ausente')) {
        return 'border-red-500 bg-red-500/10 text-red-650';
      } else if (conds.includes('Implante')) {
        return 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400';
      } else if (conds.some(c => ['Cárie', 'Fratura', 'Lesão Cervical'].includes(c))) {
        return 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400';
      } else if (conds.some(c => ['Restauração Resina', 'Restauração Amálgama', 'Coroa', 'Faceta', 'Endodontia', 'Selante', 'Outros / Obs.'].includes(c))) {
        return 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      }
    }

    // 2. Fallback para a tabela toothRecords legada
    const data = toothRecords.find(r => r.patient_id === selectedPatient?.id && r.tooth_number === toothNumber);
    if (!data) return 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50';
    
    switch (data.status) {
      case 'NEED_TREATMENT':
        return 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'TREATED':
        return 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'IMPLANT':
        return 'border-blue-500 bg-blue-50/10 text-blue-600 dark:text-blue-400';
      case 'MISSING':
        return 'border-red-500 bg-red-500/10 text-red-650';
      default:
        return 'border-slate-300 bg-white text-slate-700';
    }
  };

  // Filtrar Pacientes listagem lateral
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search) || 
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Extrair info do histórico
  const selectedHistory = selectedPatient ? parseHistory(selectedPatient.medical_history) : {};
  const criticalConditions = [];
  if (selectedHistory.anamnese_estruturada) {
    const ae = selectedHistory.anamnese_estruturada;
    if (ae.has_pressao_alta === 'Sim') criticalConditions.push('Hipertensão');
    if (ae.has_alergia === 'Sim') criticalConditions.push(ae.has_alergia_detail ? `Alergia: ${ae.has_alergia_detail}` : 'Alergia');
    if (ae.has_alteracao_sangue === 'Sim') criticalConditions.push('Alt. Sanguínea');
    if (ae.has_alteracao_cardio === 'Sim') criticalConditions.push('Alt. Cardiovascular');
    if (ae.has_diabetes === 'Sim') criticalConditions.push('Diabetes');
    if (ae.is_gestante === 'Sim') criticalConditions.push('Gestante');
  }

  // Verificar aniversário
  const isBirthdayTomorrow = (birthDateString) => {
    if (!birthDateString) return false;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const birth = new Date(birthDateString);
    return tomorrow.getDate() === birth.getDate() && tomorrow.getMonth() === birth.getMonth();
  };

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950 font-body overflow-hidden">
      

      {/* ========================================================================= */}
      {/* PAINEL DIREITO: DETALHES / PRONTUÁRIO                                    */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedPatient ? (
          <>
            {/* 1. Header do Prontuário */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 flex-shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Big Avatar */}
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-2xl border border-slate-200/35 dark:border-white/5 shadow-inner">
                  👤
                </div>
                
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white font-title leading-tight">
                      {selectedPatient.name}
                    </h2>
                    
                    {/* Alertas */}
                    {criticalConditions.length > 0 && (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[9px] font-black uppercase flex items-center gap-0.5 leading-none">
                        ⚠️ {criticalConditions.length} Alerta de Saúde
                      </span>
                    )}

                    {isBirthdayTomorrow(selectedHistory.birth_date) && (
                      <span className="px-2 py-0.5 bg-violet-500/15 text-violet-550 border border-violet-500/20 rounded-lg text-[9px] font-black uppercase leading-none">
                        🎂 Aniversário amanhã
                      </span>
                    )}
                  </div>

                  {/* Sub details */}
                  <div className="flex items-center gap-3.5 text-[10px] text-slate-500 mt-1.5 font-bold flex-wrap">
                    <a 
                      href={`https://wa.me/${selectedPatient.phone}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-emerald-500 hover:underline"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-emerald-500/20" /> {selectedPatient.phone}
                    </a>
                    {selectedHistory.cpf && <span>CPF {selectedHistory.cpf}</span>}
                    <span>{calculateAge(selectedHistory.birth_date)}</span>
                  </div>

                  <button
                    onClick={() => alert('Categorizar paciente em desenvolvimento.')}
                    className="mt-1 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-200 rounded-lg text-[9px] font-bold transition-all border border-slate-200/40 dark:border-white/5 active:scale-95"
                  >
                    🏷️ Categorizar
                  </button>
                </div>
              </div>

              {/* Botão de Edição */}
              <button
                onClick={openEditModal}
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200/60 dark:border-white/5 transition-all shadow-sm"
              >
                <Edit className="w-3.5 h-3.5 text-slate-500" />
                Editar
              </button>
            </div>

            {/* 2. Barra de Navegação das Abas do Prontuário */}
            <div className="px-6 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800 flex-shrink-0 overflow-x-auto flex scrollbar-none">
              <div className="flex gap-4">
                {[
                  { id: 'visao_geral', label: 'Visão Geral' },
                  { id: 'anamnese', label: 'Anamnese' },
                  { id: 'orcamentos', label: 'Orçamentos' },
                  { id: 'odontograma', label: 'Odontograma' },
                  { id: 'pagamentos', label: 'Pagamentos', badge: checkPatientInadimplente(selectedPatient.id) ? '1' : null },
                  { id: 'evolucao', label: 'Evoluções' },
                  { id: 'documentos', label: 'Documentos' },
                  { id: 'arquivos', label: 'Arquivos' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`py-3.5 text-xs font-bold transition-all border-b-2 px-1 flex items-center ${
                      activeSubTab === tab.id 
                        ? 'border-secondary text-slate-900 dark:text-white font-black' 
                        : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    style={activeSubTab === tab.id ? { borderBottomColor: currentTheme.secondary_color } : {}}
                  >
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="ml-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Área de Conteúdo Ativo */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* ========================================== */}
              {/* ABA: VISÃO GERAL (DASHBOARD DUPLO)        */}
              {/* ========================================== */}
              {activeSubTab === 'visao_geral' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
                  
                  {/* COLUNA ESQUERDA (Widgets de Informações e Tarefas) */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Widget: Tarefas */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-850 dark:text-white font-title flex items-center gap-1.5">
                          📋 Tarefas
                        </h4>
                        <button
                          onClick={() => alert('Para criar tarefas, use a nova aba "Tarefa" no botão Agendar da Agenda.')}
                          className="text-[9px] text-secondary hover:underline font-extrabold"
                          style={{ color: currentTheme.secondary_color }}
                        >
                          + Nova
                        </button>
                      </div>

                      {/* Filtrar tarefas */}
                      {(() => {
                        const patTasks = appointments.filter(a => a.patient_id === selectedPatient.id && a.type === 'TAREFA');
                        return (
                          <div className="space-y-2.5">
                            {patTasks.map(t => (
                              <div key={t.id} className="p-2.5 bg-slate-50 dark:bg-black/15 border border-slate-200/40 dark:border-slate-800/40 rounded-xl flex items-center justify-between text-[10px] text-slate-550">
                                <div className="overflow-hidden flex-1 pr-2">
                                  <h5 className="font-extrabold text-slate-800 dark:text-white truncate">{t.title}</h5>
                                  <p className="opacity-80 truncate">{t.observations}</p>
                                </div>
                                <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-500 font-bold flex-shrink-0">
                                  {t.label || 'Entrada'}
                                </span>
                              </div>
                            ))}
                            {patTasks.length === 0 && (
                              <p className="text-[10px] text-slate-450 py-1 text-center font-bold">
                                Nenhuma tarefa cadastrada
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Widget: Informações */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-4 text-xs">
                      <h4 className="text-xs font-black text-slate-855 dark:text-white font-title">
                        Informações
                      </h4>

                      <div className="space-y-3 font-semibold text-slate-700 dark:text-slate-350">
                        <div>
                          <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">Código do paciente</span>
                          <span className="font-bold text-slate-800 dark:text-white">
                            {selectedPatient.id.substring(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">Preferência de lembretes</span>
                          <span className="font-bold text-slate-800 dark:text-white">{selectedHistory.reminder_preference || 'WhatsApp'}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-455 font-bold block uppercase tracking-wider">Celular</span>
                          <span className="font-bold text-slate-800 dark:text-white">{selectedPatient.phone}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-455 font-bold block uppercase tracking-wider">Email</span>
                          <span className="font-bold text-slate-800 dark:text-white truncate block">{selectedPatient.email || 'Não cadastrado'}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-455 font-bold block uppercase tracking-wider">Observações sobre o paciente</span>
                          <span className="font-bold text-slate-800 dark:text-white whitespace-pre-wrap block">
                            {selectedHistory.notes || 'Nenhuma observação clínica lançada.'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-455 font-bold block uppercase tracking-wider">Data de nascimento</span>
                          <span className="font-bold text-slate-800 dark:text-white">
                            {selectedHistory.birth_date ? `${new Date(selectedHistory.birth_date).toLocaleDateString('pt-BR')} - ${calculateAge(selectedHistory.birth_date).split(' e ')[0]}` : 'Não cadastrada'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-455 font-bold block uppercase tracking-wider">Gênero</span>
                            <span className="font-bold text-slate-855 dark:text-white">{selectedHistory.gender || 'Masculino'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-455 font-bold block uppercase tracking-wider">CPF</span>
                            <span className="font-bold text-slate-855 dark:text-white">{selectedHistory.cpf || '-'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-455 font-bold block uppercase tracking-wider">RG</span>
                            <span className="font-bold text-slate-855 dark:text-white">{selectedHistory.rg || '-'}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-455 font-bold block uppercase tracking-wider">Endereço</span>
                          <span className="font-bold text-slate-800 dark:text-white leading-relaxed block">
                            {selectedHistory.address || 'Não cadastrado'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* COLUNA DIREITA */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Widget: Odontograma FDI */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/40 dark:border-slate-800">
                          {['permanentes', 'deciduos'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setArcadaType(type)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                arcadaType === type 
                                  ? 'bg-white dark:bg-slate-750 text-slate-855 dark:text-white shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-355'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>

                        {/* Legenda de Status */}
                        <div className="flex items-center gap-3 text-[9px] font-black text-slate-450 uppercase tracking-widest">
                          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Finalizado</div>
                          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-500 rounded-full" /> Em aberto</div>
                          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> Ausente</div>
                        </div>
                      </div>

                      {/* Visual Teeth Arcadas */}
                      <div className="p-4 bg-slate-50/50 dark:bg-slate-955/20 border border-slate-200/20 dark:border-slate-800 rounded-2xl flex flex-col justify-center items-center gap-6 overflow-x-auto w-full">
                        {(() => {
                          const odontogram = getOdontogramData();
                          
                          const renderMiniToothBlock = (t, isLower = false) => {
                            const data = odontogram[t] || { faces: {}, conditions: [], observations: '', history: [] };
                            return (
                              <div 
                                key={t}
                                onClick={() => {
                                  setSelectedTooth(t);
                                  setActiveSubTab('odontograma');
                                }}
                                className="flex flex-col items-center p-1.5 rounded-xl border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/40 cursor-pointer transition-all active:scale-[0.93] shrink-0"
                              >
                                {!isLower && <ToothOutline number={t} conditions={data.conditions || []} />}
                                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 my-1">{t}</span>
                                {isLower && <ToothOutline number={t} conditions={data.conditions || []} />}
                              </div>
                            );
                          };

                          return arcadaType === 'permanentes' ? (
                            <div className="space-y-6 flex flex-col items-center min-w-[650px] w-full">
                              {/* Arcada Superior */}
                              <div className="flex flex-col items-center w-full">
                                <span className="text-[8px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-2">Arcada Superior</span>
                                <div className="flex gap-1 items-start justify-center w-full">
                                  {upperTeethRight.map(t => renderMiniToothBlock(t, false))}
                                  <div className="w-[2px] bg-slate-200/80 dark:bg-slate-800/80 h-16 mx-2 shrink-0 self-center" />
                                  {upperTeethLeft.map(t => renderMiniToothBlock(t, false))}
                                </div>
                              </div>
                              
                              <div className="w-full h-px bg-slate-200/40 dark:bg-slate-800/40" />

                              {/* Arcada Inferior */}
                              <div className="flex flex-col items-center w-full">
                                <div className="flex gap-1 items-start justify-center w-full">
                                  {lowerTeethRight.map(t => renderMiniToothBlock(t, true))}
                                  <div className="w-[2px] bg-slate-200/80 dark:bg-slate-800/80 h-16 mx-2 shrink-0 self-center" />
                                  {lowerTeethLeft.map(t => renderMiniToothBlock(t, true))}
                                </div>
                                <span className="text-[8px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest mt-3">Arcada Inferior</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6 flex flex-col items-center min-w-[500px] w-full">
                              {/* Decíduos Superior */}
                              <div className="flex flex-col items-center w-full">
                                <span className="text-[8px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest mb-2">Arcada Decídua Superior</span>
                                <div className="flex gap-1 items-start justify-center w-full">
                                  {upperTeethDecRight.map(t => renderMiniToothBlock(t, false))}
                                  <div className="w-[2px] bg-slate-200/80 dark:bg-slate-800/80 h-16 mx-2 shrink-0 self-center" />
                                  {upperTeethDecLeft.map(t => renderMiniToothBlock(t, false))}
                                </div>
                              </div>
                              
                              <div className="w-full h-px bg-slate-200/40 dark:bg-slate-800/40" />

                              {/* Decíduos Inferior */}
                              <div className="flex flex-col items-center w-full">
                                <div className="flex gap-1 items-start justify-center w-full">
                                  {lowerTeethDecRight.map(t => renderMiniToothBlock(t, true))}
                                  <div className="w-[2px] bg-slate-200/80 dark:bg-slate-800/80 h-16 mx-2 shrink-0 self-center" />
                                  {lowerTeethDecLeft.map(t => renderMiniToothBlock(t, true))}
                                </div>
                                <span className="text-[8px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest mt-3">Arcada Decídua Inferior</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Widget: Últimas Evoluções */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-855 dark:text-white font-title">
                          Últimas Evoluções
                        </h4>
                        <button
                          onClick={() => {
                            setActiveSubTab('evolucao');
                          }}
                          className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold rounded-xl flex items-center gap-1 transition-all active:scale-95 text-slate-500"
                        >
                          <Plus className="w-3 h-3" /> Adicionar
                        </button>
                      </div>

                      {/* Listar Evoluções */}
                      <div className="space-y-3.5">
                        {medicalRecords.filter(r => r.patient_id === selectedPatient.id && !r.is_adendo).slice(0, 2).map(rec => (
                          <div key={rec.id} className="p-3 bg-slate-50 dark:bg-black/15 border border-slate-200/30 dark:border-slate-800/40 rounded-xl space-y-1.5 text-left">
                            <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-relaxed">{rec.description}</p>
                            <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                              <span className="flex items-center gap-1">👤 Dr(a) {rec.dentistName || 'Dentista'} · 🕒 {new Date(rec.created_at).toLocaleDateString('pt-BR')}</span>
                              <span>🔑 HASH {rec.signature_hash ? rec.signature_hash.substring(0, 10) : '-'}</span>
                            </div>
                          </div>
                        ))}
                        {medicalRecords.filter(r => r.patient_id === selectedPatient.id && !r.is_adendo).length === 0 && (
                          <p className="text-[10px] text-slate-450 py-2 text-center font-bold">Nenhuma evolução lançada</p>
                        )}
                      </div>
                    </div>

                    {/* Widget: Histórico de Consultas */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-855 dark:text-white font-title">
                          Histórico de consultas
                        </h4>
                        <button
                          onClick={() => {
                            setActiveSubTab('consultas');
                          }}
                          className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold rounded-xl flex items-center gap-1 transition-all active:scale-95 text-slate-500"
                        >
                          <Plus className="w-3 h-3" /> Adicionar
                        </button>
                      </div>

                      {/* Listar Consultas */}
                      <div className="space-y-2.5">
                        {appointments.filter(a => a.patient_id === selectedPatient.id).slice(0, 2).map(app => (
                          <div key={app.id} className="p-3 bg-slate-50 dark:bg-black/15 border border-slate-200/30 dark:border-slate-800/40 rounded-xl flex items-center justify-between text-[10px] text-slate-500">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <div>
                                <span className="font-extrabold text-slate-800 dark:text-white">
                                  {new Date(app.start_time).toLocaleDateString('pt-BR')} às {new Date(app.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <p className="opacity-80 mt-0.5">Dentista: {dentists?.find(d => d.id === app.doctor_id)?.full_name || 'Jose'}</p>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold uppercase text-[8px] ${
                              app.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500' : ''
                            }`}>
                              {app.status === 'CONFIRMED' ? 'Confirmada' : 'Agendada'}
                            </span>
                          </div>
                        ))}
                        {appointments.filter(a => a.patient_id === selectedPatient.id).length === 0 && (
                          <p className="text-[10px] text-slate-450 py-2 text-center font-bold">Nenhum agendamento realizado</p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* ABA: ANAMNESES (QUESTIONÁRIO 23 PERGUNTAS)  */}
              {/* ========================================== */}
              {activeSubTab === 'anamnese' && (
                <div className="space-y-6 text-left animate-in fade-in">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 p-4 rounded-2xl gap-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-855 dark:text-white font-title uppercase tracking-wider flex items-center gap-1.5">
                        📝 Ficha de Anamnese Padrão
                      </h4>
                      <p className="text-[10px] text-slate-455 font-bold mt-1">Preencha o questionário completo do paciente para a integridade do prontuário.</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => alert(`Link de resposta enviado para o WhatsApp ${selectedPatient.phone}!`)}
                        className="px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" /> Enviar para paciente responder
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-650 dark:text-slate-355 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> Imprimir
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveAnamneseSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-[28px] p-6 space-y-6 text-xs text-slate-750 dark:text-slate-200 font-semibold">
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Queixa Principal *</label>
                      <input
                        type="text"
                        required
                        placeholder="Qual o principal motivo da consulta?..."
                        value={queixaPrincipal}
                        onChange={(e) => setQueixaPrincipal(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>

                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      
                      {/* Q2. Pressão Alta */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">1. Tem pressão alta?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="pressao_alta"
                                checked={hasPressaoAlta === opt}
                                onChange={() => setHasPressaoAlta(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasPressaoAlta === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva detalhes (medicação, controle)..."
                            value={hasPressaoAltaDetail}
                            onChange={(e) => setHasPressaoAltaDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q3. Alergia */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">2. Possui alguma alergia? (Medicamentos, látex, etc.)</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="alergia"
                                checked={hasAlergia === opt}
                                onChange={() => setHasAlergia(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasAlergia === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva a que tem alergia..."
                            value={hasAlergiaDetail}
                            onChange={(e) => setHasAlergiaDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q4. Alteração Sanguínea */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">3. Possui alguma alteração sanguínea?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="alt_sangue"
                                checked={hasAlteracaoSangue === opt}
                                onChange={() => setHasAlteracaoSangue(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasAlteracaoSangue === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva (Anemia, Leucemia, etc.)..."
                            value={hasAlteracaoSangueDetail}
                            onChange={(e) => setHasAlteracaoSangueDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q5. Hemorragia */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">4. Já teve hemorragia diagnosticada?</label>
                        <div className="flex gap-4 items-center mt-1">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="hemorragia"
                                checked={hasHemorragia === opt}
                                onChange={() => setHasHemorragia(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Q6. Alteração Cardiovascular */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">5. Possui alguma alteração cardiovascular?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="alt_cardio"
                                checked={hasAlteracaoCardio === opt}
                                onChange={() => setHasAlteracaoCardio(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasAlteracaoCardio === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva..."
                            value={hasAlteracaoCardioDetail}
                            onChange={(e) => setHasAlteracaoCardioDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q7. Diabetes */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">6. Possui diabetes?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="diabetes"
                                checked={hasDiabetes === opt}
                                onChange={() => setHasDiabetes(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasDiabetes === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva detalhes (Insulina, Glicemia)..."
                            value={hasDiabetesDetail}
                            onChange={(e) => setHasDiabetesDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q8. Asma */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">7. Possui asma?</label>
                        <div className="flex gap-4 items-center mt-1">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="asma"
                                checked={hasAsma === opt}
                                onChange={() => setHasAsma(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Q9. Xerostomia */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">8. Possui xerostomia?</label>
                        <div className="flex gap-4 items-center mt-1">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="xerostomia"
                                checked={hasXerostomia === opt}
                                onChange={() => setHasXerostomia(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Q10. Disfunção Hepática */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">9. Possui alguma disfunção hepática?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="disf_hepatica"
                                checked={hasDisfuncaoHepatica === opt}
                                onChange={() => setHasDisfuncaoHepatica(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasDisfuncaoHepatica === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva..."
                            value={hasDisfuncaoHepaticaDetail}
                            onChange={(e) => setHasDisfuncaoHepaticaDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q11. Disfunção Renal */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">10. Apresenta alguma disfunção renal?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="disf_renal"
                                checked={hasDisfuncaoRenal === opt}
                                onChange={() => setHasDisfuncaoRenal(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasDisfuncaoRenal === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva..."
                            value={hasDisfuncaoRenalDetail}
                            onChange={(e) => setHasDisfuncaoRenalDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q12. Disfunção Respiratória */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">11. Possui alguma disfunção respiratória?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="disf_resp"
                                checked={hasDisfuncaoRespiratoria === opt}
                                onChange={() => setHasDisfuncaoRespiratoria(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasDisfuncaoRespiratoria === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva..."
                            value={hasDisfuncaoRespiratoriaDetail}
                            onChange={(e) => setHasDisfuncaoRespiratoriaDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q13. Alteração Óssea */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">12. Possui alguma alteração ósea?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="alt_ossea"
                                checked={hasAlteracaoOssea === opt}
                                onChange={() => setHasAlteracaoOssea(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasAlteracaoOssea === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva..."
                            value={hasAlteracaoOsseaDetail}
                            onChange={(e) => setHasAlteracaoOsseaDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q14. Doença Transmissível */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">13. Possui alguma doença transmissível?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="doenca_trans"
                                checked={hasDoencaTransmissivel === opt}
                                onChange={() => setHasDoencaTransmissivel(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasDoencaTransmissivel === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva..."
                            value={hasDoencaTransmissivelDetail}
                            onChange={(e) => setHasDoencaTransmissivelDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q15. Outra Doença */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">14. Possui alguma outra doença/síndrome não mencionada?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="outra_doenca"
                                checked={hasOutraDoenca === opt}
                                onChange={() => setHasOutraDoenca(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasOutraDoenca === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva..."
                            value={hasOutraDoencaDetail}
                            onChange={(e) => setHasOutraDoencaDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q16. Reação Alérgica Anestesia */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">15. Já sofreu alguma reação alérgica ao receber anestesia?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="alergia_anestesia"
                                checked={hasAlergiaAnestesia === opt}
                                onChange={() => setHasAlergiaAnestesia(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {hasAlergiaAnestesia === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Descreva qual tipo de anestesia/reação..."
                            value={hasAlergiaAnestesiaDetail}
                            onChange={(e) => setHasAlergiaAnestesiaDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q17. Gastrite / Refluxo */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">16. Possui azia, má digestão, refluxo, úlcera ou gastrite?</label>
                        <div className="flex gap-4 items-center mt-1">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="gastrite"
                                checked={hasGastriteRefluxo === opt}
                                onChange={() => setHasGastriteRefluxo(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Q18. Dificuldade Abrir Boca */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">17. Tem dificuldade de abrir a boca?</label>
                        <div className="flex gap-4 items-center mt-1">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="dif_boca"
                                checked={hasDificuldadeBoca === opt}
                                onChange={() => setHasDificuldadeBoca(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Q19. Febre Reumática */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">18. Possui algum antecedente de febre reumática?</label>
                        <div className="flex gap-4 items-center mt-1">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="febre_reumatica"
                                checked={hasFebreReumatica === opt}
                                onChange={() => setHasFebreReumatica(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Q20. Estalo ao abrir a boca */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">19. Escuta algum estalo ao abrir a boca?</label>
                        <div className="flex gap-4 items-center mt-1">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="estalo_boca"
                                checked={hasEstaloBoca === opt}
                                onChange={() => setHasEstaloBoca(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Q21. Gestante (Feminino) */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">20. Está grávida?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="gestante"
                                checked={isGestante === opt}
                                onChange={() => setIsGestante(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {isGestante === 'Sim' && (
                          <input
                            type="text"
                            placeholder="De quantos meses?..."
                            value={isGestanteDetail}
                            onChange={(e) => setIsGestanteDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Q22. Amamentando */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">21. Está amamentando?</label>
                        <div className="flex gap-4 items-center mt-1">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="amamentando"
                                checked={isAmamentando === opt}
                                onChange={() => setIsAmamentando(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Q23. Anticoncepcional */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-slate-800 dark:text-white leading-normal">22. Toma anticoncepcional?</label>
                        <div className="flex gap-4 items-center">
                          {['Sim', 'Nao', 'Nao sei'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="anticoncepcional"
                                checked={isAnticoncepcional === opt}
                                onChange={() => setIsAnticoncepcional(opt)}
                                className="accent-secondary w-4 h-4"
                              />
                              <span>{opt === 'Nao' ? 'Não' : opt === 'Nao sei' ? 'Não sei' : opt}</span>
                            </label>
                          ))}
                        </div>
                        {isAnticoncepcional === 'Sim' && (
                          <input
                            type="text"
                            placeholder="Quais marcas/dosagens?..."
                            value={isAnticoncepcionalDetail}
                            onChange={(e) => setIsAnticoncepcionalDetail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>

                    </div>

                    <div className="space-y-1.5 border-t border-slate-150 dark:border-slate-800/80 pt-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Notas Clínicas e Observações Adicionais</label>
                      <textarea
                        rows={3.5}
                        placeholder="Histórico familiar, doenças hereditárias ou outras observações clínicas..."
                        value={anamneseNotes}
                        onChange={(e) => setAnamneseNotes(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary resize-none"
                      />
                    </div>

                    <div className="flex gap-2.5 justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-secondary text-white font-extrabold rounded-xl shadow-lg transition-all active:scale-[0.98] border border-white/5"
                        style={{ backgroundColor: currentTheme.secondary_color }}
                      >
                        Salvar respostas
                      </button>
                    </div>

                  </form>

                </div>
              )}

              {/* ========================================== */}
              {/* ABA: ORÇAMENTOS                           */}
              {/* ========================================== */}
              {activeSubTab === 'orcamentos' && (
                <div className="space-y-4 text-left animate-in fade-in">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
                    <div>
                      <h3 className="text-sm font-black text-slate-855 dark:text-white font-title">Orçamentos</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Nova criação de orçamento em desenvolvimento.')}
                      className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-white/10 shadow transition-all active:scale-95"
                      style={{ backgroundColor: currentTheme.secondary_color }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Criar orçamento
                    </button>
                  </div>

                  {showSerasaBanner && (
                    <div className="bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 flex gap-3 text-xs justify-between items-center animate-in fade-in">
                      <div className="flex gap-2.5 items-center">
                        <Sparkles className="w-4 h-4 text-sky-500" />
                        <p className="font-semibold text-slate-700 dark:text-slate-350">
                          Reduza o risco de inadimplência: Utilize a ferramenta de consulta ao Serasa para analisar o score e pendências do seu paciente! <a href="#serasa" className="text-secondary underline font-bold" style={{ color: currentTheme.secondary_color }}>Consulte agora.</a>
                        </p>
                      </div>
                      <button onClick={() => setShowSerasaBanner(false)} className="text-slate-400 hover:text-slate-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="p-4 bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/10 rounded-2xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-500" />
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">Plano de tratamento de {selectedPatient.name}</h4>
                        <span className="text-[10px] text-slate-450 font-bold block mt-0.5">13/07/2026 • #3323760</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs">R$ 1.083,00</span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase flex items-center gap-0.5">
                        ✓ Aprovado
                      </span>
                      <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* ABA: ODONTOGRAMA                           */}
              {/* ========================================== */}
              {activeSubTab === 'odontograma' && (() => {
                const odontogram = getOdontogramData();
                const selectedToothData = odontogram[selectedTooth] || { faces: {}, conditions: [], observations: '', history: [] };
                const conditionCounts = getConditionCounts();
                
                const tools = [
                  { id: 'Cárie', label: 'Cárie', color: 'bg-red-500' },
                  { id: 'Restauração Resina', label: 'Restauração Resina', color: 'bg-blue-500' },
                  { id: 'Restauração Amálgama', label: 'Restauração Amálgama', color: 'bg-slate-500' },
                  { id: 'Coroa', label: 'Coroa', color: 'bg-yellow-500' },
                  { id: 'Faceta', label: 'Faceta', color: 'bg-purple-500' },
                  { id: 'Implante', label: 'Implante', color: 'bg-indigo-500' },
                  { id: 'Endodontia', label: 'Endodontia', color: 'bg-emerald-500' },
                  { id: 'Selante', label: 'Selante', color: 'bg-cyan-500' },
                  { id: 'Extraído', label: 'Extraído', color: 'bg-black dark:bg-white' },
                  { id: 'Ausente', label: 'Ausente', color: 'border border-dashed border-slate-400 dark:border-slate-500' },
                  { id: 'Fratura', label: 'Fratura', color: 'bg-orange-500' },
                  { id: 'Lesão Cervical', label: 'Lesão Cervical', color: 'bg-amber-800' },
                  { id: 'Outros / Obs.', label: 'Outros / Obs.', color: 'bg-teal-500' },
                  { id: 'Saudável', label: 'Saudável', color: 'bg-emerald-400' }
                ];

                const renderToothBlock = (t) => {
                  const data = odontogram[t] || { faces: {}, conditions: [], observations: '', history: [] };
                  const isSelected = selectedTooth === t;
                  
                  return (
                    <div 
                      key={t}
                      onClick={() => handleToothOutlineClick(t)}
                      className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/10 shadow-sm ring-1 ring-blue-500/20' 
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      <ToothOutline number={t} conditions={data.conditions || []} />
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 my-1">{t}</span>
                      <FaceGrid 
                        toothNumber={t} 
                        facesState={data.faces || {}} 
                        onFaceClick={(faceName) => handleFaceClick(t, faceName)} 
                      />
                    </div>
                  );
                };

                return (
                  <div className="space-y-6 text-left animate-in fade-in">
                    <div className="flex flex-col lg:flex-row gap-6">
                      
                      {/* COLUNA 1: FERRAMENTAS CLÍNICAS */}
                      <div className="w-full lg:w-52 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-[28px] p-5 flex flex-col justify-between shadow-sm shrink-0">
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Marcações</h4>
                          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
                            {tools.map(tool => {
                              const isActive = activeTool === tool.id;
                              return (
                                <button
                                  key={tool.id}
                                  type="button"
                                  onClick={() => setActiveTool(tool.id)}
                                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all active:scale-[0.98] border text-left ${
                                    isActive 
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-sm ring-1 ring-slate-400/10' 
                                      : 'bg-transparent text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/45'
                                  }`}
                                >
                                  <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${tool.color}`} />
                                  <span className="truncate">{tool.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                          <button
                            type="button"
                            onClick={handleUndo}
                            disabled={historyUndoStack.length === 0}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                          >
                            <Undo className="w-3.5 h-3.5" /> Desfazer
                          </button>
                          <button
                            type="button"
                            onClick={handleClearAll}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-red-500/10 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-500/20 text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Limpar
                          </button>
                        </div>
                      </div>

                      {/* COLUNA 2: ARCADA DENTÁRIA CENTRAL */}
                      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-[28px] p-6 flex flex-col justify-start gap-4 shadow-sm relative overflow-hidden min-w-0">
                        {/* Seletor de Arcada */}
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Arcada FDI</h4>
                          <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/40 dark:border-slate-800">
                            {['permanentes', 'deciduos'].map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setArcadaType(type)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                                  arcadaType === type 
                                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                                    : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rendering do Odontograma */}
                        <div className="flex flex-col gap-6 py-4 overflow-x-auto w-full items-center">
                          {arcadaType === 'permanentes' ? (
                            <div className="space-y-8 flex flex-col items-center min-w-[650px] w-full">
                              
                              {/* Arcada Superior */}
                              <div className="flex flex-col items-center w-full">
                                <span className="text-[9px] font-black text-slate-350 dark:text-slate-600 uppercase tracking-widest mb-3">Arcada Superior</span>
                                <div className="flex gap-1 items-start justify-center w-full">
                                  {upperTeethRight.map(t => renderToothBlock(t))}
                                  <div className="w-[2px] bg-slate-200/80 dark:bg-slate-800/80 h-28 mx-2 shrink-0 self-center" />
                                  {upperTeethLeft.map(t => renderToothBlock(t))}
                                </div>
                              </div>
                              
                              {/* Divider horizontal suave */}
                              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/40" />
                              
                              {/* Arcada Inferior */}
                              <div className="flex flex-col items-center w-full">
                                <div className="flex gap-1 items-start justify-center w-full">
                                  {lowerTeethRight.map(t => {
                                    const data = odontogram[t] || { faces: {}, conditions: [], observations: '', history: [] };
                                    const isSelected = selectedTooth === t;
                                    return (
                                      <div 
                                        key={t}
                                        onClick={() => handleToothOutlineClick(t)}
                                        className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                                          isSelected 
                                            ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/10 shadow-sm ring-1 ring-blue-500/20' 
                                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                                        }`}
                                      >
                                        <FaceGrid 
                                          toothNumber={t} 
                                          facesState={data.faces || {}} 
                                          onFaceClick={(faceName) => handleFaceClick(t, faceName)} 
                                        />
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 my-1">{t}</span>
                                        <ToothOutline number={t} conditions={data.conditions || []} />
                                      </div>
                                    );
                                  })}
                                  <div className="w-[2px] bg-slate-200/80 dark:bg-slate-800/80 h-28 mx-2 shrink-0 self-center" />
                                  {lowerTeethLeft.map(t => {
                                    const data = odontogram[t] || { faces: {}, conditions: [], observations: '', history: [] };
                                    const isSelected = selectedTooth === t;
                                    return (
                                      <div 
                                        key={t}
                                        onClick={() => handleToothOutlineClick(t)}
                                        className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                                          isSelected 
                                            ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/10 shadow-sm ring-1 ring-blue-500/20' 
                                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                                        }`}
                                      >
                                        <FaceGrid 
                                          toothNumber={t} 
                                          facesState={data.faces || {}} 
                                          onFaceClick={(faceName) => handleFaceClick(t, faceName)} 
                                        />
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 my-1">{t}</span>
                                        <ToothOutline number={t} conditions={data.conditions || []} />
                                      </div>
                                    );
                                  })}
                                </div>
                                <span className="text-[9px] font-black text-slate-350 dark:text-slate-600 uppercase tracking-widest mt-4">Arcada Inferior</span>
                              </div>

                            </div>
                          ) : (
                            <div className="space-y-8 flex flex-col items-center min-w-[500px] w-full">
                              {/* Decíduos Superior */}
                              <div className="flex flex-col items-center w-full">
                                <span className="text-[9px] font-black text-slate-350 dark:text-slate-600 uppercase tracking-widest mb-3">Arcada Decídua Superior</span>
                                <div className="flex gap-1 items-start justify-center w-full">
                                  {upperTeethDecRight.map(t => renderToothBlock(t))}
                                  <div className="w-[2px] bg-slate-200/80 dark:bg-slate-800/80 h-28 mx-2 shrink-0 self-center" />
                                  {upperTeethDecLeft.map(t => renderToothBlock(t))}
                                </div>
                              </div>
                              
                              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/40" />

                              {/* Decíduos Inferior */}
                              <div className="flex flex-col items-center w-full">
                                <div className="flex gap-1 items-start justify-center w-full">
                                  {lowerTeethDecRight.map(t => {
                                    const data = odontogram[t] || { faces: {}, conditions: [], observations: '', history: [] };
                                    const isSelected = selectedTooth === t;
                                    return (
                                      <div 
                                        key={t}
                                        onClick={() => handleToothOutlineClick(t)}
                                        className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                                          isSelected 
                                            ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/10 shadow-sm ring-1 ring-blue-500/20' 
                                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                                        }`}
                                      >
                                        <FaceGrid 
                                          toothNumber={t} 
                                          facesState={data.faces || {}} 
                                          onFaceClick={(faceName) => handleFaceClick(t, faceName)} 
                                        />
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 my-1">{t}</span>
                                        <ToothOutline number={t} conditions={data.conditions || []} />
                                      </div>
                                    );
                                  })}
                                  <div className="w-[2px] bg-slate-200/80 dark:bg-slate-800/80 h-28 mx-2 shrink-0 self-center" />
                                  {lowerTeethDecLeft.map(t => {
                                    const data = odontogram[t] || { faces: {}, conditions: [], observations: '', history: [] };
                                    const isSelected = selectedTooth === t;
                                    return (
                                      <div 
                                        key={t}
                                        onClick={() => handleToothOutlineClick(t)}
                                        className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                                          isSelected 
                                            ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/10 shadow-sm ring-1 ring-blue-500/20' 
                                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                                        }`}
                                      >
                                        <FaceGrid 
                                          toothNumber={t} 
                                          facesState={data.faces || {}} 
                                          onFaceClick={(faceName) => handleFaceClick(t, faceName)} 
                                        />
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 my-1">{t}</span>
                                        <ToothOutline number={t} conditions={data.conditions || []} />
                                      </div>
                                    );
                                  })}
                                </div>
                                <span className="text-[9px] font-black text-slate-355 dark:text-slate-600 uppercase tracking-widest mt-4">Arcada Decídua Inferior</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* COLUNA 3: DETALHES DO DENTE SELECIONADO */}
                      <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-[28px] p-5 flex flex-col space-y-4 shadow-sm shrink-0">
                        {selectedTooth ? (
                          <>
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
                              <h3 className="text-sm font-black text-slate-800 dark:text-white font-title">Dente {selectedTooth}</h3>
                              <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg uppercase">FDI</span>
                            </div>

                            {/* Circular face diagram zoomed-in */}
                            <div className="flex flex-col items-center justify-center p-6 border border-slate-200/30 dark:border-slate-800/40 bg-slate-50/30 dark:bg-slate-950/20 rounded-2xl relative">
                              <div className="scale-125 py-2">
                                <FaceGrid 
                                  toothNumber={selectedTooth} 
                                  facesState={selectedToothData.faces || {}} 
                                  onFaceClick={(faceName) => handleFaceClick(selectedTooth, faceName)} 
                                />
                              </div>
                              <span className="text-[9px] text-slate-400 font-extrabold mt-3 uppercase tracking-wider">Clique para pintar faces</span>
                            </div>

                            {/* Condições Ativas do Dente */}
                            <div className="space-y-2 text-left">
                              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Condições Ativas</label>
                              <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-slate-50/50 dark:bg-slate-955/20 border border-slate-200/30 dark:border-slate-800/60 rounded-xl">
                                {(selectedToothData.conditions || []).filter(c => c !== 'Saudável').length > 0 ? (
                                  (selectedToothData.conditions || []).filter(c => c !== 'Saudável').map(cond => (
                                    <span 
                                      key={cond}
                                      className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-750"
                                    >
                                      {cond}
                                      <button 
                                        type="button" 
                                        onClick={() => handleRemoveCondition(cond)} 
                                        className="text-slate-400 hover:text-red-500 font-black text-xs ml-0.5 focus:outline-none"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400 py-1 px-1 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" /> Saudável / Sem alterações
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Campo de Observações do Dente */}
                            <div className="space-y-1.5 text-left flex-1 flex flex-col">
                              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Observações</label>
                              <textarea
                                key={selectedTooth} 
                                defaultValue={selectedToothData.observations || ''}
                                onBlur={(e) => handleSaveObservation(e.target.value)}
                                placeholder="Notas clínicas, sintomas, histórico de dor, etc."
                                className="w-full flex-1 min-h-[80px] bg-slate-50/50 dark:bg-slate-955/20 border border-slate-200/40 dark:border-slate-800/80 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                              />
                              <span className="text-[9px] text-slate-400 font-medium self-end mt-1">Salva automaticamente ao sair do campo.</span>
                            </div>

                            {/* Histórico local do dente */}
                            <div className="space-y-1.5 text-left border-t border-slate-100 dark:border-slate-800/60 pt-3">
                              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Histórico do Dente</label>
                              <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                                {(selectedToothData.history || []).length > 0 ? (
                                  (selectedToothData.history || []).slice().reverse().map((item, idx) => (
                                    <div key={idx} className="text-[9px] leading-relaxed border-l-2 border-slate-200 dark:border-slate-700 pl-2 py-0.5">
                                      <span className="font-extrabold text-slate-800 dark:text-slate-300 block">{item.text}</span>
                                      <span className="text-slate-400 font-semibold">{new Date(item.date).toLocaleDateString('pt-BR')} • {item.user}</span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-[9px] font-semibold text-slate-400 block py-1">Sem registro de eventos anteriores.</span>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                            <HelpCircle className="w-10 h-10 animate-pulse mb-2 text-slate-350 dark:text-slate-700" />
                            <h5 className="text-xs font-bold text-slate-650 dark:text-slate-300">Nenhum dente selecionado</h5>
                            <p className="text-[10px] mt-1">Selecione um dente na arcada central para ver detalhes ou registrar observações específicas.</p>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* BARRA INFERIOR: LEGENDA RÁPIDA E TOTAIS */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-[28px] p-5 shadow-sm">
                      <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3.5 text-left">Resumo do Odontograma (Legenda Rápida)</h4>
                      <div className="flex flex-wrap gap-4">
                        {[
                          { label: 'Saudável', count: conditionCounts['Saudável'], color: 'bg-emerald-400' },
                          { label: 'Cárie', count: conditionCounts['Cárie'], color: 'bg-red-500' },
                          { label: 'Restauração Resina', count: conditionCounts['Restauração Resina'], color: 'bg-blue-500' },
                          { label: 'Restauração Amálgama', count: conditionCounts['Restauração Amálgama'], color: 'bg-slate-500' },
                          { label: 'Coroa', count: conditionCounts['Coroa'], color: 'bg-yellow-500' },
                          { label: 'Faceta', count: conditionCounts['Faceta'], color: 'bg-purple-500' },
                          { label: 'Implante', count: conditionCounts['Implante'], color: 'bg-indigo-500' },
                          { label: 'Endodontia', count: conditionCounts['Endodontia'], color: 'bg-emerald-500' },
                          { label: 'Selante', count: conditionCounts['Selante'], color: 'bg-cyan-500' },
                          { label: 'Extraído', count: conditionCounts['Extraído'], color: 'bg-black dark:bg-white' },
                          { label: 'Ausente', count: conditionCounts['Ausente'], color: 'border border-dashed border-slate-400 dark:border-slate-500' },
                          { label: 'Fratura', count: conditionCounts['Fratura'], color: 'bg-orange-500' },
                          { label: 'Lesão Cervical', count: conditionCounts['Lesão Cervical'], color: 'bg-amber-800' },
                          { label: 'Outros / Obs.', count: conditionCounts['Outros / Obs.'], color: 'bg-teal-500' }
                        ].map(item => (
                          <div 
                            key={item.label}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300"
                          >
                            <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${item.color}`} />
                            <span>{item.label}:</span>
                            <span className="font-extrabold text-slate-850 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 min-w-[20px] text-center">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* ========================================== */}
              {/* ABA: PAGAMENTOS (CARDS DE TOTAIS E FILTROS) */}
              {/* ========================================== */}
              {activeSubTab === 'pagamentos' && (
                <div className="space-y-6 text-left animate-in fade-in">
                  
                  {/* Top summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Total Pago Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 p-5 rounded-2xl flex justify-between items-center shadow-sm">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block">Total pago</span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        ✓
                      </div>
                    </div>

                    {/* A receber Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 p-5 rounded-2xl flex justify-between items-center shadow-sm">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block">A receber</span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">R$ {totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                        ↘
                      </div>
                    </div>
                  </div>

                  {/* Filters row */}
                  <div className="flex gap-2.5 flex-wrap items-center bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm text-xs font-semibold">
                    <button className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold">
                      📅 Selecionar período
                    </button>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/40 dark:border-slate-800/80 gap-1 pl-1">
                      {['Todos', 'Pagos', 'Aguardando', 'Em aberto', 'Em atraso'].map(pill => (
                        <button
                          key={pill}
                          onClick={() => setPayFilter(pill)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            payFilter === pill
                              ? 'bg-white dark:bg-slate-750 text-slate-855 dark:text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-350'
                          }`}
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instalments list */}
                  <div className="space-y-3">
                    {activeInstallments
                      .filter(i => {
                        if (payFilter === 'Pagos') return i.status === 'PAGO';
                        if (payFilter === 'Em aberto') return i.status === 'ABERTO';
                        if (payFilter === 'Em atraso') return i.status === 'ATRASO';
                        return true;
                      })
                      .map(item => (
                        <div key={item.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-sm text-xs">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" className="rounded w-4 h-4 cursor-pointer" />
                            <div>
                              <h4 className="font-extrabold text-slate-855 dark:text-white flex items-center gap-1.5">
                                {item.desc}
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-bold uppercase">{item.number}</span>
                              </h4>
                              <span className="text-[10px] text-slate-450 font-bold block mt-1">Vence em {item.due} • {item.orc}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 pl-7 sm:pl-0">
                            {item.status !== 'PAGO' && (
                              <button
                                onClick={() => handlePayInstallment(item.id)}
                                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 text-[10px] font-black rounded-lg transition-all bg-white dark:bg-slate-800 shadow-sm"
                              >
                                💵 Pagar
                              </button>
                            )}

                            <span className={`px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold uppercase text-[9px] ${
                              item.status === 'ATRASO' ? 'bg-red-500/10 text-red-500' :
                              item.status === 'PAGO' ? 'bg-emerald-500/10 text-emerald-500' : ''
                            }`}>
                              {item.status === 'ATRASO' ? '× Em atraso' : item.status === 'PAGO' ? '✓ Pago' : '• Em aberto'}
                            </span>

                            <span className="font-extrabold text-slate-855 dark:text-white text-xs">R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
                          </div>
                        </div>
                      ))}
                  </div>

                </div>
              )}

              {/* ========================================== */}
              {/* ABA: EVOLUÇÕES (RICH TEXT E HISTÓRICO)     */}
              {/* ========================================== */}
              {activeSubTab === 'evolucao' && (() => {
                const patEvolutions = medicalRecords.filter(r => r.patient_id === selectedPatient.id && !r.is_adendo);
                return (
                  <div className="space-y-6 text-left animate-in fade-in">
                    
                    {/* Header selectors */}
                    <div className="flex gap-3 flex-wrap items-center bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm text-xs font-semibold">
                      <select 
                        value={evolucaoDentist} 
                        onChange={(e) => setEvolucaoDentist(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl py-1.5 px-3 focus:outline-none"
                      >
                        {dentists.map(d => (
                          <option key={d.id} value={d.full_name}>{d.full_name}</option>
                        ))}
                      </select>

                      <input 
                        type="date" 
                        value={evolucaoDate} 
                        onChange={(e) => setEvolucaoDate(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl py-1.5 px-3 focus:outline-none"
                      />
                    </div>

                    {/* Editor Form */}
                    <form onSubmit={handleAddRecordSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-[28px] p-6 shadow-sm space-y-4">
                      
                      {/* Editor Toolbar */}
                      <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                        <button type="button" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><Bold className="w-4 h-4" /></button>
                        <button type="button" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><Italic className="w-4 h-4" /></button>
                        <button type="button" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><Link2 className="w-4 h-4" /></button>
                        <div className="w-px bg-slate-200 dark:bg-slate-800 h-4 mx-1" />
                        <button type="button" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><AlignLeft className="w-4 h-4" /></button>
                        <button type="button" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><AlignCenter className="w-4 h-4" /></button>
                        <button type="button" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><AlignRight className="w-4 h-4" /></button>
                        <div className="w-px bg-slate-200 dark:bg-slate-800 h-4 mx-1" />
                        <button type="button" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><List className="w-4 h-4" /></button>
                        <div className="w-px bg-slate-200 dark:bg-slate-800 h-4 mx-1" />
                        <button type="button" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><Undo className="w-4 h-4" /></button>
                        <button type="button" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><Redo className="w-4 h-4" /></button>
                      </div>

                      {/* Textarea */}
                      <textarea
                        rows={8}
                        required
                        value={newRecordText}
                        onChange={(e) => setNewRecordText(e.target.value)}
                        placeholder="Descreva a evolução do tratamento desse paciente."
                        className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-xs text-slate-800 dark:text-white leading-relaxed resize-none font-sans"
                      />

                      {/* Add Image line */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-extrabold cursor-pointer hover:text-slate-200 w-fit">
                        <ImageIcon className="w-4 h-4" />
                        <span>Adicionar imagem <span className="opacity-60">0/20</span></span>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="px-3.5 py-2 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-black rounded-xl flex items-center gap-1 transition-all"
                          >
                            🎤 Transcrever com IA
                          </button>
                          <button
                            type="button"
                            onClick={handleAiImproveRecord}
                            disabled={!newRecordText}
                            className="px-3.5 py-2 bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 text-[10px] font-black rounded-xl flex items-center gap-1 transition-all disabled:opacity-50"
                          >
                            ✨ Melhorar com IA
                          </button>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          {/* Toggle switch: Assinar evolução */}
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                checked={isEvolucaoSigned} 
                                onChange={(e) => setIsEvolucaoSigned(e.target.checked)}
                                className="sr-only" 
                              />
                              <div className={`w-8 h-4 rounded-full transition-colors ${isEvolucaoSigned ? 'bg-secondary' : 'bg-slate-200 dark:bg-slate-800'}`} style={isEvolucaoSigned ? { backgroundColor: currentTheme.secondary_color } : {}}></div>
                              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isEvolucaoSigned ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <span className="text-[10px] font-black text-slate-450 uppercase">Assinar evolução</span>
                          </label>

                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-secondary text-white font-extrabold rounded-xl shadow transition-all active:scale-95"
                            style={{ backgroundColor: currentTheme.secondary_color }}
                          >
                            💾 Salvar evolução
                          </button>
                        </div>
                      </div>

                    </form>

                    {/* History lists */}
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-855 dark:text-white font-title">
                          Histórico <span className="ml-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-bold text-slate-500">{patEvolutions.length}</span>
                        </h4>
                        
                        <div className="flex gap-2">
                          <button className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-[10px] font-bold rounded-xl shadow-sm">
                            ✒️ Assinar digitalmente
                          </button>
                          <button className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-[10px] font-bold rounded-xl shadow-sm">
                            🖨️ Imprimir
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3.5 pl-4 border-l border-slate-200 dark:border-slate-800">
                        {patEvolutions.map(rec => (
                          <div key={rec.id} className="relative group text-xs text-left">
                            <span className="absolute -left-[21.5px] top-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white dark:border-slate-950" style={{ backgroundColor: currentTheme.secondary_color }} />
                            <div className="flex justify-between items-center text-[9px] text-slate-450 font-bold mb-1 uppercase tracking-wider">
                              <span>Dr(a). {rec.dentistName || 'Dentista'}</span>
                              <span>{new Date(rec.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-2">
                              <p className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{rec.description}</p>
                              {rec.signature_hash && (
                                <div className="text-[8px] text-emerald-500 font-mono flex items-center gap-1">
                                  🛡️ ASSINATURA ELETRÔNICA CFO: {rec.signature_hash}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* ========================================== */}
              {/* ABA: DOCUMENTOS                           */}
              {/* ========================================== */}
              {activeSubTab === 'documentos' && (() => {
                const patientPrescriptions = prescriptions.filter(p => p.patient_id === selectedPatient.id);
                return (
                  <div className="space-y-6 text-left animate-in fade-in">
                    
                    {/* Action buttons row */}
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => setShowAddPresc(true)}
                        className="px-4 py-2.5 bg-secondary text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm border border-white/5 hover:opacity-95"
                        style={{ backgroundColor: currentTheme.secondary_color }}
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Prescrição inteligente
                      </button>
                      
                      <button
                        onClick={() => setShowAddPresc(true)}
                        className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
                      >
                        Emitir prescrição
                      </button>

                      <button
                        onClick={() => {
                          setPNotes(selectedHistory.notes);
                          setShowAddPresc(true);
                        }}
                        className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
                      >
                        Emitir atestado
                      </button>

                      <button
                        onClick={() => alert('Personalização de templates em desenvolvimento.')}
                        className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all ml-auto"
                      >
                        Customizar
                      </button>
                    </div>

                    {showCadastroBanner && (
                      <div className="bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 flex gap-3 text-xs justify-between items-center animate-in fade-in">
                        <div className="flex gap-2.5 items-center">
                          <AlertCircle className="w-4 h-4 text-sky-500" />
                          <p className="font-semibold text-slate-700 dark:text-slate-350">
                            Antes de gerar receitas e atestados complete as <button onClick={openEditModal} className="text-secondary underline font-bold" style={{ color: currentTheme.secondary_color }}>informações de cadastro.</button>
                          </p>
                        </div>
                        <button onClick={() => setShowCadastroBanner(false)} className="text-slate-400 hover:text-slate-200">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Empty State or Table */}
                    {patientPrescriptions.length === 0 ? (
                      <div className="py-16 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-[28px] flex flex-col items-center justify-center space-y-4 text-slate-400 select-none shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-3xl border border-slate-100">
                          📄
                        </div>
                        <h4 className="font-title font-bold text-slate-700 dark:text-slate-300 text-xs">Ainda não existem documentos por aqui</h4>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-[24px] overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-955/30 text-slate-500 border-b border-slate-200/40 dark:border-slate-800/80 font-bold">
                              <th className="py-3.5 px-4">Data</th>
                              <th className="py-3.5 px-4">Título</th>
                              <th className="py-3.5 px-4">Dentista</th>
                              <th className="py-3.5 px-4">Código Assinatura</th>
                              <th className="py-3.5 px-4 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-350">
                            {patientPrescriptions.map(p => (
                              <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                <td className="py-3.5 px-4 font-semibold">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                                <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-white">{p.title}</td>
                                <td className="py-3.5 px-4 font-semibold">{p.dentistName}</td>
                                <td className="py-3.5 px-4 font-mono text-[9px] text-slate-400 select-all" title={p.signature_hash}>
                                  🔒 SIGN: {p.signature_hash.substring(0, 12)}...
                                </td>
                                <td className="py-3.5 px-4 text-right flex justify-end gap-1.5">
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
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ========================================== */}
              {/* ABA: ARQUIVOS                             */}
              {/* ========================================== */}
              {activeSubTab === 'arquivos' && (
                <div className="space-y-6 text-left animate-in fade-in">
                  
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Image className="w-4 h-4 text-secondary" /> Galeria de Fotos Clínicas
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { id: 1, title: 'Sorriso Inicial', date: '2026-06-01', url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
                        { id: 2, title: 'Sorriso Final', date: '2026-07-14', url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=150&auto=format&fit=crop&q=60' }
                      ].map(photo => (
                        <div key={photo.id} className="group relative rounded-2xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden bg-white dark:bg-slate-900 p-2 shadow-sm">
                          <img src={photo.url} alt={photo.title} className="w-full h-28 object-cover rounded-xl" />
                          <div className="mt-2 text-[10px]">
                            <h5 className="font-bold text-slate-700 dark:text-slate-350 truncate">{photo.title}</h5>
                            <span className="text-slate-400 font-semibold">{photo.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-5 border-t border-slate-250/20 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-4 h-4 text-secondary" /> Exames e Radiografias (PDF/Imagens)
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-xs shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-5 h-5 text-red-500" />
                          <div>
                            <h5 className="font-bold">Radiografia_Panoramica_Completa.pdf</h5>
                            <span className="text-[10px] text-slate-450 font-bold block">2.4 MB • Emitido em 01/06/2026</span>
                          </div>
                        </div>
                        <button className="text-[10px] text-secondary font-bold hover:underline" style={{ color: currentTheme.secondary_color }}>Download</button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3 select-none">
            <User className="w-12 h-12 text-slate-300 stroke-1" />
            <h4 className="font-title font-bold text-slate-700 dark:text-slate-300 text-sm">Prontuário Odontológico</h4>
            <p className="text-xs max-w-xs text-center leading-relaxed">Selecione um paciente na lista lateral para visualizar sua ficha clínica, odontograma interativo e histórico.</p>
            <button
              onClick={() => setShowAddPatient(true)}
              className="px-4 py-2 bg-emerald-650 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center gap-1.5 mt-2 border border-white/5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Novo Paciente</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADICIONAR PACIENTE                                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddPatient && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left text-slate-855 dark:text-white"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-title">Cadastrar Novo Paciente</h3>
                <button 
                  onClick={() => setShowAddPatient(false)}
                  className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddPatientSubmit} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome do paciente"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">WhatsApp / Celular *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: 88999699232"
                      value={pPhone}
                      onChange={(e) => setPPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">E-mail</label>
                    <input
                      type="email"
                      placeholder="exemplo@gmail.com"
                      value={pEmail}
                      onChange={(e) => setPEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={pCPF}
                      onChange={(e) => setPCPF(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">RG</label>
                    <input
                      type="text"
                      placeholder="00.000.000-0"
                      value={pRG}
                      onChange={(e) => setPRG(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={pBirthDate}
                      onChange={(e) => setPBirthDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Gênero</label>
                    <select
                      value={pGender}
                      onChange={(e) => setPGender(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Pref. Lembretes</label>
                    <select
                      value={pReminderPref}
                      onChange={(e) => setPReminderPref(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="SMS">SMS</option>
                      <option value="Email">Email</option>
                      <option value="Nao receber">Não receber</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
                    value={pAddress}
                    onChange={(e) => setPAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Notas Clínicas Iniciais</label>
                  <textarea
                    placeholder="Alguma anotação sobre o paciente..."
                    value={pNotes}
                    onChange={(e) => setPNotes(e.target.value)}
                    className="w-full h-20 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-200/50 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddPatient(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-secondary text-white font-extrabold rounded-xl shadow"
                    style={{ backgroundColor: currentTheme.secondary_color }}
                  >
                    Registrar Paciente
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: EDITAR PACIENTE                                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showEditPatient && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left text-slate-855 dark:text-white"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-title">Editar Dados do Paciente</h3>
                <button 
                  onClick={() => setShowEditPatient(false)}
                  className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditPatientSubmit} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">WhatsApp / Celular *</label>
                    <input
                      type="text"
                      required
                      value={pPhone}
                      onChange={(e) => setPPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">E-mail</label>
                    <input
                      type="email"
                      value={pEmail}
                      onChange={(e) => setPEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">CPF</label>
                    <input
                      type="text"
                      value={pCPF}
                      onChange={(e) => setPCPF(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">RG</label>
                    <input
                      type="text"
                      value={pRG}
                      onChange={(e) => setPRG(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={pBirthDate}
                      onChange={(e) => setPBirthDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Gênero</label>
                    <select
                      value={pGender}
                      onChange={(e) => setPGender(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Pref. Lembretes</label>
                    <select
                      value={pReminderPref}
                      onChange={(e) => setPReminderPref(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="SMS">SMS</option>
                      <option value="Email">Email</option>
                      <option value="Nao receber">Não receber</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    value={pAddress}
                    onChange={(e) => setPAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Notas Clínicas</label>
                  <textarea
                    value={pNotes}
                    onChange={(e) => setPNotes(e.target.value)}
                    className="w-full h-20 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-200/50 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditPatient(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-secondary text-white font-extrabold rounded-xl shadow"
                    style={{ backgroundColor: currentTheme.secondary_color }}
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: EMITIR PRESCRIÇÃO DIGITAL                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddPresc && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left text-slate-855 dark:text-white"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-title">Emitir Prescrição Digital</h3>
                <button 
                  onClick={() => setShowAddPresc(false)}
                  className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddPrescSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Modelo de Documento</label>
                  <select
                    value={selectedPrescTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none font-mono resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendViaWa"
                    checked={sendViaWa}
                    onChange={(e) => setSendViaWa(e.target.checked)}
                    className="rounded border-slate-350 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="sendViaWa" className="text-xs font-bold text-slate-450 cursor-pointer select-none">
                    Enviar PDF por WhatsApp automaticamente
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-200/50 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddPresc(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-secondary text-white font-extrabold rounded-xl shadow"
                    style={{ backgroundColor: currentTheme.secondary_color }}
                  >
                    Emitir e Assinar Documento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: VISUALIZAR DOCUMENTO EMITIDO                                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {viewingPrescription && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-[32px] max-w-xl w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-left space-y-6 text-slate-855 dark:text-white"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[9px] bg-sky-500/10 text-sky-500 font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">Documento Assinado</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-title mt-1">{viewingPrescription.title}</h3>
                </div>
                <button 
                  onClick={() => setViewingPrescription(null)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-inner text-slate-800 dark:text-slate-200">
                <div className="flex justify-between items-start pb-4 border-b border-slate-200/40 dark:border-slate-800/60">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black font-title text-slate-900 dark:text-white uppercase tracking-wider">{clinic?.name || 'FlowDent Clinic'}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block">INTEGRIDADE CLÍNICA • CFO</span>
                  </div>
                  <span className="text-xl">🦷</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 font-bold uppercase block">Paciente</span>
                    <span className="font-extrabold text-slate-800 dark:text-white text-xs">{selectedPatient?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-bold uppercase block">Data de Emissão</span>
                    <span className="font-extrabold text-slate-855 dark:text-white text-xs">
                      {new Date(viewingPrescription.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="min-h-[140px] text-xs font-semibold leading-relaxed font-mono whitespace-pre-wrap py-2 border-b border-slate-200/40 dark:border-slate-800/60">
                  {viewingPrescription.description}
                </div>

                <div className="flex justify-between items-center gap-4 pt-2">
                  <div className="space-y-2 flex-1">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-450 font-bold uppercase block">Assinante</span>
                      <span className="font-extrabold text-xs text-slate-800 dark:text-white">{viewingPrescription.dentistName || 'Dentista'}</span>
                      <span className="text-[9px] text-slate-400 block font-semibold">Cirurgião-Dentista</span>
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

                  <div className="flex flex-col items-center gap-1.5 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex-shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`https://flowdent.com.br/verificar?hash=${viewingPrescription.signature_hash}`)}`} 
                      alt="QR Code" 
                      className="w-[60px] h-[60px]"
                    />
                    <span className="text-[7px] text-slate-450 font-bold uppercase tracking-wider">E-VALIDAR</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-355 font-bold text-xs rounded-xl transition-all"
                >
                  Imprimir
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

const ToothOutline = ({ number, conditions }) => {
  const isMolar = [18, 17, 16, 26, 27, 28, 36, 37, 38, 48, 47, 46, 55, 54, 64, 65, 74, 75, 84, 85].includes(number);
  const isCanine = [13, 23, 33, 43, 53, 63, 73, 83].includes(number);
  const isLower = (number >= 31 && number <= 48) || (number >= 71 && number <= 85);
  
  const hasImplant = conditions.includes('Implante');
  const hasCanal = conditions.includes('Endodontia');
  const hasCoroa = conditions.includes('Coroa');
  const hasFaceta = conditions.includes('Faceta');
  const hasExtraido = conditions.includes('Extraído');
  const hasAusente = conditions.includes('Ausente');
  const hasFratura = conditions.includes('Fratura');
  const hasLesao = conditions.includes('Lesão Cervical');
  
  const opacity = (hasExtraido || hasAusente) ? '0.15' : '1';
  
  let crownFill = 'fill-slate-100/50 dark:fill-slate-800/30';
  if (hasCoroa) crownFill = 'fill-yellow-500/80';
  else if (hasFaceta) crownFill = 'fill-purple-500/80';
  
  const transform = isLower ? 'scale(1, -1) translate(0, -48)' : '';

  return (
    <svg width="34" height="48" viewBox="0 0 32 48" className="select-none" style={{ opacity }}>
      <g transform={transform}>
        {/* Raiz do Dente */}
        {hasImplant ? (
          <g className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.5" fill="none">
            <line x1="16" y1="24" x2="16" y2="6" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="12" y1="20" x2="20" y2="20" />
            <line x1="13" y1="16" x2="19" y2="16" />
            <line x1="14" y1="12" x2="18" y2="12" />
            <line x1="15" y1="8" x2="17" y2="8" />
          </g>
        ) : (
          <>
            {isMolar ? (
              <path 
                d="M 6 24 C 6 12, 10 6, 10 4 C 10 6, 12 14, 14 24 M 14 24 C 14 12, 16 8, 16 6 C 16 8, 18 12, 18 24 M 18 24 C 18 14, 20 6, 22 4 C 22 6, 26 12, 26 24" 
                className="fill-none stroke-slate-350 dark:stroke-slate-700" 
                strokeWidth="1.25" 
              />
            ) : (
              <path 
                d="M 8 24 C 8 12, 12 4, 16 2 C 20 4, 24 12, 24 24" 
                className="fill-none stroke-slate-350 dark:stroke-slate-700" 
                strokeWidth="1.25" 
              />
            )}
            
            {hasCanal && (
              isMolar ? (
                <g stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="10" y1="24" x2="10" y2="8" />
                  <line x1="16" y1="24" x2="16" y2="10" />
                  <line x1="22" y1="24" x2="22" y2="8" />
                </g>
              ) : (
                <line x1="16" y1="24" x2="16" y2="6" stroke="#22c55e" strokeWidth="1.75" strokeLinecap="round" />
              )
            )}
          </>
        )}

        {/* Coroa do Dente */}
        {isMolar ? (
          <path 
            d="M 6 24 C 6 34, 7 38, 10 38 C 12 38, 13 36, 16 38 C 19 36, 20 38, 22 38 C 25 38, 26 34, 26 24 Z" 
            className={`${crownFill} stroke-slate-400 dark:stroke-slate-600`}
            strokeWidth="1.25"
          />
        ) : isCanine ? (
          <path 
            d="M 8 24 C 8 32, 10 38, 16 40 C 22 38, 24 32, 24 24 Z" 
            className={`${crownFill} stroke-slate-400 dark:stroke-slate-600`}
            strokeWidth="1.25"
          />
        ) : (
          <path 
            d="M 8 24 L 8 38 C 8 39, 9 40, 10 40 L 22 40 C 23 40, 24 39, 24 38 L 24 24 Z" 
            className={`${crownFill} stroke-slate-400 dark:stroke-slate-600`}
            strokeWidth="1.25"
          />
        )}

        {/* Linha do Colo */}
        <path d="M 7 24 C 11 26, 21 26, 25 24" fill="none" stroke="rgba(244,63,94,0.3)" strokeWidth="1" />

        {/* Lesão Cervical */}
        {hasLesao && (
          <path d="M 12 24 A 4 4 0 0 1 20 24" fill="none" stroke="#78350f" strokeWidth="2.5" />
        )}

        {/* Fratura */}
        {hasFratura && (
          <path d="M 10 32 L 14 30 L 18 34 L 22 32" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        )}
      </g>
      
      {/* Extraído */}
      {hasExtraido && (
        <g stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
          <line x1="6" y1="8" x2="26" y2="40" />
          <line x1="26" y1="8" x2="6" y2="40" />
        </g>
      )}
    </svg>
  );
};

const FaceGrid = ({ toothNumber, facesState, onFaceClick }) => {
  const getFaceColor = (faceName) => {
    const condition = facesState[faceName];
    if (!condition) return 'fill-white dark:fill-slate-900';
    switch (condition) {
      case 'Cárie': return 'fill-red-500 hover:fill-red-650';
      case 'Restauração Resina': return 'fill-blue-500 hover:fill-blue-600';
      case 'Restauração Amálgama': return 'fill-slate-500 hover:fill-slate-600';
      case 'Coroa': return 'fill-yellow-500 hover:fill-yellow-600';
      case 'Faceta': return 'fill-purple-500 hover:fill-purple-600';
      case 'Selante': return 'fill-cyan-500 hover:fill-cyan-600';
      case 'Fratura': return 'fill-orange-500 hover:fill-orange-600';
      case 'Outros / Obs.': return 'fill-teal-500 hover:fill-teal-600';
      case 'Saudável': return 'fill-emerald-500/20 dark:fill-emerald-500/10 hover:fill-emerald-500/30';
      default: return 'fill-white dark:fill-slate-900';
    }
  };

  const getFaceLabel = (toothNum, position) => {
    const q = Math.floor(toothNum / 10);
    if (position === 'top') return 'Vestibular';
    if (position === 'bottom') return 'Palatina';
    if (position === 'center') return 'Oclusal';
    
    if (q === 1 || q === 4 || q === 5 || q === 8) {
      return position === 'left' ? 'Distal' : 'Mesial';
    } else {
      return position === 'left' ? 'Mesial' : 'Distal';
    }
  };

  const labelTop = getFaceLabel(toothNumber, 'top');
  const labelBottom = getFaceLabel(toothNumber, 'bottom');
  const labelLeft = getFaceLabel(toothNumber, 'left');
  const labelRight = getFaceLabel(toothNumber, 'right');
  const labelCenter = getFaceLabel(toothNumber, 'center');

  return (
    <svg width="30" height="30" viewBox="0 0 32 32" className="cursor-pointer select-none shrink-0">
      <circle cx="16" cy="16" r="16" className="fill-none stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" />
      
      {/* Vestibular (Top) */}
      <path 
        d="M 3.2 3.2 A 16 16 0 0 1 28.8 3.2 L 21.2 10.8 A 7 7 0 0 0 10.8 10.8 Z" 
        className={`${getFaceColor(labelTop)} stroke-slate-300 dark:stroke-slate-700 transition-colors`}
        strokeWidth="0.75"
        onClick={(e) => { e.stopPropagation(); onFaceClick(labelTop); }}
        title={labelTop}
      />
      
      {/* Distal / Mesial (Right) */}
      <path 
        d="M 28.8 3.2 A 16 16 0 0 1 28.8 28.8 L 21.2 21.2 A 7 7 0 0 0 21.2 10.8 Z" 
        className={`${getFaceColor(labelRight)} stroke-slate-300 dark:stroke-slate-700 transition-colors`}
        strokeWidth="0.75"
        onClick={(e) => { e.stopPropagation(); onFaceClick(labelRight); }}
        title={labelRight}
      />
      
      {/* Palatina / Lingual (Bottom) */}
      <path 
        d="M 3.2 28.8 A 16 16 0 0 0 28.8 28.8 L 21.2 21.2 A 7 7 0 0 1 10.8 21.2 Z" 
        className={`${getFaceColor(labelBottom)} stroke-slate-300 dark:stroke-slate-700 transition-colors`}
        strokeWidth="0.75"
        onClick={(e) => { e.stopPropagation(); onFaceClick(labelBottom); }}
        title={labelBottom}
      />
      
      {/* Distal / Mesial (Left) */}
      <path 
        d="M 3.2 3.2 A 16 16 0 0 0 3.2 28.8 L 10.8 21.2 A 7 7 0 0 1 10.8 10.8 Z" 
        className={`${getFaceColor(labelLeft)} stroke-slate-300 dark:stroke-slate-700 transition-colors`}
        strokeWidth="0.75"
        onClick={(e) => { e.stopPropagation(); onFaceClick(labelLeft); }}
        title={labelLeft}
      />
      
      {/* Oclusal (Center) */}
      <circle 
        cx="16" 
        cy="16" 
        r="6.5" 
        className={`${getFaceColor(labelCenter)} stroke-slate-300 dark:stroke-slate-700 transition-colors`}
        strokeWidth="0.75"
        onClick={(e) => { e.stopPropagation(); onFaceClick(labelCenter); }}
        title={labelCenter}
      />
    </svg>
  );
};
