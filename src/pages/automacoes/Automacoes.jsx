import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Zap, Plus, Trash2, SwitchCamera, ArrowDown, HelpCircle, 
  MessageSquare, Mail, CheckSquare, RefreshCw, Bell, Bot, Play, Check, AlertCircle 
} from 'lucide-react';

export default function Automacoes() {
  const { 
    automations, addAutomation, updateAutomationStatus, 
    addCrmLead, crmLeads, updateCrmLead, sendWhatsAppMessage, patients 
  } = useClinic();
  
  const { currentTheme } = useTheme();
  const { user } = useAuth();

  // Estados locais
  const [showBuilder, setShowBuilder] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  
  // Builder selections
  const [selectedTrigger, setSelectedTrigger] = useState('Novo Lead');
  const [selectedActions, setSelectedActions] = useState([]);

  // Estados de Simulação no Sandbox
  const [simLog, setSimLog] = useState([]);
  const [runningSim, setRunningSim] = useState(null);

  // Mock list of Triggers
  const triggersList = [
    { name: 'Novo Lead', desc: 'Disparado quando um lead inicia a jornada', icon: Zap },
    { name: 'Novo Paciente', desc: 'Disparado ao cadastrar um prontuário', icon: Zap },
    { name: 'Agendamento', desc: 'Criado ao marcar consulta', icon: Zap },
    { name: 'Falta', desc: 'Disparado se o paciente não comparecer', icon: Zap },
    { name: 'Orçamento', desc: 'Lançado ao aprovar/gerar orçamento', icon: Zap },
    { name: 'Pagamento', desc: 'Disparado na liquidação de transação', icon: Zap },
    { name: 'Aniversário', desc: 'Disparado na data de aniversário', icon: Zap },
    { name: 'Inatividade', desc: 'Após 6 meses sem visitas', icon: Zap }
  ];

  // Mock list of Actions
  const actionsList = [
    { name: 'Enviar WhatsApp', desc: 'Dispara template de WhatsApp', icon: MessageSquare },
    { name: 'Enviar Email', desc: 'Dispara e-mail transacional', icon: Mail },
    { name: 'Criar tarefa', desc: 'Adiciona checklist no CRM', icon: CheckSquare },
    { name: 'Alterar etapa do CRM', desc: 'Move card no Kanban', icon: RefreshCw },
    { name: 'Criar lembrete', desc: 'Adiciona alerta interno', icon: Bell },
    { name: 'Notificar equipe', desc: 'Envia notificação aos painéis', icon: Bell },
    { name: 'Chamar IA', desc: 'Passa controle para Sofia IA', icon: Bot }
  ];

  const handleToggleActionSelection = (actionName) => {
    setSelectedActions(prev => 
      prev.includes(actionName) 
        ? prev.filter(a => a !== actionName)
        : [...prev, actionName]
    );
  };

  const handleSaveWorkflow = (e) => {
    e.preventDefault();
    if (!workflowName || !selectedTrigger || selectedActions.length === 0) return;

    addAutomation({
      name: workflowName,
      trigger: selectedTrigger,
      actions: selectedActions
    });

    setWorkflowName('');
    setSelectedActions([]);
    setShowBuilder(false);
  };

  // EXECUÇÃO DO SANDBOX DE SIMULAÇÃO (FLUXO COMPLETO)
  const runSimulation = (type) => {
    setRunningSim(type);
    setSimLog([]);
    
    if (type === 'NEW_LEAD') {
      // Passo 1: Detectar Novo Lead
      logStep('Iniciando Automação: "Boas-vindas para Novo Lead Instagram Ads"');
      
      setTimeout(() => {
        // Passo 2: Criar Lead no CRM
        const newLead = {
          name: 'Julio Cesar',
          phone: '5511911112222',
          procedure_name: 'Implante Dentário',
          budget_amount: 3200,
          priority: 'high',
          tags: ['Instagram Ads', 'Implante']
        };
        addCrmLead(newLead);
        logStep('✅ Ação Executada: Lead "Julio Cesar" adicionado à coluna [Novo Lead] no CRM.');
      }, 1500);

      setTimeout(() => {
        // Passo 3: Enviar Mensagem WhatsApp
        const patId = patients[0]?.id || 'patient-1';
        sendWhatsAppMessage(
          patId, 
          'Olá, Julio! Recebemos seu interesse em implantes dentários pelo nosso anúncio no Instagram. Gostaria de agendar uma consulta avaliativa com o Dr. Pedro Ramos? 🦷', 
          'BOT', 
          'text'
        );
        logStep('✅ Ação Executada: WhatsApp de boas-vindas enviado pela IA Sofia.');
      }, 3000);

      setTimeout(() => {
        // Passo 4: Finalizar
        logStep('🎉 Automação concluída com sucesso! Os painéis do CRM e do WhatsApp foram atualizados.');
        setRunningSim(null);
      }, 4500);
      
    } else if (type === 'MISSED_APPOINTMENT') {
      // Passo 1: Detectar Falta
      logStep('Iniciando Automação: "Reativação de Faltas e Reagendamento Automático"');

      setTimeout(() => {
        // Passo 2: Mover lead no CRM para "Retorno" ou "Perdido"
        const targetLead = crmLeads.find(l => l.stage === 3) || crmLeads[0];
        if (targetLead) {
          const updated = {
            ...targetLead,
            stage: 9, // Coluna de Retorno
            history: [
              ...targetLead.history,
              { date: new Date().toISOString(), type: 'STATUS', description: 'Movido automaticamente por falta de comparecimento', user: 'Sofia IA (Automação)' }
            ]
          };
          updateCrmLead(updated);
          logStep(`✅ Ação Executada: Lead "${targetLead.name}" movido para a etapa [Retorno] no Kanban CRM.`);
        } else {
          logStep('⚠️ Ação Cancelada: Nenhum lead correspondente na etapa de confirmação.');
        }
      }, 1500);

      setTimeout(() => {
        // Passo 3: Disparar Mensagem de Follow-up
        const targetLead = crmLeads.find(l => l.stage === 9) || crmLeads[0];
        const patId = targetLead?.id || 'patient-1';
        sendWhatsAppMessage(
          patId,
          'Olá! Notamos que você não pôde comparecer à sua consulta de avaliação hoje. Aconteceu algo? Se quiser, posso te ajudar a reagendar para quinta-feira no mesmo horário! 🦷📅',
          'BOT',
          'text'
        );
        logStep('✅ Ação Executada: Mensagem WhatsApp de reagendamento enviada automaticamente.');
      }, 3000);

      setTimeout(() => {
        logStep('🎉 Automação concluída! O Kanban comercial e o histórico de mensagens foram atualizados.');
        setRunningSim(null);
      }, 4500);
    }
  };

  const logStep = (text) => {
    setSimLog(prev => [...prev, { time: new Date().toLocaleTimeString('pt-BR'), text }]);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden">
      
      {/* Coluna Esquerda: Construtor n8n Vibe */}
      <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 rounded-2xl p-5 flex flex-col overflow-y-auto space-y-5 text-left text-slate-800 dark:text-slate-200 shadow-sm scrollbar-thin">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3 flex-shrink-0">
          <h3 className="text-sm font-bold font-title flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-500" />
            {showBuilder ? 'Novo Fluxo de Automação' : 'Criador de Automações LoopFlow'}
          </h3>
          {showBuilder && (
            <button 
              onClick={() => setShowBuilder(false)}
              className="text-xs text-slate-400 hover:text-slate-650"
            >
              Cancelar
            </button>
          )}
        </div>

        {!showBuilder ? (
          /* SHOWCASE / EMPTY STATE FOR BUILDER */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-500 shadow-sm">
              <Zap className="w-8 h-8 stroke-1" />
            </div>
            <div>
              <h4 className="font-title font-bold text-slate-800 dark:text-white text-sm">Criar Automação Comercial</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Crie fluxos integrados que disparam mensagens automáticas por WhatsApp, e-mails ou movem o CRM da clínica quando eventos ocorrem.
              </p>
            </div>
            <button
              onClick={() => setShowBuilder(true)}
              className="px-5 py-2.5 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98]"
              style={{ backgroundColor: currentTheme.secondary_color }}
            >
              Iniciar Construtor de Fluxos
            </button>
          </div>
        ) : (
          /* FORM / SEQUENTIAL WORKFLOW BUILDER */
          <form onSubmit={handleSaveWorkflow} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome do Fluxo (Workflow)</label>
              <input
                type="text"
                required
                placeholder="ex: Lembrete de Falta - WhatsApp"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            {/* STEP 1: SELECT TRIGGER */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Passo 1: Definir o Evento de Entrada (Trigger)</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {triggersList.map((trig, idx) => {
                  const isSelected = selectedTrigger === trig.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTrigger(trig.name)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${
                        isSelected 
                          ? 'bg-violet-500/10 border-violet-500/30 shadow-[0_1px_4px_rgba(var(--color-primary),0.02)]' 
                          : 'bg-white dark:bg-slate-855 border-slate-200/50 dark:border-slate-800'
                      }`}
                    >
                      <Zap className={`w-4 h-4 ${isSelected ? 'text-violet-500' : 'text-slate-400'}`} />
                      <div>
                        <span className="text-[10px] font-bold block truncate">{trig.name}</span>
                        <span className="text-[8px] text-slate-400 block truncate">{trig.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONNECTING ARROW */}
            <div className="flex justify-center select-none">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <ArrowDown className="w-4 h-4" />
              </div>
            </div>

            {/* STEP 2: SELECT ACTION */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Passo 2: Ações Encadeadas</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {actionsList.map((act, idx) => {
                  const isSelected = selectedActions.includes(act.name);
                  const Icon = act.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleActionSelection(act.name)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'bg-emerald-500/5 border-emerald-500/30' 
                          : 'bg-white dark:bg-slate-850 border-slate-200/50 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4.5 h-4.5 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-[10px] font-bold block">{act.name}</span>
                          <span className="text-[8px] text-slate-400 block">{act.desc}</span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={selectedActions.length === 0}
              className="w-full py-2.5 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: currentTheme.secondary_color }}
            >
              Criar e Ativar Automação
            </button>
          </form>
        )}
      </div>

      {/* Coluna Direita: Fluxos & Sandbox de Testes */}
      <div className="w-80 flex flex-col gap-4 flex-shrink-0 text-slate-800 dark:text-slate-200">
        
        {/* Painel 1: Sandbox de Testes */}
        <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col text-left space-y-3 shadow-sm flex-shrink-0">
          <h3 className="text-xs font-bold font-title flex items-center gap-1.5">
            <Play className="w-4 h-4 text-emerald-500" />
            Sandbox de Simulações
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed">Simule eventos reais para testar o envio automático no WhatsApp e as atualizações do CRM.</p>
          
          <div className="space-y-2">
            <button
              disabled={runningSim !== null}
              onClick={() => runSimulation('NEW_LEAD')}
              className="w-full py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-xl font-bold text-[10px] text-emerald-600 flex items-center justify-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              Simular Novo Lead (Instagram)
            </button>
            <button
              disabled={runningSim !== null}
              onClick={() => runSimulation('MISSED_APPOINTMENT')}
              className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-xl font-bold text-[10px] text-amber-600 flex items-center justify-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              Simular Falta de Paciente
            </button>
          </div>

          {/* Logs da simulação ativa */}
          {simLog.length > 0 && (
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 font-mono text-[9px] space-y-1.5 max-h-36 overflow-y-auto mt-2">
              <span className="text-slate-400 block border-b border-slate-800 pb-1 font-bold">Console de Simulação:</span>
              {simLog.map((log, idx) => (
                <div key={idx} className="leading-normal">
                  <span className="text-emerald-450 mr-1">[{log.time}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Painel 2: Fluxos Ativos */}
        <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex-shrink-0 flex items-center justify-between">
            <h3 className="text-xs font-bold font-title">Fluxos Ativos</h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
              {automations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pr-1.5 scrollbar-thin">
            {automations.map((aut) => (
              <div 
                key={aut.id} 
                className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-850 space-y-2 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
              >
                <div className="flex justify-between items-start gap-3">
                  <h4 className="font-bold text-[11px] text-slate-800 dark:text-white leading-tight">{aut.name}</h4>
                  
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={aut.isActive} 
                      onChange={(e) => updateAutomationStatus(aut.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>

                <div className="space-y-1 text-[8px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-900/20 p-1 rounded">
                    <span className="text-violet-500 uppercase">Trigger:</span>
                    <span className="truncate text-slate-600 dark:text-slate-300">{aut.trigger}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-900/20 p-1 rounded">
                    <span className="text-emerald-500 uppercase">Actions:</span>
                    <span className="truncate text-slate-600 dark:text-slate-300">{aut.actions.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
