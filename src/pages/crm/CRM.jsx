import { useState, useEffect, useRef } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Plus, Search, CheckSquare, MessageSquare, Paperclip, 
  Clock, X, Phone, Calendar, Send, Sparkles, Download, 
  Check, FileText, ArrowRight, UserCheck, AlertCircle, HelpCircle,
  User, LayoutGrid, Eye, EyeOff, DollarSign, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function CRM({ selectedLead, setSelectedLead, setActiveTab, setPrefilledLeadData, onOpenWhatsApp }) {
  const { crmLeads, updateCrmLead, convertLeadToPatient, patients, sendWhatsAppMessage } = useClinic();
  const { user } = useAuth();
  const { currentTheme, themeMode } = useTheme();
  
  // Lista de Colunas (Etapas)
  const columns = [
    'Novo Paciente', 'Primeiro Contato', 'Avaliação Agendada', 'Confirmado', 
    'Compareceu', 'Orçamento', 'Negociação', 'Fechado', 
    'Tratamento', 'Retorno', 'Concluído', 'Perdido'
  ];

  // Modo de visualização do CRM: 'details' (Ficha do Lead) | 'kanban' (Quadro Kanban)
  const [crmViewMode, setCrmViewMode] = useState('details');
  const [activeCenterTab, setActiveCenterTab] = useState('chat'); // 'chat' | 'details' | 'files'
  const [showFinancialValues, setShowFinancialValues] = useState(false); // Oculto por padrão para proteção de dados sensíveis (LGPD)

  // Input de Anotação Interna
  const [inputText, setInputText] = useState('');

  // Campos para Edição do Lead
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editProcedure, setEditProcedure] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editPriority, setEditPriority] = useState('medium');

  // Drag and drop states no Kanban
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverColIdx, setDragOverColIdx] = useState(null);

  // Ref e Handlers para Arrastar Tela no Quadro Kanban (Drag-to-Scroll)
  const kanbanContainerRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);

  const handleKanbanScroll = (direction) => {
    if (kanbanContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      kanbanContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMouseDownBoard = (e) => {
    // Não iniciar se o clique for em botões, campos ou cartões de leads arrastáveis
    if (e.target.closest('button, input, select, a, [draggable="true"]')) return;
    isMouseDownRef.current = true;
    startXRef.current = e.pageX - (kanbanContainerRef.current?.offsetLeft || 0);
    scrollLeftRef.current = kanbanContainerRef.current?.scrollLeft || 0;
    setIsDraggingBoard(true);
  };

  const handleMouseLeaveBoard = () => {
    isMouseDownRef.current = false;
    setIsDraggingBoard(false);
  };

  const handleMouseUpBoard = () => {
    isMouseDownRef.current = false;
    setIsDraggingBoard(false);
  };

  const handleMouseMoveBoard = (e) => {
    if (!isMouseDownRef.current || !kanbanContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (kanbanContainerRef.current.offsetLeft || 0);
    const walk = (x - startXRef.current) * 1.8;
    kanbanContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleDropLeadToStage = (leadId, targetColIdx) => {
    const lead = crmLeads.find(l => l.id === leadId);
    if (!lead || (lead.stage || 0) === targetColIdx) return;

    const updated = {
      ...lead,
      stage: targetColIdx,
      history: [
        ...(lead.history || []),
        {
          date: new Date().toISOString(),
          type: 'STAGE_CHANGE',
          description: `Arrastado no Kanban para "${columns[targetColIdx]}"`,
          user: user?.full_name || 'Profissional'
        }
      ]
    };

    updateCrmLead(updated);
    if (selectedLead?.id === lead.id) {
      setSelectedLead(updated);
    }
  };

  // Input de checklist rápido no Widget Direito
  const [newChecklistText, setNewChecklistText] = useState('');

  // Selecionar o primeiro lead caso nenhum esteja ativo ao montar
  useEffect(() => {
    if (!selectedLead && crmLeads.length > 0) {
      let active = true;
      const run = async () => {
        await Promise.resolve();
        if (active) {
          setSelectedLead(crmLeads[0]);
        }
      };
      run();
      return () => {
        active = false;
      };
    }
  }, [crmLeads, selectedLead, setSelectedLead]);

  // Sincronizar dados de edição quando o lead ativo muda
  useEffect(() => {
    if (selectedLead) {
      setEditName(selectedLead.name || '');
      setEditPhone(selectedLead.phone || '');
      setEditProcedure(selectedLead.procedure_name || '');
      setEditBudget(selectedLead.budget_amount || '');
      setEditPriority(selectedLead.priority || 'medium');
    }
  }, [selectedLead]);

  if (!selectedLead) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 font-medium text-sm bg-white dark:bg-[#0D0D0D] rounded-[28px] border border-slate-200/80 dark:border-white/5 p-8 transition-colors duration-300 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-title">
            Nenhum Lead Selecionado na Jornada
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Selecione uma oportunidade no painel lateral para gerenciar histórico, negociação e odontograma comercial.
          </p>
        </div>
      </div>
    );
  }

  // Avançar ou Recuar Estágio
  const handleStageChange = (direction) => {
    const currentIdx = selectedLead.stage || 0;
    const newStageIdx = Math.max(0, Math.min(columns.length - 1, currentIdx + direction));
    
    const updated = {
      ...selectedLead,
      stage: newStageIdx,
      status: columns[newStageIdx],
      history: [
        ...(selectedLead.history || []),
        {
          date: new Date().toISOString(),
          type: 'STAGE_CHANGE',
          description: `Movido para "${columns[newStageIdx]}"`,
          user: user?.full_name || 'Profissional'
        }
      ]
    };
    updateCrmLead(updated);
    setSelectedLead(updated);
  };

  const handleConvertToPatient = async () => {
    if (window.confirm(`Deseja converter "${selectedLead.name}" em paciente clínico ativo? O registro continuará salvo na Jornada Comercial.`)) {
      try {
        const patData = await convertLeadToPatient(selectedLead.id);
        if (selectedLead) {
          const updated = {
            ...selectedLead,
            stage: selectedLead.stage < 7 ? 7 : selectedLead.stage,
            is_patient: true,
            patient_id: patData?.id
          };
          setSelectedLead(updated);
        }
        alert(`"${selectedLead.name}" foi convertido em Paciente Clínico com sucesso! O registro permanece salvo no CRM.`);
      } catch (err) {
        console.error('Erro ao converter lead em paciente:', err);
        alert('Falha ao converter lead em paciente.');
      }
    }
  };

  const handleOpenWhatsApp = () => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp();
    } else if (setActiveTab) {
      setActiveTab('whatsapp');
    }
  };

  // Adicionar Nota Interna
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Novo item de histórico / nota interna
    const newComment = {
      date: new Date().toISOString(),
      text: inputText,
      user: user?.full_name || 'Profissional',
      mode: 'note'
    };

    const updated = {
      ...selectedLead,
      comments: [...(selectedLead.comments || []), newComment],
      history: [
        ...(selectedLead.history || []),
        {
          date: new Date().toISOString(),
          type: 'NOTE_ADD',
          description: `Adicionou nota interna: "${inputText}"`,
          user: user?.full_name || 'Profissional'
        }
      ]
    };

    updateCrmLead(updated);
    setSelectedLead(updated);
    setInputText('');
  };

  // Funções de Checklist
  const handleToggleChecklist = (itemId) => {
    const updated = {
      ...selectedLead,
      checklist: (selectedLead.checklist || []).map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    };
    updateCrmLead(updated);
    setSelectedLead(updated);
  };

  const handleAddChecklistItem = (e) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem = {
      id: 'chk-' + Math.random().toString(36).substr(2, 9),
      text: newChecklistText,
      completed: false
    };

    const updated = {
      ...selectedLead,
      checklist: [...(selectedLead.checklist || []), newItem]
    };

    updateCrmLead(updated);
    setSelectedLead(updated);
    setNewChecklistText('');
  };

  // Salvar edições do lead
  const handleSaveLeadEdits = (e) => {
    e.preventDefault();
    const updated = {
      ...selectedLead,
      name: editName,
      phone: editPhone,
      procedure_name: editProcedure,
      budget_amount: editBudget ? parseFloat(editBudget) : null,
      priority: editPriority
    };
    updateCrmLead(updated);
    setSelectedLead(updated);
    alert('Dados do paciente atualizados com sucesso!');
  };

  // Mock de Anexo de Exame / Proposta
  const handleAttachMockFile = (fileName, fileSize) => {
    const newFile = {
      name: fileName,
      size: fileSize,
      url: '#'
    };
    const updated = {
      ...selectedLead,
      attachments: [...(selectedLead.attachments || []), newFile],
      history: [
        ...(selectedLead.history || []),
        {
          date: new Date().toISOString(),
          type: 'FILE_ADD',
          description: `Anexou o arquivo "${fileName}"`,
          user: user?.full_name || 'Profissional'
        }
      ]
    };
    updateCrmLead(updated);
    setSelectedLead(updated);
  };

  return (
    <div className="h-full flex gap-6 overflow-hidden select-none">
      
      {/* ========================================================================= */}
      {/* COLUNA 2: DETALHES DO LEAD (CENTRO - FLEX-1)                               */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0D0D0D] rounded-[28px] border border-slate-200/80 dark:border-white/5 shadow-sm dark:shadow-2xl overflow-hidden transition-colors duration-300 text-left">
        
        {/* BARRA SUPERIOR DE MODO DE VISÃO & CONTROLE DA JORNADA */}
        <div className="px-6 py-3 border-b border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-[#0D0D0D] flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCrmViewMode('kanban')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                crmViewMode === 'kanban'
                  ? 'bg-[#196BFB] text-white shadow-sm'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/5'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Quadro Kanban</span>
            </button>

            <button
              onClick={() => setCrmViewMode('details')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                crmViewMode === 'details'
                  ? 'bg-[#196BFB] text-white shadow-sm'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Ficha do Paciente</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {crmViewMode === 'kanban' && (
              <div className="flex items-center gap-1 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-0.5 rounded-xl">
                <button
                  onClick={() => handleKanbanScroll('left')}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Rolar colunas para a esquerda"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[9px] font-bold text-slate-400 px-1">Ver Colunas</span>
                <button
                  onClick={() => handleKanbanScroll('right')}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Rolar colunas para a direita"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Ícone discreto apenas (sem texto) para alternar visibilidade de orçamentos */}
            <button
              onClick={() => setShowFinancialValues(prev => !prev)}
              className={`p-2 rounded-xl transition-all border cursor-pointer ${
                showFinancialValues
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title={showFinancialValues ? "Orçamentos exibidos (Clique para ocultar)" : "Orçamentos ocultos (Clique para exibir)"}
            >
              {showFinancialValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider hidden sm:inline-block">
              {crmLeads.length} Oportunidades
            </span>
          </div>
        </div>

        {crmViewMode === 'kanban' ? (
          /* ========================================================================= */
          /* MODO KANBAN: BOARD PIPELINE DE ESTÁGIOS (MINIMALISTA)                    */
          /* ========================================================================= */
          <div 
            ref={kanbanContainerRef}
            onMouseDown={handleMouseDownBoard}
            onMouseLeave={handleMouseLeaveBoard}
            onMouseUp={handleMouseUpBoard}
            onMouseMove={handleMouseMoveBoard}
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            className={`flex-1 p-4 overflow-x-auto scrollbar-thin flex gap-4 bg-slate-100/60 dark:bg-black min-w-0 transition-colors ${
              isDraggingBoard ? 'cursor-grabbing select-none' : 'cursor-grab'
            }`}
          >
            {columns.map((colName, colIdx) => {
              const columnLeads = crmLeads.filter(l => (l.stage || 0) === colIdx);
              const columnTotal = columnLeads.reduce((acc, l) => acc + (l.budget_amount || 0), 0);
              const isDragOver = dragOverColIdx === colIdx;

              return (
                <div 
                  key={colName}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverColIdx !== colIdx) setDragOverColIdx(colIdx);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setDragOverColIdx(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
                    if (leadId) {
                      handleDropLeadToStage(leadId, colIdx);
                    }
                    setDragOverColIdx(null);
                    setDraggedLeadId(null);
                  }}
                  className={`w-72 flex-shrink-0 bg-white dark:bg-[#0D0D0D] border rounded-2xl flex flex-col h-full shadow-sm overflow-hidden transition-all duration-200 ${
                    isDragOver 
                      ? 'border-[#196BFB] ring-2 ring-[#196BFB]/30 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]' 
                      : 'border-slate-200/80 dark:border-white/5'
                  }`}
                >
                  {/* Cabeçalho da Coluna do Kanban */}
                  <div className="p-3 border-b border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-black/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#196BFB]" />
                      <h3 className="text-xs font-bold text-slate-800 dark:text-white font-title truncate max-w-[130px]">
                        {colName}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10 text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                        {columnLeads.length}
                      </span>
                    </div>

                    {showFinancialValues && columnTotal > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        R$ {columnTotal.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>

                  {/* Cards de Leads da Coluna (Design Minimalista) */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin">
                    {columnLeads.map(lead => {
                      const isSelected = selectedLead?.id === lead.id;
                      const isBeingDragged = draggedLeadId === lead.id;

                      return (
                        <div
                          key={lead.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', lead.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggedLeadId(lead.id);
                          }}
                          onDragEnd={() => {
                            setDraggedLeadId(null);
                            setDragOverColIdx(null);
                          }}
                          onClick={() => {
                            setSelectedLead(lead);
                            setCrmViewMode('details');
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing relative group ${
                            isBeingDragged
                              ? 'opacity-40 scale-95 border-dashed border-[#196BFB] bg-blue-500/10'
                              : isSelected
                                ? 'border-[#196BFB] bg-blue-50/40 dark:bg-blue-900/20 shadow-md'
                                : 'border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0D0D0D] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200/60 dark:border-white/5">
                                {lead.avatar && lead.avatar !== '👤' ? lead.avatar : <User className="w-4 h-4" />}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-[#196BFB] transition-colors">
                                  {lead.name}
                                </h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px]">
                                  {lead.procedure_name || 'Consulta Geral'}
                                </p>
                              </div>
                            </div>

                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              lead.priority === 'high' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {lead.priority === 'high' ? 'Alta' : lead.priority === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                          </div>

                          {/* Rodapé Minimalista: Exibe valor apenas quando ativado, e botões de navegação rápida */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {showFinancialValues && lead.budget_amount ? `R$ ${lead.budget_amount.toLocaleString('pt-BR')}` : ''}
                            </span>

                            {/* Botões para mover estágio rapidamente */}
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              {colIdx > 0 && (
                                <button
                                  onClick={() => handleDropLeadToStage(lead.id, colIdx - 1)}
                                  className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold"
                                  title="Recuar estágio"
                                >
                                  ←
                                </button>
                              )}

                              {colIdx < columns.length - 1 && (
                                <button
                                  onClick={() => handleDropLeadToStage(lead.id, colIdx + 1)}
                                  className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold"
                                  title="Avançar estágio"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {columnLeads.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs font-bold italic border border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                        Nenhum lead nesta etapa
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* MODO DETALHES DO LEAD                                                     */
          /* ========================================================================= */
          <>
            {/* HEADER DO LEAD */}
        <div className="p-6 border-b border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <span className="p-2.5 bg-slate-100 dark:bg-[#0B1220]/60 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 w-14 h-14 border border-slate-200/60 dark:border-white/5">
              {selectedLead.avatar && selectedLead.avatar !== '👤' ? selectedLead.avatar : <User className="w-8 h-8" />}
            </span>
            <div>
              <h2 className="text-lg font-black font-title text-slate-800 dark:text-white flex items-center gap-2">
                {selectedLead.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                  {selectedLead.procedure_name || 'Consulta Geral'}
                </span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                  {selectedLead.phone}
                </span>
                
                {/* Badges de Status */}
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                  selectedLead.priority === 'high' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  Prioridade: {selectedLead.priority === 'high' ? 'Alta' : selectedLead.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>

                <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  {columns[selectedLead.stage || 0]}
                </span>
              </div>
            </div>
          </div>

          {/* Ações Circulares & Botão de Converter */}
          <div className="flex items-center gap-2.5">
            {/* Botões Rápidos */}
            <div className="flex gap-1.5">
              <button 
                onClick={() => alert(`Ligando simulado para ${selectedLead.phone}...`)}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 dark:bg-[#0B1220]/60 dark:hover:bg-[#1A2333] active:scale-95 transition-all text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center border border-slate-200/80 dark:border-white/5"
                title="Ligar para o lead"
              >
                <Phone className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleOpenWhatsApp}
                className="w-9 h-9 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 transition-all text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-sm"
                title="Abrir conversa no menu WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button 
                onClick={() => {
                  if (setActiveTab) {
                    if (setPrefilledLeadData) {
                      setPrefilledLeadData({
                        name: selectedLead.name,
                        phone: selectedLead.phone,
                        email: selectedLead.email
                      });
                    }
                    setActiveTab('agenda');
                  } else {
                    alert('Direcionando para a aba Agenda para marcar consulta...');
                  }
                }}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 dark:bg-[#0B1220]/60 dark:hover:bg-[#1A2333] active:scale-95 transition-all text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center border border-slate-200/80 dark:border-white/5"
                title="Agendar Consulta"
              >
                <Calendar className="w-4 h-4" />
              </button>

              <button 
                onClick={() => handleAttachMockFile(`Proposta_Tratamento_${selectedLead.name.replace(' ', '_')}.pdf`, '1.5 MB')}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 dark:bg-[#0B1220]/60 dark:hover:bg-[#1A2333] active:scale-95 transition-all text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center border border-slate-200/80 dark:border-white/5"
                title="Anexar Proposta Comercial (MOCK)"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            {/* Converter em Paciente */}
            <button
              onClick={handleConvertToPatient}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Tornar Paciente Ativo</span>
            </button>
          </div>
        </div>

        {/* BARRA VISUAL DE ESTÁGIOS DA JORNADA (FUNNEL STEPPER DIVIDIDO IGUALMENTE 6x2) */}
        <div className="px-6 py-3.5 bg-slate-50/90 dark:bg-[#0D0D0D] border-b border-slate-200/80 dark:border-white/5 space-y-3 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#196BFB] animate-pulse" />
              Estágio do Funil (12 Etapas Comerciais):
            </span>

            {/* Select Dropdown de Acesso Rápido */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">Seleção Direta:</span>
              <select
                value={selectedLead.stage || 0}
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  const updated = {
                    ...selectedLead,
                    stage: idx,
                    history: [
                      ...(selectedLead.history || []),
                      {
                        date: new Date().toISOString(),
                        type: 'STAGE_CHANGE',
                        description: `Estágio alterado para "${columns[idx]}"`,
                        user: user?.full_name || 'Profissional'
                      }
                    ]
                  };
                  updateCrmLead(updated);
                  setSelectedLead(updated);
                }}
                className="bg-white dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-1 text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer shadow-sm"
              >
                {columns.map((colName, idx) => (
                  <option key={colName} value={idx}>
                    {idx + 1}. {colName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Dividido Igualmente em 6 colunas (6 x 2 no desktop, 4 x 3 no tablet, 2 x 6 no mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 w-full">
            {columns.map((colName, idx) => {
              const isCurrent = (selectedLead.stage || 0) === idx;
              const isPassed = (selectedLead.stage || 0) > idx;
              return (
                <button
                  key={colName}
                  onClick={() => {
                    const updated = {
                      ...selectedLead,
                      stage: idx,
                      history: [
                        ...(selectedLead.history || []),
                        {
                          date: new Date().toISOString(),
                          type: 'STAGE_CHANGE',
                          description: `Estágio alterado para "${colName}"`,
                          user: user?.full_name || 'Profissional'
                        }
                      ]
                    };
                    updateCrmLead(updated);
                    setSelectedLead(updated);
                  }}
                  className={`w-full py-2 px-2 rounded-xl text-[10px] font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none text-center ${
                    isCurrent 
                      ? 'bg-[#196BFB] text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/30 font-black scale-[1.02]' 
                      : isPassed
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                  title={`Mover para ${colName}`}
                >
                  {isPassed && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0" />}
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />}
                  <span className="truncate">{colName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS CENTRAIS */}
        <div className="flex border-b border-slate-200/80 dark:border-white/5 px-6 bg-slate-50/50 dark:bg-[#0D0D0D] transition-colors duration-300">
          <button
            onClick={() => setActiveCenterTab('chat')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition-all ${
              activeCenterTab === 'chat' 
                ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Conversa & Timeline
          </button>

          <button
            onClick={() => setActiveCenterTab('financial')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeCenterTab === 'financial' 
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Orçamento & Financeiro</span>
          </button>

          <button
            onClick={() => setActiveCenterTab('details')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition-all ${
              activeCenterTab === 'details' 
                ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Dados Cadastrais
          </button>

          <button
            onClick={() => setActiveCenterTab('files')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition-all ${
              activeCenterTab === 'files' 
                ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Arquivos ({selectedLead.attachments?.length || 0})
          </button>
        </div>

        {/* CONTEÚDO DA ABA SELECIONADA */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          
          {/* 1. ABA CHAT & TIMELINE */}
          {activeCenterTab === 'chat' && (
            <div className="space-y-6 h-full flex flex-col justify-between">
              
              {/* Balões de Chat e Notas */}
              <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                {/* Nota do sistema no topo de criação do lead */}
                <div className="text-center py-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#0D0D0D] border border-slate-200/60 dark:border-white/5 rounded-xl max-w-xs mx-auto transition-colors duration-300">
                  Lead iniciado em {selectedLead.history?.[0] ? new Date(selectedLead.history[0].date).toLocaleDateString('pt-BR') : 'Hoje'}
                </div>

                {/* Comentários/Notas/Conversas */}
                {(selectedLead.comments || []).map((c, idx) => {
                  const isWa = c.mode === 'whatsapp';
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col max-w-[80%] ${
                        isWa ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      {/* Remetente/Data */}
                      <span className="text-[9px] text-slate-400 font-bold mb-1 px-1 flex items-center gap-1">
                        {isWa ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">WhatsApp</span>
                        ) : (
                          <span className="text-purple-600 dark:text-purple-400 font-extrabold uppercase">Nota Interna ({c.user})</span>
                        )}
                        <span>•</span>
                        <span>{new Date(c.date).toLocaleDateString('pt-BR')} às {new Date(c.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>

                      {/* Conteúdo */}
                      <div className={`p-3.5 rounded-2xl text-xs font-semibold ${
                        isWa 
                          ? 'bg-emerald-500 text-white rounded-tr-none shadow-[0_2px_8px_rgba(16,185,129,0.2)]' 
                          : 'bg-slate-100 dark:bg-[#0D0D0D] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/80 dark:border-white/5'
                      }`}>
                        {c.text}
                      </div>
                    </div>
                  );
                })}

                {/* Se não houver conversas */}
                {(!selectedLead.comments || selectedLead.comments.length === 0) && (
                  <div className="py-12 text-center text-slate-400 italic text-xs font-bold">
                    Nenhuma mensagem ou nota registrada para este lead.
                  </div>
                )}
              </div>

              {/* EDITOR DE NOTA INTERNA NO RODAPÉ */}
              <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/5 transition-colors duration-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite uma anotação interna..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#196BFB] hover:bg-[#155bd8] text-white font-bold text-xs rounded-xl shadow active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. ABA ORÇAMENTO & FINANCEIRO DO PACIENTE */}
          {activeCenterTab === 'financial' && (
            <div className="space-y-6 max-w-xl text-left">
              {/* Card de Destaque Financeiro */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-emerald-500/5 dark:from-emerald-950/30 dark:via-[#0D0D0D] dark:to-emerald-900/10 border border-emerald-500/20 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Proposta Comercial Estimada</span>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                      {selectedLead.budget_amount ? `R$ ${selectedLead.budget_amount.toLocaleString('pt-BR')}` : 'Sob Consulta'}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {selectedLead.stage >= 7 ? 'Orçamento Aprovado' : 'Em Negociação'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200/60 dark:border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Procedimento Dentário</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedLead.procedure_name || 'Consulta Geral / Diagnóstico'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Etapa Comercial</span>
                    <span className="font-bold text-slate-800 dark:text-white">{columns[selectedLead.stage || 0]}</span>
                  </div>
                </div>
              </div>

              {/* Edição Rápida do Orçamento */}
              <form onSubmit={handleSaveLeadEdits} className="p-5 rounded-2xl bg-white dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/5 space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>Atualizar Proposta Financeira</span>
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Valor do Orçamento (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editBudget}
                      onChange={(e) => setEditBudget(e.target.value)}
                      placeholder="Ex: 8500"
                      className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Procedimento Solicitado</label>
                    <input
                      type="text"
                      value={editProcedure}
                      onChange={(e) => setEditProcedure(e.target.value)}
                      placeholder="Ex: Lentes de Contato"
                      className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow active:scale-95 transition-all"
                >
                  Salvar Proposta Financeira
                </button>
              </form>
            </div>
          )}

          {/* 3. ABA DADOS CADASTRAIS DO LEAD */}
          {activeCenterTab === 'details' && (
            <form onSubmit={handleSaveLeadEdits} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Grau de Prioridade</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="high">Alta (Urgente)</option>
                    <option value="medium">Média (Normal)</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Procedimento de Interesse</label>
                  <input
                    type="text"
                    value={editProcedure}
                    onChange={(e) => setEditProcedure(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Orçamento Previsto (R$)</label>
                  <input
                    type="number"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#196BFB] text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all hover:opacity-95"
              >
                Salvar Dados Cadastrais
              </button>
            </form>
          )}

          {/* 3. ABA ARQUIVOS E ANEXOS */}
          {activeCenterTab === 'files' && (
            <div className="space-y-4 font-body">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/80 dark:border-white/5 transition-colors duration-300">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Lista de Anexos do Lead</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAttachMockFile('RaioX_Panoramico_Dental.png', '2.4 MB')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#0D0D0D] text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg transition-colors border border-slate-200/80 dark:border-white/5"
                  >
                    + Simular Raio-X
                  </button>
                  <button
                    onClick={() => handleAttachMockFile('Ficha_Anamnese_Inicial.pdf', '890 KB')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#0D0D0D] text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg transition-colors border border-slate-200/80 dark:border-white/5"
                  >
                    + Simular Anamnese
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(selectedLead.attachments || []).map((file, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-slate-50 dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/5 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{file.name}</h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{file.size}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Fazendo download simulado de ${file.name}...`)}
                      className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all"
                      title="Download do Arquivo"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {(!selectedLead.attachments || selectedLead.attachments.length === 0) && (
                  <div className="col-span-2 py-12 text-center text-slate-400 italic text-xs font-bold">
                    Nenhum anexo salvo para este paciente.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </>
    )}
  </div>

    </div>
  );
}
