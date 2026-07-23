import React, { useState, useEffect, useCallback } from 'react';
import ToolsSidebar from './ToolsSidebar';
import DentalArch from './DentalArch';
import ViewSwitcher from './ViewSwitcher';
import RightSidebar from './RightSidebar';
import { ToothGradients, CONDITION_COLORS } from './TeethSVGRegistry';

export default function OdontogramView({ patient, onSavePatientData }) {
  // Estado das marcações dos dentes
  // Formato: { "16": { occlusal: "carie", root: "endodontia" }, "44": { full: "implante" } }
  const [teethData, setTeethData] = useState(() => {
    return patient?.medical_history?.odontogram?.teethData || patient?.odontogram_data || {};
  });

  // Histórico de Eventos por Dente para a Timeline
  const [toothHistory, setToothHistory] = useState(() => {
    return patient?.medical_history?.odontogram?.toothHistory || [];
  });

  // Observações clínicas
  const [notes, setNotes] = useState(() => {
    return patient?.medical_history?.odontogram?.notes || patient?.notes || '';
  });

  // Pilha de Undo (Desfazer)
  const [undoStack, setUndoStack] = useState([]);

  // Estados de Interatividade
  const [mode, setMode] = useState('select'); // 'select' | 'hand' | 'paint'
  const [activeCondition, setActiveCondition] = useState('carie');
  const [selectedTooth, setSelectedTooth] = useState('16');
  const [activeView, setActiveView] = useState('Padrao');
  const [isDeciduo, setIsDeciduo] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Atualizar quando o paciente mudar
  useEffect(() => {
    if (patient) {
      setTeethData(patient?.medical_history?.odontogram?.teethData || patient?.odontogram_data || {});
      setToothHistory(patient?.medical_history?.odontogram?.toothHistory || []);
      setNotes(patient?.medical_history?.odontogram?.notes || patient?.notes || '');
    }
  }, [patient?.id]);

  // Função para salvar no Supabase / Estado Pai
  const persistOdontogram = useCallback(async (newTeethData, newHistory, newNotes) => {
    if (!patient || !onSavePatientData) return;
    try {
      setIsSavingNotes(true);
      const updatedPatient = {
        ...patient,
        medical_history: {
          ...(patient.medical_history || {}),
          odontogram: {
            teethData: newTeethData,
            toothHistory: newHistory,
            notes: newNotes,
            updatedAt: new Date().toISOString()
          }
        }
      };
      await onSavePatientData(updatedPatient);
    } catch (err) {
      console.warn('[OdontogramView] Erro ao persistir dados:', err);
    } finally {
      setIsSavingNotes(false);
    }
  }, [patient, onSavePatientData]);

  // Debounce para auto-salvamento das observações
  useEffect(() => {
    const timer = setTimeout(() => {
      if (patient) {
        persistOdontogram(teethData, toothHistory, notes);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes]);

  // Aplicação da condição ao dente / face
  const handleSurfaceClick = (toothNum, face) => {
    setSelectedTooth(String(toothNum));

    if (mode === 'hand') return;

    // Se estiver em modo Seleção (Ponteiro), apenas seleciona o dente para o painel de histórico
    if (mode === 'select') {
      return;
    }

    // Se estiver em modo Pincel (Paint):
    // Guardar estado anterior para Undo (Ctrl+Z)
    setUndoStack(prev => [...prev.slice(-20), { teethData, toothHistory }]);

    const currentToothState = teethData[toothNum] || {};
    let updatedToothState = { ...currentToothState };

    const condLabel = CONDITION_COLORS[activeCondition]?.label || activeCondition;

    const fullToothTools = ['implante', 'extraido', 'ausente', 'coroa', 'faceta'];

    if (activeCondition === 'saudavel') {
      // Limpa marcações do dente / face
      if (face === 'full' || face === 'root') {
        updatedToothState = {};
      } else {
        delete updatedToothState[face];
      }
    } else if (fullToothTools.includes(activeCondition)) {
      // Condições de dente inteiro (Implante, Extraído, Ausente, Coroa, Faceta)
      if (updatedToothState.full === activeCondition) {
        delete updatedToothState.full; // Toggle OFF
      } else {
        updatedToothState = { full: activeCondition }; // Aplica a todo o dente
      }
    } else if (activeCondition === 'endodontia') {
      // Endodontia aplica-se à raiz do dente
      if (updatedToothState.root === 'endodontia') {
        delete updatedToothState.root;
      } else {
        updatedToothState.root = 'endodontia';
      }
    } else {
      // Condições por face (Cárie, Restauração Resina, Amálgama, Selante, Fratura, Lesão Cervical, Outros)
      const targetFace = (face === 'full' || !face) ? 'occlusal' : face;
      if (updatedToothState.full) {
        delete updatedToothState.full;
      }
      if (updatedToothState[targetFace] === activeCondition) {
        delete updatedToothState[targetFace]; // Toggle OFF
      } else {
        updatedToothState[targetFace] = activeCondition;
      }
    }

    const newTeethData = {
      ...teethData,
      [toothNum]: updatedToothState
    };

    // Adicionar novo evento ao histórico sequencial
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
    persistOdontogram(newTeethData, newHistory, notes);
  };


  // Ação de Desfazer (Ctrl + Z)
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setTeethData(lastState.teethData);
    setToothHistory(lastState.toothHistory);
    persistOdontogram(lastState.teethData, lastState.toothHistory, notes);
  };

  // Ação de Limpar Dente Selecionado
  const handleClearSelectedTooth = () => {
    if (!selectedTooth) return;
    setUndoStack(prev => [...prev.slice(-20), { teethData, toothHistory }]);
    const newTeethData = { ...teethData };
    delete newTeethData[selectedTooth];
    setTeethData(newTeethData);
    persistOdontogram(newTeethData, toothHistory, notes);
  };

  // Escutador de Atalhos Globais de Teclado (ALT + P e Ctrl + Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setMode(prev => prev === 'paint' ? 'select' : 'paint');
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* SVG Global Gradients */}
      <ToothGradients />

      {/* Painel Odontograma Principal - 3 Colunas */}
      <div className="flex gap-4 items-stretch min-h-[580px]">
        {/* Painel Esquerdo: Ferramentas */}
        <ToolsSidebar
          mode={mode}
          setMode={setMode}
          activeCondition={activeCondition}
          setActiveCondition={setActiveCondition}
          onUndo={handleUndo}
          onClear={handleClearSelectedTooth}
          canUndo={undoStack.length > 0}
        />

        {/* Painel Central: Arcada Dentária */}
        <div className="flex-1 flex flex-col justify-between">
          <DentalArch
            teethData={teethData}
            selectedTooth={selectedTooth}
            onSelectTooth={setSelectedTooth}
            onSurfaceClick={handleSurfaceClick}
            activeTool={activeCondition}
            activeView={activeView}
            isDeciduo={isDeciduo}
          />

          {/* Seletor de Vistas do Rodapé */}
          <ViewSwitcher
            activeView={activeView}
            setActiveView={setActiveView}
            isDeciduo={isDeciduo}
            setIsDeciduo={setIsDeciduo}
          />
        </div>

        {/* Painel Direito: Legenda, Notas e Histórico */}
        <RightSidebar
          notes={notes}
          setNotes={setNotes}
          selectedTooth={selectedTooth}
          toothHistory={toothHistory}
          isSavingNotes={isSavingNotes}
        />
      </div>
    </div>
  );
}
