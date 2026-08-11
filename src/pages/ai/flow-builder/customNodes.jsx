import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  MessageSquare, Sliders, Bot, UserCheck, Clock, 
  Trash2, Plus, X, ArrowRight, Zap 
} from 'lucide-react';

/* ── Estilos de nós adaptativos no padrão macOS Depth UI com Conexões Laterais Visíveis ── */

// 1. Nó de Mensagem de Texto
export const MessageNode = memo(({ id, data, isSelected }) => {
  const isDark = data.isDarkMode !== false;

  return (
    <div className={`w-72 border relative rounded-2xl ${
      isSelected ? 'border-[#00a884] ring-2 ring-[#00a884]/40' : isDark ? 'border-slate-800' : 'border-slate-300'
    } ${isDark ? 'bg-[#121b22] text-slate-100 shadow-2xl' : 'bg-white text-slate-900 shadow-xl'} font-sans transition-all`}>
      {/* Handle de Entrada (Esquerda) - 16px Visível */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className={`!w-4 !h-4 !bg-[#00a884] !border-2 ${isDark ? '!border-[#121b22]' : '!border-white'} !-left-2.5 !z-50 hover:!scale-125 transition-transform cursor-crosshair`} 
      />
      
      {/* Header do Card */}
      <div className={`px-3.5 py-2.5 flex items-center justify-between border-b rounded-t-2xl ${
        isDark ? 'bg-[#1f2c34] border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Mensagem Automática</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
            isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
          }`}>WhatsApp</span>

          {/* Botão de Excluir Nó */}
          {data.onDeleteNode && (
            <button
              onClick={() => data.onDeleteNode(id)}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg cursor-pointer"
              title="Excluir Nó"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 space-y-2 text-left">
        <label className={`text-[11px] font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Texto da Mensagem:</label>
        <textarea
          rows={3}
          value={data.content || ''}
          onChange={(e) => data.onChangeContent && data.onChangeContent(id, e.target.value)}
          placeholder="Digite a mensagem... Use {NOME_PACIENTE}, {HORARIO}"
          className={`w-full border rounded-xl p-2 text-xs leading-relaxed focus:outline-none focus:border-[#00a884] transition-all resize-none ${
            isDark ? 'bg-[#0b141a] border-slate-800 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
          }`}
        />
        <div className={`flex flex-wrap gap-1 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <span className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
            isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'
          }`} onClick={() => data.onChangeContent && data.onChangeContent(id, (data.content || '') + ' {NOME_PACIENTE}')}>+{'{NOME_PACIENTE}'}</span>
          <span className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
            isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'
          }`} onClick={() => data.onChangeContent && data.onChangeContent(id, (data.content || '') + ' {HORARIO}')}>+{'{HORARIO}'}</span>
        </div>
      </div>

      {/* Handle de Saída (Direita) - 16px Visível */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className={`!w-4 !h-4 !bg-[#00a884] !border-2 ${isDark ? '!border-[#121b22]' : '!border-white'} !-right-2.5 !z-50 hover:!scale-125 transition-transform cursor-crosshair`} 
      />
    </div>
  );
});

// 2. Nó de Opções / Ramificação do Paciente
export const MenuNode = memo(({ id, data, isSelected }) => {
  const isDark = data.isDarkMode !== false;
  const options = data.options || ['1. Agendar Consulta', '2. Dúvidas e Preços', '3. Falar com Atendente'];

  return (
    <div className={`w-80 border relative rounded-2xl ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-500/40' : isDark ? 'border-slate-800' : 'border-slate-300'
    } ${isDark ? 'bg-[#121b22] text-slate-100 shadow-2xl' : 'bg-white text-slate-900 shadow-xl'} font-sans transition-all`}>
      {/* Handle de Entrada (Esquerda) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className={`!w-4 !h-4 !bg-blue-500 !border-2 ${isDark ? '!border-[#121b22]' : '!border-white'} !-left-2.5 !z-50 hover:!scale-125 transition-transform cursor-crosshair`} 
      />

      {/* Header do Card */}
      <div className={`px-3.5 py-2.5 flex items-center justify-between border-b rounded-t-2xl ${
        isDark ? 'bg-[#1f2c34] border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
          <Sliders className="w-3.5 h-3.5" />
          <span>Menu de Opções (Ramificação)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
            isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'
          }`}>Escolha</span>

          {/* Botão de Excluir Nó */}
          {data.onDeleteNode && (
            <button
              onClick={() => data.onDeleteNode(id)}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg cursor-pointer"
              title="Excluir Nó"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 space-y-2.5 text-left">
        <input
          type="text"
          value={data.title || 'Escolha uma opção:'}
          onChange={(e) => data.onChangeTitle && data.onChangeTitle(id, e.target.value)}
          placeholder="Título da pergunta..."
          className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 ${
            isDark ? 'bg-[#0b141a] border-slate-800 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
          }`}
        />

        {/* Lista de Opções com Edição e Exclusão */}
        <div className="space-y-1.5">
          {options.map((opt, idx) => (
            <div key={idx} className={`relative flex items-center justify-between border rounded-xl px-2.5 py-1 text-xs gap-1 ${
              isDark ? 'bg-[#0b141a] border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <input
                type="text"
                value={opt}
                onChange={(e) => data.onEditOption && data.onEditOption(id, idx, e.target.value)}
                className={`w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-[#00a884] rounded-md text-xs font-medium ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              />
              
              {/* Botão para remover opção */}
              {options.length > 1 && data.onRemoveOption && (
                <button
                  type="button"
                  onClick={() => data.onRemoveOption(id, idx)}
                  className="text-slate-400 hover:text-red-400 p-0.5 rounded cursor-pointer"
                  title="Remover opção"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Handle de Saída para CADA Opção (Direita) - 16px Visível */}
              <Handle
                type="source"
                position={Position.Right}
                id={`opt-${idx}`}
                className={`!w-4 !h-4 !bg-blue-500 !border-2 ${isDark ? '!border-[#121b22]' : '!border-white'} !-right-2.5 !z-50 hover:!scale-125 transition-transform cursor-crosshair`}
              />
            </div>
          ))}
        </div>

        {/* Botão de Adicionar Opção */}
        {data.onAddOption && (
          <button
            type="button"
            onClick={() => data.onAddOption(id)}
            className={`w-full py-1 border border-dashed rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              isDark 
                ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' 
                : 'border-blue-300 text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Adicionar Opção</span>
          </button>
        )}
      </div>
    </div>
  );
});

// 3. Nó do Agente de IA (Sofia AI)
export const AiNode = memo(({ id, data, isSelected }) => {
  const isDark = data.isDarkMode !== false;

  return (
    <div className={`w-80 border relative rounded-2xl ${
      isSelected ? 'border-purple-500 ring-2 ring-purple-500/40' : isDark ? 'border-purple-900/40 bg-[#161224]' : 'border-purple-300 bg-purple-50/40'
    } ${isDark ? 'text-slate-100 shadow-2xl' : 'text-slate-900 shadow-xl'} font-sans transition-all`}>
      {/* Handle de Entrada (Esquerda) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className={`!w-4 !h-4 !bg-purple-500 !border-2 ${isDark ? '!border-[#161224]' : '!border-white'} !-left-2.5 !z-50 hover:!scale-125 transition-transform cursor-crosshair`} 
      />

      {/* Header do Card */}
      <div className={`px-3.5 py-2.5 flex items-center justify-between border-b rounded-t-2xl ${
        isDark ? 'bg-[#211a36] border-purple-900/40' : 'bg-purple-100 border-purple-200'
      }`}>
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 font-bold text-xs">
          <Bot className="w-3.5 h-3.5 text-purple-500" />
          <span>Agente IA (Sofia)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
            isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-200 text-purple-800'
          }`}>IA Autônoma</span>

          {/* Botão de Excluir Nó */}
          {data.onDeleteNode && (
            <button
              onClick={() => data.onDeleteNode(id)}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg cursor-pointer"
              title="Excluir Nó"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 space-y-2 text-left">
        <label className={`text-[11px] font-medium block ${isDark ? 'text-purple-300/80' : 'text-purple-800'}`}>Instrução Específica para este Passo:</label>
        <textarea
          rows={3}
          value={data.prompt || ''}
          onChange={(e) => data.onChangePrompt && data.onChangePrompt(id, e.target.value)}
          placeholder="Ex: Tente agendar o clareamento e ofereça datas nesta semana..."
          className={`w-full border rounded-xl p-2 text-xs leading-relaxed focus:outline-none focus:border-purple-500 resize-none ${
            isDark ? 'bg-[#0d0918] border-purple-900/50 text-purple-100 placeholder-purple-400/40' : 'bg-white border-purple-200 text-purple-950 placeholder-purple-400'
          }`}
        />
        <div className={`flex items-center justify-between text-[10px] pt-1 ${isDark ? 'text-purple-400/70' : 'text-purple-700'}`}>
          <span>Max Turnos: 5</span>
          <span>Modelo: GPT-4o / Claude</span>
        </div>
      </div>

      {/* Handle de Saída (Direita) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className={`!w-4 !h-4 !bg-purple-500 !border-2 ${isDark ? '!border-[#161224]' : '!border-white'} !-right-2.5 !z-50 hover:!scale-125 transition-transform cursor-crosshair`} 
      />
    </div>
  );
});

// 4. Nó de Parar Bot / Transferir para Atendimento Humano
export const TransferNode = memo(({ id, data, isSelected }) => {
  const isDark = data.isDarkMode !== false;

  return (
    <div className={`w-72 border relative rounded-2xl ${
      isSelected ? 'border-red-500 ring-2 ring-red-500/40' : isDark ? 'border-red-900/40 bg-[#221315]' : 'border-red-300 bg-red-50/40'
    } ${isDark ? 'text-slate-100 shadow-2xl' : 'text-slate-900 shadow-xl'} font-sans transition-all`}>
      {/* Handle de Entrada (Esquerda) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className={`!w-4 !h-4 !bg-red-500 !border-2 ${isDark ? '!border-[#221315]' : '!border-white'} !-left-2.5 !z-50 hover:!scale-125 transition-transform cursor-crosshair`} 
      />

      {/* Header do Card */}
      <div className={`px-3.5 py-2.5 flex items-center justify-between border-b rounded-t-2xl ${
        isDark ? 'bg-[#311a1d] border-red-900/40' : 'bg-red-100 border-red-200'
      }`}>
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Transferir p/ Humano</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
            isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-200 text-red-800'
          }`}>Silenciar Bot</span>

          {/* Botão de Excluir Nó */}
          {data.onDeleteNode && (
            <button
              onClick={() => data.onDeleteNode(id)}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg cursor-pointer"
              title="Excluir Nó"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 space-y-2 text-left">
        <p className={`text-xs leading-relaxed ${isDark ? 'text-red-200/90' : 'text-red-800'}`}>
          Silencia a IA para este paciente e notifica a recepção no painel do DentalFlow e WhatsApp.
        </p>
        <input
          type="text"
          value={data.reason || 'Solicitação de atendimento humano'}
          onChange={(e) => data.onChangeReason && data.onChangeReason(id, e.target.value)}
          placeholder="Motivo da transferência..."
          className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500 ${
            isDark ? 'bg-[#140a0b] border-red-900/60 text-red-100 placeholder-red-400/40' : 'bg-white border-red-200 text-red-950 placeholder-red-400'
          }`}
        />
      </div>
    </div>
  );
});

// 5. Nó de Delay / Aguardar Tempo
export const DelayNode = memo(({ id, data, isSelected }) => {
  const isDark = data.isDarkMode !== false;

  return (
    <div className={`w-64 border relative rounded-2xl ${
      isSelected ? 'border-amber-500 ring-2 ring-amber-500/40' : isDark ? 'border-amber-900/40 bg-[#1e1a12]' : 'border-amber-300 bg-amber-50/40'
    } ${isDark ? 'text-slate-100 shadow-2xl' : 'text-slate-900 shadow-xl'} font-sans transition-all`}>
      {/* Handle de Entrada (Esquerda) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className={`!w-4 !h-4 !bg-amber-500 !border-2 ${isDark ? '!border-[#1e1a12]' : '!border-white'} !-left-2.5 !z-50 hover:!scale-125 transition-transform cursor-crosshair`} 
      />

      {/* Header do Card */}
      <div className={`px-3.5 py-2 flex items-center justify-between border-b rounded-t-2xl ${
        isDark ? 'bg-[#2b2518] border-amber-900/40' : 'bg-amber-100 border-amber-200'
      }`}>
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>Aguardar Resposta</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
            isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-200 text-amber-800'
          }`}>Delay</span>

          {/* Botão de Excluir Nó */}
          {data.onDeleteNode && (
            <button
              onClick={() => data.onDeleteNode(id)}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg cursor-pointer"
              title="Excluir Nó"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 flex items-center gap-2 text-left">
        <span className={`text-xs ${isDark ? 'text-amber-200/80' : 'text-amber-800'}`}>Tempo limite:</span>
        <input
          type="number"
          value={data.minutes || 5}
          onChange={(e) => data.onChangeMinutes && data.onChangeMinutes(id, parseInt(e.target.value) || 1)}
          className={`w-16 border rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500 ${
            isDark ? 'bg-[#120f0a] border-amber-900/60 text-amber-100' : 'bg-white border-amber-300 text-amber-900'
          }`}
        />
        <span className={`text-xs ${isDark ? 'text-amber-200/80' : 'text-amber-800'}`}>minutos</span>
      </div>

      {/* Handle de Saída (Direita) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className={`!w-4 !h-4 !bg-amber-500 !border-2 ${isDark ? '!border-[#1e1a12]' : '!border-white'} !-right-2.5 !z-50 hover:!scale-125 transition-transform cursor-crosshair`} 
      />
    </div>
  );
});

export const nodeTypes = {
  messageNode: MessageNode,
  menuNode: MenuNode,
  aiNode: AiNode,
  transferNode: TransferNode,
  delayNode: DelayNode
};
