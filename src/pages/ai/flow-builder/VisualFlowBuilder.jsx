import React, { useState, useCallback, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  reconnectEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './customNodes';
import { edgeTypes } from './customEdges';
import { 
  MessageSquare, Sliders, Bot, UserCheck, Clock, 
  Save, RotateCcw, Plus, Zap, Eye, CheckCircle2, Trash2 
} from 'lucide-react';
import { useClinic } from '../../../context/ClinicContext';

// ── Layout Ultra-Espaçado Organizado Por Faixas (Automação Pura Sem IA por Padrão) ──
const defaultNodes = [
  {
    id: 'node-welcome',
    type: 'messageNode',
    position: { x: 50, y: 400 },
    data: { content: 'Olá, {NOME_PACIENTE}! Seja bem-vindo(a) à {NOME_CLINICA}. Como posso te ajudar hoje?' }
  },
  {
    id: 'node-menu-main',
    type: 'menuNode',
    position: { x: 520, y: 280 },
    data: { 
      title: 'Por favor, escolha uma das opções abaixo:',
      options: [
        '1. Agendar ou remarcar consulta',
        '2. Tabela de procedimentos e valores',
        '3. Endereço e horários de atendimento',
        '4. Urgência ou dor forte',
        '5. Falar com a recepção'
      ]
    }
  },

  // Ramificação 1: Agendamento -> Menu de Escolha de Horários -> Confirmação Direta no CRM
  {
    id: 'node-msg-agenda',
    type: 'messageNode',
    position: { x: 1080, y: 50 },
    data: { content: 'Temos os seguintes horários livres disponíveis para consulta na {NOME_CLINICA}:\n\n1. Amanhã às 14:30 (Dr. Lucas)\n2. Sexta-feira às 10:00 (Dra. Juliana)' }
  },
  {
    id: 'node-menu-agenda',
    type: 'menuNode',
    position: { x: 1560, y: 50 },
    data: {
      title: 'Deseja confirmar algum destes horários?',
      options: [
        '1. Confirmar amanhã 14:30',
        '2. Confirmar sexta 10:00',
        '3. Falar com a recepção para outro horário'
      ]
    }
  },
  {
    id: 'node-transfer-agenda-human',
    type: 'transferNode',
    position: { x: 2060, y: 220 },
    data: { reason: 'Paciente solicitou horário personalizado com a recepção' }
  },

  // Ramificação 2: Tabela de Valores -> Submenu -> Agendar ou Recepção
  {
    id: 'node-msg-prices',
    type: 'messageNode',
    position: { x: 1080, y: 420 },
    data: { content: 'Nossos principais tratamentos na {NOME_CLINICA}:\n{LISTA_PROCEDIMENTOS}\n\nAceitamos cartões de crédito em até 12x e convênios parceiros!' }
  },
  {
    id: 'node-menu-prices',
    type: 'menuNode',
    position: { x: 1560, y: 420 },
    data: {
      title: 'Gostaria de agendar algum destes procedimentos?',
      options: ['1. Sim, quero agendar agora', '2. Quero falar com um atendente']
    }
  },
  {
    id: 'node-transfer-human-prices',
    type: 'transferNode',
    position: { x: 2060, y: 620 },
    data: { reason: 'Paciente consultou a tabela e solicitou atendente presencial' }
  },

  // Ramificação 3: Endereço & Horários
  {
    id: 'node-msg-location',
    type: 'messageNode',
    position: { x: 1080, y: 780 },
    data: { content: '📍 {NOME_CLINICA}\n🏢 Endereço: {ENDERECO_COMPLETO}\n⏰ Horário: {HORARIO_FUNCIONAMENTO}\n📞 Contato: {TELEFONE_CONTATO}' }
  },

  // Ramificação 4: Urgência / Dor Forte
  {
    id: 'node-transfer-urgency',
    type: 'transferNode',
    position: { x: 1080, y: 1080 },
    data: { reason: 'ATENÇÃO: Paciente relatou Urgência / Dor Forte. Notificação prioritária enviada à recepção!' }
  },

  // Ramificação 5: Transferência Direta para Recepção
  {
    id: 'node-transfer-human',
    type: 'transferNode',
    position: { x: 1080, y: 1360 },
    data: { reason: 'Paciente escolheu falar diretamente com a recepção' }
  }
];

const defaultEdges = [
  { id: 'e-welcome-menu', type: 'buttonEdge', source: 'node-welcome', target: 'node-menu-main', animated: true, style: { stroke: '#00a884', strokeWidth: 2 } },
  { id: 'e-opt-0-agenda', type: 'buttonEdge', source: 'node-menu-main', sourceHandle: 'opt-0', target: 'node-msg-agenda', animated: true, style: { stroke: '#00a884', strokeWidth: 2 } },
  { id: 'e-msg-agenda-menu', type: 'buttonEdge', source: 'node-msg-agenda', target: 'node-menu-agenda', animated: true, style: { stroke: '#00a884', strokeWidth: 2 } },
  { id: 'e-agenda-human', type: 'buttonEdge', source: 'node-menu-agenda', sourceHandle: 'opt-2', target: 'node-transfer-agenda-human', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: 'e-opt-1-prices', type: 'buttonEdge', source: 'node-menu-main', sourceHandle: 'opt-1', target: 'node-msg-prices', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e-prices-menu', type: 'buttonEdge', source: 'node-msg-prices', target: 'node-menu-prices', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e-prices-agendar', type: 'buttonEdge', source: 'node-menu-prices', sourceHandle: 'opt-0', target: 'node-msg-agenda', animated: true, style: { stroke: '#00a884', strokeWidth: 2 } },
  { id: 'e-prices-human', type: 'buttonEdge', source: 'node-menu-prices', sourceHandle: 'opt-1', target: 'node-transfer-human-prices', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: 'e-opt-2-location', type: 'buttonEdge', source: 'node-menu-main', sourceHandle: 'opt-2', target: 'node-msg-location', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e-opt-3-urgency', type: 'buttonEdge', source: 'node-menu-main', sourceHandle: 'opt-3', target: 'node-transfer-urgency', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: 'e-opt-4-reception', type: 'buttonEdge', source: 'node-menu-main', sourceHandle: 'opt-4', target: 'node-transfer-human', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }
];

export default function VisualFlowBuilder({ onOpenInspector }) {
  const { aiConfig, saveAiConfig } = useClinic();

  // Detecção de Tema Claro / Escuro
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const updateDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    updateDarkMode();
    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar fluxo salvo previamente se existir
  useEffect(() => {
    if (aiConfig?.flowData?.nodes && aiConfig.flowData.nodes.length > 0) {
      setNodes(aiConfig.flowData.nodes);
    }
    if (aiConfig?.flowData?.edges && aiConfig.flowData.edges.length > 0) {
      setEdges(aiConfig.flowData.edges);
    }
  }, [aiConfig]);

  // Excluir Conexão por ID
  const handleDeleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  }, [setEdges]);

  // Injetar handler de exclusão nas edges
  const edgesWithHandlers = edges.map((e) => ({
    ...e,
    type: 'buttonEdge',
    data: {
      ...e.data,
      onDeleteEdge: handleDeleteEdge
    }
  }));

  // Handler para atualizar campo simples do nó
  const updateNodeData = useCallback((nodeId, field, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Excluir Nó por ID
  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  // Opções do Menu
  const handleAddOption = useCallback((nodeId) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const currentOpts = node.data.options || [];
          const newOptNum = currentOpts.length + 1;
          return {
            ...node,
            data: {
              ...node.data,
              options: [...currentOpts, `${newOptNum}. Nova opção`]
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleRemoveOption = useCallback((nodeId, optIdx) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const currentOpts = node.data.options || [];
          return {
            ...node,
            data: {
              ...node.data,
              options: currentOpts.filter((_, idx) => idx !== optIdx)
            }
          };
        }
        return node;
      })
    );
    setEdges((eds) => eds.filter((e) => !(e.source === nodeId && e.sourceHandle === `opt-${optIdx}`)));
  }, [setNodes, setEdges]);

  const handleEditOption = useCallback((nodeId, optIdx, newText) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const currentOpts = [...(node.data.options || [])];
          currentOpts[optIdx] = newText;
          return {
            ...node,
            data: {
              ...node.data,
              options: currentOpts
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Injetar os handlers completos em cada nó
  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      isDarkMode,
      onDeleteNode: handleDeleteNode,
      onAddOption: handleAddOption,
      onRemoveOption: handleRemoveOption,
      onEditOption: handleEditOption,
      onChangeContent: (id, val) => updateNodeData(id, 'content', val),
      onChangeTitle: (id, val) => updateNodeData(id, 'title', val),
      onChangePrompt: (id, val) => updateNodeData(id, 'prompt', val),
      onChangeReason: (id, val) => updateNodeData(id, 'reason', val),
      onChangeMinutes: (id, val) => updateNodeData(id, 'minutes', val)
    }
  }));

  // Nova Conexão entre Nós
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'buttonEdge', animated: true, style: { stroke: '#00a884', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  // Reconectar linha existente puxando da ponta
  const onReconnect = useCallback(
    (oldEdge, newConnection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [setEdges]
  );

  // Adicionar um novo nó no canvas
  const addNode = (type) => {
    const newId = `node-${Date.now()}`;
    const position = { x: 350 + Math.random() * 60, y: 250 + Math.random() * 60 };

    let data = { isDarkMode };
    if (type === 'messageNode') data.content = 'Nova mensagem de atendimento...';
    if (type === 'menuNode') data = { ...data, title: 'Escolha uma opção:', options: ['1. Opção A', '2. Opção B'] };
    if (type === 'aiNode') data.prompt = 'Instrução do passo para a Sofia IA...';
    if (type === 'transferNode') data.reason = 'Transferido para o atendimento presencial';
    if (type === 'delayNode') data.minutes = 5;

    setNodes((nds) => [...nds, { id: newId, type, position, data }]);
  };

  // Salvar Fluxo no Supabase / Contexto
  const handleSaveFlow = async () => {
    setIsSaving(true);
    try {
      await saveAiConfig({
        ...aiConfig,
        flowData: { nodes, edges }
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar fluxo:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Resetar para o template padrão
  const handleResetDefault = () => {
    if (window.confirm('Deseja restaurar o fluxo de atendimento padrão ultra-espaçado?')) {
      setNodes(defaultNodes);
      setEdges(defaultEdges);
    }
  };

  return (
    <div className={`w-full h-full flex flex-col relative font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0b141a] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* ── Toolbar Superior ── */}
      <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 z-10 transition-colors ${
        isDarkMode ? 'bg-[#121b22] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="text-left">
            <h2 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Editor Visual de Fluxo de Atendimento
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Layout ultra-espaçado • Clique no ✕ para remover conexões • Arraste os círculos para conectar
            </p>
          </div>
        </div>

        {/* Botoes de Ação */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInspector}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>Inspetor / Logs</span>
          </button>

          <button
            onClick={handleResetDefault}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            onClick={handleSaveFlow}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00a884] hover:bg-[#008f70] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Fluxo Salvo!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Fluxo'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Corpo do Flow Builder (Sidebar Docked + Canvas) ── */}
      <div className="flex-1 flex w-full h-full overflow-hidden relative">
        
        {/* ── Paleta Docked de Nós (Sem sobreposição) ── */}
        <div className={`w-52 md:w-56 border-r p-3 flex flex-col gap-2 flex-shrink-0 overflow-y-auto transition-colors ${
          isDarkMode ? 'border-slate-800 bg-[#0d161d]' : 'border-slate-200 bg-white'
        }`}>
          <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-500/20">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Adicionar Nós
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">5 tipos</span>
          </div>

          {/* 1. Mensagem Automática */}
          <button
            onClick={() => addNode('messageNode')}
            className={`group flex items-start gap-2.5 p-2 rounded-xl text-left border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-[#1f2c34]/60 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-400 border-slate-800 hover:border-emerald-500/40' 
                : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-none mb-0.5">+ Mensagem</span>
              <span className={`text-[10px] block leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Texto fixo ou variáveis
              </span>
            </div>
          </button>

          {/* 2. Menu de Escolhas */}
          <button
            onClick={() => addNode('menuNode')}
            className={`group flex items-start gap-2.5 p-2 rounded-xl text-left border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-[#1f2c34]/60 hover:bg-blue-500/20 text-slate-200 hover:text-blue-400 border-slate-800 hover:border-blue-500/40' 
                : 'bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-500 group-hover:scale-110 transition-transform">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-none mb-0.5">+ Menu Opções</span>
              <span className={`text-[10px] block leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Ramificações e botões
              </span>
            </div>
          </button>

          {/* 3. Agente IA */}
          <button
            onClick={() => addNode('aiNode')}
            className={`group flex items-start gap-2.5 p-2 rounded-xl text-left border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-[#1f2c34]/60 hover:bg-purple-500/20 text-slate-200 hover:text-purple-400 border-slate-800 hover:border-purple-500/40' 
                : 'bg-slate-50 hover:bg-purple-50 text-slate-800 hover:text-purple-700 border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-500 group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-none mb-0.5">+ Agente IA</span>
              <span className={`text-[10px] block leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Atendimento autônomo
              </span>
            </div>
          </button>

          {/* 4. Transição Humana */}
          <button
            onClick={() => addNode('transferNode')}
            className={`group flex items-start gap-2.5 p-2 rounded-xl text-left border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-[#1f2c34]/60 hover:bg-red-500/20 text-slate-200 hover:text-red-400 border-slate-800 hover:border-red-500/40' 
                : 'bg-slate-50 hover:bg-red-50 text-slate-800 hover:text-red-700 border-slate-200 hover:border-red-300'
            }`}
          >
            <div className="p-1.5 rounded-lg bg-red-500/15 text-red-500 group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-none mb-0.5">+ Parar / Humano</span>
              <span className={`text-[10px] block leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Transfere p/ recepção
              </span>
            </div>
          </button>

          {/* 5. Aguardar Tempo */}
          <button
            onClick={() => addNode('delayNode')}
            className={`group flex items-start gap-2.5 p-2 rounded-xl text-left border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-[#1f2c34]/60 hover:bg-amber-500/20 text-slate-200 hover:text-amber-400 border-slate-800 hover:border-amber-500/40' 
                : 'bg-slate-50 hover:bg-amber-50 text-slate-800 hover:text-amber-700 border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-none mb-0.5">+ Aguardar Tempo</span>
              <span className={`text-[10px] block leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Delay ou pausa
              </span>
            </div>
          </button>
        </div>

        {/* ── Canvas Principal React Flow ── */}
        <div className="flex-1 w-full h-full relative">
          <ReactFlow
            nodes={nodesWithHandlers}
            edges={edgesWithHandlers}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            reconnectRadius={20}
            edgesReconnectable={true}
            edgesFocusable={true}
            deleteKeyCode={['Backspace', 'Delete']}
            colorMode={isDarkMode ? 'dark' : 'light'}
          >
            <Background color={isDarkMode ? '#1f2c34' : '#cbd5e1'} gap={20} size={1} />
            <Controls className={`!rounded-xl border ${
              isDarkMode ? '!bg-[#121b22] !border-slate-800 !text-slate-200' : '!bg-white !border-slate-300 !text-slate-800'
            }`} />
            <MiniMap 
              nodeColor={(n) => {
                if (n.type === 'messageNode') return '#00a884';
                if (n.type === 'menuNode') return '#3b82f6';
                if (n.type === 'aiNode') return '#a855f7';
                if (n.type === 'transferNode') return '#ef4444';
                return '#f59e0b';
              }}
              maskColor={isDarkMode ? 'rgba(11, 20, 26, 0.7)' : 'rgba(248, 250, 252, 0.7)'}
              className={`!rounded-xl border ${
                isDarkMode ? '!bg-[#121b22] !border-slate-800' : '!bg-white !border-slate-300'
              }`} 
            />
          </ReactFlow>
        </div>

      </div>
    </div>
  );
}
