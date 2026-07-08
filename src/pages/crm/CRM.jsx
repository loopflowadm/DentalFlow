import { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Plus, Search, CheckSquare, MessageSquare, Paperclip, 
  Clock, X, Phone, Calendar, Send, Sparkles, Download, 
  Check, FileText, ArrowRight, UserCheck, AlertCircle, HelpCircle
} from 'lucide-react';

export default function CRM({ selectedLead, setSelectedLead }) {
  const { crmLeads, updateCrmLead, patients } = useClinic();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  
  // Lista de Colunas (Etapas)
  const columns = [
    'Novo Paciente', 'Primeiro Contato', 'Avaliação Agendada', 'Confirmado', 
    'Compareceu', 'Orçamento', 'Negociação', 'Fechado', 
    'Tratamento', 'Retorno', 'Concluído', 'Perdido'
  ];

  // Abas do painel central
  const [activeCenterTab, setActiveCenterTab] = useState('chat'); // 'chat' | 'details' | 'files'

  // Input de Mensagem/Nota
  const [inputText, setInputText] = useState('');
  const [inputMode, setInputMode] = useState('whatsapp'); // 'whatsapp' | 'note'

  // Campos para Edição do Lead
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editProcedure, setEditProcedure] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editPriority, setEditPriority] = useState('medium');

  // Input de checklist rápido no Widget Direito
  const [newChecklistText, setNewChecklistText] = useState('');

  // Selecionar o primeiro lead caso nenhum esteja ativo ao montar
  useEffect(() => {
    if (!selectedLead && crmLeads.length > 0) {
      setSelectedLead(crmLeads[0]);
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
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-[28px] border border-slate-200/40 dark:border-slate-800/40">
        <HelpCircle className="w-16 h-16 text-slate-350 dark:text-slate-600 animate-bounce mb-4" />
        <h3 className="text-lg font-bold font-title text-slate-850 dark:text-white">Nenhum Paciente Selecionado</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Selecione um paciente na lista lateral para ver os detalhes, conversas e widgets.
        </p>
      </div>
    );
  }

  // Ações de Atualização do Lead
  const handleSaveDetails = (e) => {
    e.preventDefault();
    const updated = {
      ...selectedLead,
      name: editName,
      phone: editPhone,
      procedure_name: editProcedure,
      budget_amount: parseFloat(editBudget) || 0,
      priority: editPriority,
      history: [
        ...(selectedLead.history || []),
        {
          date: new Date().toISOString(),
          type: 'EDIT',
          description: `Atualizou os dados cadastrais comerciais`,
          user: user?.full_name || 'Profissional'
        }
      ]
    };
    updateCrmLead(updated);
    setSelectedLead(updated);
    alert('Dados atualizados com sucesso!');
  };

  const handleUpdateStage = (newStageIdx) => {
    const updated = {
      ...selectedLead,
      stage: newStageIdx,
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

  const handleConvertToPatient = () => {
    if (window.confirm(`Deseja converter "${selectedLead.name}" em paciente clínico ativo? Ele sairá do funil.`)) {
      const updated = {
        ...selectedLead,
        stage: null,
        history: [
          ...(selectedLead.history || []),
          { 
            date: new Date().toISOString(), 
            type: 'CONVERSION', 
            description: 'Paciente convertido em ativo e direcionado ao prontuário', 
            user: user?.full_name || 'Profissional' 
          }
        ]
      };
      updateCrmLead(updated);
      setSelectedLead(null);
    }
  };

  // Enviar Mensagem (WhatsApp) ou Nota Interna
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const isWa = inputMode === 'whatsapp';
    
    // Novo item de histórico / comentário
    const newComment = {
      date: new Date().toISOString(),
      text: inputText,
      user: user?.full_name || 'Profissional',
      mode: inputMode // 'whatsapp' ou 'note'
    };

    const updated = {
      ...selectedLead,
      comments: [...(selectedLead.comments || []), newComment],
      history: [
        ...(selectedLead.history || []),
        {
          date: new Date().toISOString(),
          type: isWa ? 'WHATSAPP_SEND' : 'NOTE_ADD',
          description: isWa ? `Mensagem simulada enviada: "${inputText}"` : `Adicionou nota interna: "${inputText}"`,
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
      {/* COLUNA 2: DETALHES DO LEAD (CENTRO - 60% / FLEX-1)                         */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-850 rounded-[28px] border border-slate-200/40 dark:border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.01)] overflow-hidden">
        
        {/* HEADER DO LEAD */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {selectedLead.avatar || '👤'}
            </span>
            <div>
              <h2 className="text-lg font-black font-title text-slate-850 dark:text-white flex items-center gap-2">
                {selectedLead.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {selectedLead.procedure_name || 'Consulta Geral'}
                </span>
                <span className="text-[10px] text-slate-450">•</span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {selectedLead.phone}
                </span>
                
                {/* Badges de Status */}
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                  selectedLead.priority === 'high' ? 'bg-[#FF5B60]/10 text-[#FF5B60]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  Prioridade: {selectedLead.priority === 'high' ? 'Alta' : selectedLead.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>

                <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-sky-500/10 text-sky-400">
                  {columns[selectedLead.stage]}
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
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center"
                title="Ligar para o lead"
              >
                <Phone className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setInputMode('whatsapp')}
                className={`w-9 h-9 active:scale-95 transition-all rounded-full flex items-center justify-center ${
                  inputMode === 'whatsapp' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350'
                }`}
                title="Simular conversa de WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button 
                onClick={() => alert('Direcionando para a aba Agenda para marcar consulta...')}
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all text-slate-600 dark:text-slate-350 rounded-full flex items-center justify-center"
                title="Agendar Consulta"
              >
                <Calendar className="w-4 h-4" />
              </button>

              <button 
                onClick={() => handleAttachMockFile(`Proposta_Tratamento_${selectedLead.name.replace(' ', '_')}.pdf`, '1.5 MB')}
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all text-slate-600 dark:text-slate-350 rounded-full flex items-center justify-center"
                title="Anexar Proposta Comercial (MOCK)"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            {/* Converter em Paciente */}
            <button
              onClick={handleConvertToPatient}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Tornar Paciente Ativo</span>
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS CENTRAIS */}
        <div className="flex border-b border-slate-100 dark:border-slate-800/60 px-6 bg-slate-50/50 dark:bg-slate-900/10">
          <button
            onClick={() => setActiveCenterTab('chat')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition-all ${
              activeCenterTab === 'chat' 
                ? 'border-secondary text-secondary' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Conversa & Timeline
          </button>
          <button
            onClick={() => setActiveCenterTab('details')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition-all ${
              activeCenterTab === 'details' 
                ? 'border-secondary text-secondary' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Dados Cadastrais
          </button>
          <button
            onClick={() => setActiveCenterTab('files')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition-all ${
              activeCenterTab === 'files' 
                ? 'border-secondary text-secondary' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
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
                <div className="text-center py-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100/50 dark:bg-slate-800/40 rounded-xl max-w-xs mx-auto">
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
                          <span className="text-emerald-500 font-extrabold uppercase">WhatsApp</span>
                        ) : (
                          <span className="text-violet-500 font-extrabold uppercase">Nota Interna ({c.user})</span>
                        )}
                        <span>•</span>
                        <span>{new Date(c.date).toLocaleDateString('pt-BR')} às {new Date(c.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>

                      {/* Conteúdo */}
                      <div className={`p-3.5 rounded-2xl text-xs font-semibold ${
                        isWa 
                          ? 'bg-emerald-500 text-white rounded-tr-none shadow-[0_2px_8px_rgba(16,185,129,0.2)]' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-tl-none border border-slate-200/20'
                      }`}>
                        {c.text}
                      </div>
                    </div>
                  );
                })}

                {/* Se não houver conversas */}
                {(!selectedLead.comments || selectedLead.comments.length === 0) && (
                  <div className="py-12 text-center text-slate-450 italic text-xs">
                    Nenhuma mensagem ou nota registrada para este lead.
                  </div>
                )}
              </div>

              {/* EDITOR DE MENSAGEM / NOTA NO RODAPÉ */}
              <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                    <button
                      type="button"
                      onClick={() => setInputMode('whatsapp')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        inputMode === 'whatsapp' 
                          ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' 
                          : 'text-slate-400'
                      }`}
                    >
                      Enviar WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('note')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        inputMode === 'note' 
                          ? 'bg-white dark:bg-slate-700 text-violet-500 shadow-sm' 
                          : 'text-slate-400'
                      }`}
                    >
                      Nota Interna
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Destinatário: {selectedLead.name}
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={2}
                    placeholder={inputMode === 'whatsapp' ? "Escrever mensagem de WhatsApp (simulada)..." : "Escrever nota interna de atendimento..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl py-3 px-4 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary placeholder:text-slate-500 resize-none pr-12"
                  />

                  <button
                    type="submit"
                    className="absolute right-3.5 bottom-3.5 p-2 bg-secondary hover:bg-secondary/90 text-white rounded-xl active:scale-95 transition-all shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* 2. ABA DADOS CADASTRAIS */}
          {activeCenterTab === 'details' && (
            <form onSubmit={handleSaveDetails} className="space-y-4 max-w-md text-slate-800 dark:text-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/65 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Telefone Celular</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/65 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Procedimento de Interesse</label>
                  <input
                    type="text"
                    value={editProcedure}
                    onChange={(e) => setEditProcedure(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/65 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Orçamento Previsto (R$)</label>
                  <input
                    type="number"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/65 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Grau de Prioridade</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/65 rounded-xl py-2 px-3 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="high">Alta (Urgente)</option>
                  <option value="medium">Média (Normal)</option>
                  <option value="low">Baixa</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-secondary text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all hover:opacity-95"
              >
                Salvar Dados Cadastrais
              </button>
            </form>
          )}

          {/* 3. ABA ARQUIVOS E ANEXOS */}
          {activeCenterTab === 'files' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Lista de Anexos do Lead</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAttachMockFile('RaioX_Panoramico_Dental.png', '2.4 MB')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg transition-colors"
                  >
                    + Simular Raio-X
                  </button>
                  <button
                    onClick={() => handleAttachMockFile('Ficha_Anamnese_Inicial.pdf', '890 KB')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg transition-colors"
                  >
                    + Simular Anamnese
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(selectedLead.attachments || []).map((file, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-8 h-8 text-violet-500 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{file.name}</h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{file.size}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Fazendo download simulado de ${file.name}...`)}
                      className="p-2 text-slate-450 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                      title="Download do Arquivo"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {(!selectedLead.attachments || selectedLead.attachments.length === 0) && (
                  <div className="col-span-2 py-12 text-center text-slate-450 italic text-xs">
                    Nenhum documento anexado a este lead comercial.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* COLUNA 3: PAINEL DE WIDGETS (DIREITA - 40% / 350px)                        */}
      {/* ========================================================================= */}
      <div className="w-96 min-w-[340px] flex flex-col gap-4 overflow-y-auto pr-1 flex-shrink-0">
        
        {/* WIDGET 1: INFORMAÇÕES DE INTERESSE (ROXO LAVANDA PASTEL) */}
        <div className="widget-lavender rounded-[28px] p-5 flex flex-col gap-4 text-slate-800 dark:text-slate-150">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-black text-[#8585D6] dark:text-[#A3A3FF] block tracking-wider">Interesse em Procedimento</span>
              <h3 className="text-sm font-black font-title text-slate-900 dark:text-white mt-0.5">
                {selectedLead.procedure_name || 'Consulta Geral'}
              </h3>
            </div>
            
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveCenterTab('details'); }}
              className="p-1.5 bg-[#8585D6]/20 text-[#8585D6] dark:text-[#A3A3FF] rounded-lg hover:bg-[#8585D6]/30 transition-all active:scale-95"
              title="Acessar dados cadastrais"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Valor de Orçamento Previsto */}
          <div className="py-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Orçamento Previsto</span>
            <span className="text-2xl font-black font-title text-slate-900 dark:text-white">
              {selectedLead.budget_amount ? `R$ ${selectedLead.budget_amount.toLocaleString('pt-BR')}` : 'Sob Consulta'}
            </span>
          </div>

          {/* Seletor rápido de Estágio do Funil */}
          <div className="space-y-2 border-t border-slate-800/10 dark:border-slate-800/20 pt-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mudar Estágio do Lead</label>
            <select
              value={selectedLead.stage}
              onChange={(e) => handleUpdateStage(parseInt(e.target.value))}
              className="w-full bg-white dark:bg-slate-800 text-slate-850 dark:text-white border border-slate-300/40 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-500 cursor-pointer"
            >
              {columns.map((col, idx) => (
                <option key={idx} value={idx}>{col}</option>
              ))}
            </select>
          </div>

          {/* Critérios de Conversão (Checklist comercial) */}
          <div className="space-y-2.5 border-t border-slate-800/10 dark:border-slate-800/20 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critérios de Fechamento</span>
              <span className="text-[9px] bg-[#8585D6]/15 text-[#8585D6] dark:text-[#A3A3FF] font-black px-2 py-0.5 rounded-full">
                {selectedLead.checklist?.filter(c => c.completed).length || 0}/{selectedLead.checklist?.length || 0}
              </span>
            </div>

            {/* Lista do Checklist */}
            <div className="space-y-1.5">
              {(selectedLead.checklist || []).map(item => (
                <label 
                  key={item.id}
                  className="flex items-center gap-2.5 cursor-pointer p-2 hover:bg-[#8585D6]/10 dark:hover:bg-[#8585D6]/5 rounded-xl transition-all"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklist(item.id)}
                    className="rounded text-violet-500 focus:ring-violet-500 w-3.5 h-3.5 bg-white dark:bg-slate-800 border-slate-350"
                  />
                  <span className={`text-xs font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {item.text}
                  </span>
                </label>
              ))}

              {/* Input rápido de novo critério */}
              <form onSubmit={handleAddChecklistItem} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Novo critério de fechamento..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-300/40 rounded-lg p-1.5 text-[11px] text-slate-800 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white dark:text-slate-100 rounded-lg text-[10px] font-bold transition-all"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* WIDGET 2: TAREFA COMERCIAL (ESMERALDA) */}
        <div className="widget-emerald rounded-[28px] p-5 flex flex-col gap-4 text-slate-800 dark:text-slate-155">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-black text-[#059669] dark:text-[#34D399] block tracking-wider font-title">Tarefa Comercial Ativa</span>
              <h3 className="text-sm font-black font-title text-slate-900 dark:text-white mt-0.5">
                Enviar proposta de tratamento
              </h3>
            </div>
            
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5B60] animate-ping" title="Ação Urgente" />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Elaborar o orçamento do procedimento de {selectedLead.procedure_name || 'Consulta Geral'} e encaminhar o PDF da proposta ao paciente via chat comercial.
          </p>

          {/* PDF de Proposta Rápida */}
          <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-300/10 dark:border-slate-800/60 flex items-center justify-between hover:border-slate-300/50 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <FileText className="w-7 h-7 text-emerald-500 flex-shrink-0" />
              <div className="overflow-hidden">
                <span className="text-[11px] font-bold text-slate-800 dark:text-white block truncate">
                  Proposta_{selectedLead.name.replace(' ', '_')}.pdf
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">1.2 MB • Proposta Padrão</span>
              </div>
            </div>

            <button
              onClick={() => handleAttachMockFile(`Proposta_${selectedLead.name.replace(' ', '_')}.pdf`, '1.2 MB')}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-white transition-colors"
              title="Anexar Proposta ao Histórico"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Footer Ações rápidas */}
          <div className="flex gap-2 pt-2 border-t border-slate-850/5 dark:border-slate-800/20">
            <button
              onClick={() => {
                alert('Mensagem enviada com link da proposta via WhatsApp (Simulado).');
                setInputText(`Olá! Conforme conversamos, segue em anexo a proposta para o seu procedimento. Caso tenha alguma dúvida, estou à disposição.`);
                setInputMode('whatsapp');
              }}
              className="flex-1 py-2 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow hover:opacity-90"
              style={{ backgroundColor: currentTheme.secondary_color }}
            >
              <Send className="w-3 h-3 text-white" />
              <span>Enviar Proposta</span>
            </button>

            <button
              onClick={() => {
                alert('Tarefa marcada como concluída!');
                // Registrar no histórico
                const updated = {
                  ...selectedLead,
                  history: [
                    ...(selectedLead.history || []),
                    {
                      date: new Date().toISOString(),
                      type: 'TASK_COMPLETE',
                      description: 'Concluiu a tarefa: "Enviar proposta de tratamento"',
                      user: user?.full_name || 'Profissional'
                    }
                  ]
                };
                updateCrmLead(updated);
                setSelectedLead(updated);
              }}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl flex items-center justify-center active:scale-95 transition-all border border-slate-300/40"
              title="Marcar tarefa como resolvida"
            >
              <Check className="w-4 h-4 text-emerald-500 font-bold" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
