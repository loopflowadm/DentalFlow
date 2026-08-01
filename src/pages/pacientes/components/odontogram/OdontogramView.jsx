import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import ToolsSidebar from './ToolsSidebar';
import DentalArch from './DentalArch';
import ViewSwitcher from './ViewSwitcher';
import RightSidebar from './RightSidebar';
import ToothModal from './ToothModal';
import LegendModal from './LegendModal';
import PeriodontogramView from './PeriodontogramView';
import TreatmentPlanView from './TreatmentPlanView';
import { ToothGradients, DENTAL_CONDITIONS, CONDITION_COLORS } from './TeethSVGRegistry';
import { 
  Smile, Activity, FileSpreadsheet, Eye, EyeOff, Download, 
  Upload, Printer, RotateCcw, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OdontogramView({ patient, onSavePatientData }) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Ref de Timer para Debounce do Salvamento no Supabase (Evita travamentos e excesso de renders)
  const saveTimeoutRef = useRef(null);

  // Estado das marcações dos dentes
  const [teethData, setTeethData] = useState(() => {
    const raw = patient?.medical_history?.odontogram?.teethData || patient?.odontogram_data || {};
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  });

  // Periodontograma
  const [perioData, setPerioData] = useState(() => {
    return patient?.medical_history?.odontogram?.perioData || {};
  });

  // Pontes Fixas
  const [fixedBridges, setFixedBridges] = useState(() => {
    return patient?.medical_history?.odontogram?.fixedBridges || [];
  });

  // Configuração Ortodôntica
  const [orthoConfig, setOrthoConfig] = useState(() => {
    return patient?.medical_history?.odontogram?.orthoConfig || {
      upperActive: false,
      lowerActive: false,
      bracketType: 'metal',
      elasticColor: '#2563EB'
    };
  });

  // Histórico de Eventos por Dente
  const [toothHistory, setToothHistory] = useState(() => {
    return patient?.medical_history?.odontogram?.toothHistory || [];
  });

  // Observações clínicas gerais
  const [notes, setNotes] = useState(() => {
    return patient?.medical_history?.odontogram?.notes || patient?.notes || '';
  });

  // Pilha de Undo
  const [undoStack, setUndoStack] = useState([]);

  // Estados de navegação e exibição
  const [activeTab, setActiveTab] = useState('odonto'); // 'odonto' | 'perio' | 'plan'
  const [mode, setMode] = useState('select'); // 'select' | 'hand' | 'paint'
  const [activeCondition, setActiveCondition] = useState('carie');
  const [activeStatus, setActiveStatus] = useState('existente'); // 'existente' | 'planejado'
  const [selectedTooth, setSelectedTooth] = useState('16');
  const [activeView, setActiveView] = useState('Padrao');
  const [isDeciduo, setIsDeciduo] = useState(false);
  const [showPrices, setShowPrices] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Estados de Ponte Fixa e Modal
  const [isBridgeModeActive, setIsBridgeModeActive] = useState(false);
  const [bridgeFirstTooth, setBridgeFirstTooth] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalToothNum, setModalToothNum] = useState(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Exibir Toast Feedback
  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sincronizar quando o paciente mudar (com parse seguro de JSON)
  useEffect(() => {
    if (patient) {
      let odontoObj = patient?.medical_history?.odontogram || {};
      if (typeof patient?.medical_history === 'string') {
        try {
          const parsed = JSON.parse(patient.medical_history);
          odontoObj = parsed.odontogram || {};
        } catch (e) {
          odontoObj = {};
        }
      }
      setTeethData(odontoObj.teethData || patient?.odontogram_data || {});
      setPerioData(odontoObj.perioData || {});
      setFixedBridges(odontoObj.fixedBridges || []);
      setOrthoConfig(odontoObj.orthoConfig || { upperActive: false, lowerActive: false, bracketType: 'metal', elasticColor: '#2563EB' });
      setToothHistory(odontoObj.toothHistory || []);
      setNotes(odontoObj.notes || patient?.notes || '');
    }
  }, [patient?.id]);

  // Função Debounced para persistir dados no Supabase / Estado Pai (Evita re-renderizações excessivas e travamento da UI)
  const persistOdontogram = useCallback((
    newTeethData, 
    newPerioData, 
    newFixedBridges, 
    newOrthoConfig, 
    newHistory, 
    newNotes
  ) => {
    if (!patient || !onSavePatientData) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSavingNotes(true);
        let currentHistoryObj = {};
        if (patient.medical_history) {
          if (typeof patient.medical_history === 'string') {
            try {
              currentHistoryObj = JSON.parse(patient.medical_history);
            } catch (e) {
              currentHistoryObj = {};
            }
          } else if (typeof patient.medical_history === 'object') {
            currentHistoryObj = patient.medical_history;
          }
        }

        const updatedPatient = {
          ...patient,
          medical_history: {
            ...currentHistoryObj,
            odontogram: {
              teethData: newTeethData,
              perioData: newPerioData,
              fixedBridges: newFixedBridges,
              orthoConfig: newOrthoConfig,
              toothHistory: newHistory,
              notes: newNotes,
              updatedAt: new Date().toISOString()
            }
          }
        };

        await onSavePatientData(updatedPatient);
      } catch (err) {
        console.warn('[OdontogramView] Erro ao persistir dados no Supabase:', err);
      } finally {
        setIsSavingNotes(false);
      }
    }, 600);
  }, [patient, onSavePatientData]);

  // Debounce de Auto-Salvamento para Observações Gerais
  useEffect(() => {
    if (patient) {
      persistOdontogram(teethData, perioData, fixedBridges, orthoConfig, toothHistory, notes);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [notes]);

  // Manipulador de Clique no Dente / Superfície
  const handleSurfaceClick = (toothNum, face) => {
    const tNum = parseInt(toothNum, 10);
    setSelectedTooth(String(toothNum));

    // Se estiver em modo Ponte Fixa:
    if (isBridgeModeActive) {
      if (!bridgeFirstTooth) {
        setBridgeFirstTooth(tNum);
        showToast(`Ponte Fixa: Dente #${tNum} selecionado como pilar 1. Clique no 2º pilar.`);
      } else if (bridgeFirstTooth !== tNum) {
        const newBridge = { fromTooth: bridgeFirstTooth, toTooth: tNum, status: activeStatus };
        const newBridges = [...fixedBridges, newBridge];
        setFixedBridges(newBridges);
        setBridgeFirstTooth(null);
        setIsBridgeModeActive(false);
        showToast(`Ponte Fixa criada com sucesso entre os dentes #${bridgeFirstTooth} e #${tNum}!`, 'success');
        persistOdontogram(teethData, perioData, newBridges, orthoConfig, toothHistory, notes);
      }
      return;
    }

    if (mode === 'hand') return;

    // Se estiver em modo Seleção (Ponteiro):
    if (mode === 'select') {
      setModalToothNum(toothNum);
      setIsModalOpen(true);
      return;
    }

    // Se estiver em modo Pincel (Paint):
    setUndoStack(prev => [...prev.slice(-20), { teethData, toothHistory, fixedBridges }]);

    const currentToothState = teethData[toothNum] || { surfaces: {}, root: null, whole: null, status: activeStatus };
    let updatedToothState = { ...currentToothState, status: activeStatus };
    const surfacesState = { ...(updatedToothState.surfaces || {}) };

    const toolDef = DENTAL_CONDITIONS.find(c => c.id === activeCondition);
    const condLabel = toolDef?.name || activeCondition;

    if (activeCondition === 'saudavel') {
      // Limpa marcações
      updatedToothState = { surfaces: {}, root: null, whole: null, status: activeStatus };
    } else if (toolDef?.type === 'whole') {
      // Condições de dente inteiro (Coroa, Faceta, Implante, Extraído, Ausente, Fratura)
      if (updatedToothState.whole === activeCondition) {
        updatedToothState.whole = null;
      } else {
        updatedToothState.whole = activeCondition;
      }
    } else if (toolDef?.type === 'root' || activeCondition === 'endo' || activeCondition === 'endodontia') {
      // Endodontia / Raiz
      if (updatedToothState.root === activeCondition) {
        updatedToothState.root = null;
      } else {
        updatedToothState.root = activeCondition;
      }
    } else {
      // Condições de superfície (Cárie, Resina, Amálgama, Selante, Lesão Cervical)
      const targetFace = (face === 'full' || face === 'root' || !face) ? 'O' : face;
      if (surfacesState[targetFace] === activeCondition) {
        delete surfacesState[targetFace];
      } else {
        surfacesState[targetFace] = activeCondition;
      }
      updatedToothState.surfaces = surfacesState;
    }

    const newTeethData = {
      ...teethData,
      [toothNum]: updatedToothState
    };

    // Adiciona evento ao histórico do dente
    const newEvent = {
      toothNumber: toothNum,
      face: face === 'full' ? 'Dente Inteiro' : face,
      condition: activeCondition,
      conditionLabel: condLabel,
      date: new Date().toLocaleDateString('pt-BR')
    };
    const newHistory = [newEvent, ...toothHistory];

    setTeethData(newTeethData);
    setToothHistory(newHistory);
    persistOdontogram(newTeethData, perioData, fixedBridges, orthoConfig, newHistory, notes);
  };

  // Ação de Ações em Lote por Arcada
  const handleBatchAction = (actionType, arch) => {
    setUndoStack(prev => [...prev.slice(-20), { teethData, toothHistory, fixedBridges }]);
    const upperTeeth = isDeciduo ? [55,54,53,52,51,61,62,63,64,65] : [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
    const lowerTeeth = isDeciduo ? [85,84,83,82,81,71,72,73,74,75] : [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

    const targetTeeth = arch === 'upper' ? upperTeeth : lowerTeeth;
    const newTeethData = { ...teethData };

    targetTeeth.forEach(num => {
      const current = newTeethData[num] || { surfaces: {}, root: null, whole: null, status: activeStatus };
      if (actionType === 'profilaxia') {
        current.surfaces = { ...(current.surfaces || {}), O: 'selante' };
      } else if (actionType === 'clareamento') {
        current.surfaces = { ...(current.surfaces || {}), V: 'resina' };
      }
      current.status = activeStatus;
      newTeethData[num] = current;
    });

    setTeethData(newTeethData);
    showToast(`Ação em Lote (${actionType}) aplicada com sucesso na Arcada ${arch === 'upper' ? 'Superior' : 'Inferior'}!`, 'success');
    persistOdontogram(newTeethData, perioData, fixedBridges, orthoConfig, toothHistory, notes);
  };

  // Salvar alterações do modal por dente
  const handleSaveModalToothData = (toothNum, updatedToothData) => {
    const newTeethData = {
      ...teethData,
      [toothNum]: updatedToothData
    };
    setTeethData(newTeethData);
    showToast(`Inspeção do dente #${toothNum} atualizada!`, 'success');
    persistOdontogram(newTeethData, perioData, fixedBridges, orthoConfig, toothHistory, notes);
  };

  // Limpar dente selecionado
  const handleClearSelectedTooth = (toothNum = selectedTooth) => {
    if (!toothNum) return;
    setUndoStack(prev => [...prev.slice(-20), { teethData, toothHistory, fixedBridges }]);
    const newTeethData = { ...teethData };
    delete newTeethData[toothNum];
    setTeethData(newTeethData);
    showToast(`Dados do dente #${toothNum} removidos.`);
    persistOdontogram(newTeethData, perioData, fixedBridges, orthoConfig, toothHistory, notes);
  };

  // Desfazer (Ctrl+Z)
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setTeethData(lastState.teethData);
    if (lastState.toothHistory) setToothHistory(lastState.toothHistory);
    if (lastState.fixedBridges) setFixedBridges(lastState.fixedBridges);
    showToast('Última alteração desfeita.');
    persistOdontogram(lastState.teethData, perioData, lastState.fixedBridges || fixedBridges, orthoConfig, lastState.toothHistory || toothHistory, notes);
  };

  // Reiniciar Odontograma
  const handleResetOdontogram = () => {
    if (window.confirm('Tem certeza que deseja reiniciar todo o odontograma e remover as marcações deste paciente?')) {
      setTeethData({});
      setPerioData({});
      setFixedBridges([]);
      setToothHistory([]);
      showToast('Odontograma reiniciado.');
      persistOdontogram({}, {}, [], orthoConfig, [], notes);
    }
  };

  // Exportar dados JSON
  const handleExportJSON = () => {
    const data = {
      patientId: patient?.id,
      patientName: patient?.name,
      exportedAt: new Date().toISOString(),
      teethData,
      perioData,
      fixedBridges,
      orthoConfig,
      toothHistory,
      notes
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Odontograma_${patient?.name || 'Paciente'}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON do Prontuário exportado com sucesso!', 'success');
  };

  // Importar dados JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.teethData) setTeethData(parsed.teethData);
        if (parsed.perioData) setPerioData(parsed.perioData);
        if (parsed.fixedBridges) setFixedBridges(parsed.fixedBridges);
        if (parsed.orthoConfig) setOrthoConfig(parsed.orthoConfig);
        if (parsed.toothHistory) setToothHistory(parsed.toothHistory);
        if (parsed.notes) setNotes(parsed.notes);
        showToast('Dados do odontograma importados com sucesso!', 'success');
        persistOdontogram(
          parsed.teethData || teethData, 
          parsed.perioData || perioData, 
          parsed.fixedBridges || fixedBridges, 
          parsed.orthoConfig || orthoConfig, 
          parsed.toothHistory || toothHistory, 
          parsed.notes || notes
        );
      } catch (err) {
        showToast('Erro ao importar arquivo JSON inválido.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Escutador de Teclado (Ctrl+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack]);

  return (
    <div className="flex flex-col h-full gap-4 relative">
      {/* Definições de Degradês SVG globais */}
      <ToothGradients />

      {/* TOAST FEEDBACK NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-xl border flex items-center gap-2 ${
              toastMessage.type === 'error' 
                ? 'bg-rose-950 border-rose-800 text-rose-200' 
                : toastMessage.type === 'success'
                  ? 'bg-emerald-950 border-emerald-800 text-emerald-200'
                  : 'bg-slate-900 border-white/10 text-slate-200'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER DE NAVEGAÇÃO E AÇÕES */}
      <div className={`p-3 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#111726]/90 border-white/10 shadow-lg text-white' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`}>
        {/* TAB SWITCHER PRINCIPAL */}
        <div className={`p-1 rounded-xl border flex items-center gap-1 ${isDarkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('odonto')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'odonto' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Odontograma
          </button>
          <button
            onClick={() => setActiveTab('perio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'perio' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Periodontograma
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'plan' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Orçamento & Plano
          </button>
        </div>

        {/* BOTÕES DE AÇÕES RÁPIDAS DA BARRA DE FERRAMENTAS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPrices(!showPrices)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDarkMode ? 'bg-slate-900 border-white/10 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {showPrices ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            {showPrices ? 'Valores' : 'Ocultos'}
          </button>

          <button
            onClick={handleExportJSON}
            title="Exportar dados do Prontuário JSON"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <label 
            title="Importar dados do Prontuário JSON" 
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={() => window.print()}
            title="Imprimir Prontuário Odontológico"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetOdontogram}
            title="Reiniciar Odontograma"
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL DAS ABAS */}
      {activeTab === 'odonto' && (
        <div className="flex flex-col lg:flex-row gap-3 items-stretch w-full min-w-0 min-h-[460px]">
          {/* Painel Esquerdo: Ferramentas & Controles */}
          <ToolsSidebar
            mode={mode}
            setMode={setMode}
            activeCondition={activeCondition}
            setActiveCondition={setActiveCondition}
            activeStatus={activeStatus}
            setActiveStatus={setActiveStatus}
            isDeciduo={isDeciduo}
            setIsDeciduo={setIsDeciduo}
            isBridgeModeActive={isBridgeModeActive}
            onToggleBridgeMode={() => {
              setIsBridgeModeActive(!isBridgeModeActive);
              setBridgeFirstTooth(null);
            }}
            orthoConfig={orthoConfig}
            onChangeOrthoConfig={setOrthoConfig}
            onBatchAction={handleBatchAction}
            onUndo={handleUndo}
            onClear={() => handleClearSelectedTooth(selectedTooth)}
            canUndo={undoStack.length > 0}
            showPrices={showPrices}
          />

          {/* Painel Central: Arcada Dentária */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
            <DentalArch
              teethData={teethData}
              selectedTooth={selectedTooth}
              onSelectTooth={setSelectedTooth}
              onSurfaceClick={handleSurfaceClick}
              onRootClick={(e, tNum) => handleSurfaceClick(tNum, 'root')}
              activeTool={activeCondition}
              activeView={activeView}
              isDeciduo={isDeciduo}
              isBridgeModeActive={isBridgeModeActive}
              bridgeFirstTooth={bridgeFirstTooth}
              fixedBridges={fixedBridges}
              orthoConfig={orthoConfig}
            />

            {/* Seletor de Vistas do Rodapé */}
            <ViewSwitcher
              activeView={activeView}
              setActiveView={setActiveView}
              isDeciduo={isDeciduo}
              setIsDeciduo={setIsDeciduo}
            />
          </div>

          {/* Painel Direito: Observações e Histórico do Dente */}
          <RightSidebar
            notes={notes}
            setNotes={setNotes}
            selectedTooth={selectedTooth}
            toothHistory={toothHistory}
            isSavingNotes={isSavingNotes}
            onOpenLegend={() => setIsLegendOpen(true)}
          />
        </div>
      )}

      {activeTab === 'perio' && (
        <PeriodontogramView
          perioData={perioData}
          onChangePerioData={(newPerio) => {
            setPerioData(newPerio);
            persistOdontogram(teethData, newPerio, fixedBridges, orthoConfig, toothHistory, notes);
          }}
          isDeciduo={isDeciduo}
        />
      )}

      {activeTab === 'plan' && (
        <TreatmentPlanView
          teethData={teethData}
          fixedBridges={fixedBridges}
          showPrices={showPrices}
          onTogglePriceVisibility={() => setShowPrices(!showPrices)}
          onRemoveToothCondition={(tNum, condId) => {
            const current = teethData[tNum];
            if (!current) return;
            const updated = { ...current };
            if (updated.whole === condId) updated.whole = null;
            if (updated.root === condId) updated.root = null;
            if (updated.surfaces) {
              const surf = { ...updated.surfaces };
              Object.keys(surf).forEach(k => {
                if (surf[k] === condId) delete surf[k];
              });
              updated.surfaces = surf;
            }
            const newTeethData = { ...teethData, [tNum]: updated };
            setTeethData(newTeethData);
            persistOdontogram(newTeethData, perioData, fixedBridges, orthoConfig, toothHistory, notes);
          }}
          onToggleConditionStatus={(tNum, condId) => {
            const current = teethData[tNum];
            if (!current) return;
            const newStatus = current.status === 'planejado' ? 'existente' : 'planejado';
            const updated = { ...current, status: newStatus };
            const newTeethData = { ...teethData, [tNum]: updated };
            setTeethData(newTeethData);
            persistOdontogram(newTeethData, perioData, fixedBridges, orthoConfig, toothHistory, notes);
          }}
        />
      )}

      {/* MODAL DE INSPEÇÃO DETALHADA DO DENTE */}
      <ToothModal
        isOpen={isModalOpen}
        toothNumber={modalToothNum}
        toothData={teethData[modalToothNum]}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModalToothData}
        onClearTooth={handleClearSelectedTooth}
      />

      {/* MODAL DE LEGENDA DE CORES */}
      <LegendModal
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
        showPrices={showPrices}
      />
    </div>
  );
}
