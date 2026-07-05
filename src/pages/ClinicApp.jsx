import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HelpCircle, X, Sparkles, BookOpen } from 'lucide-react';

// Imports dos Módulos Modulares
import Dashboard from './dashboard/Dashboard';
import CRM from './crm/CRM';
import Pacientes from './pacientes/Pacientes';
import Agenda from './agenda/Agenda';
import WhatsApp from './whatsapp/WhatsApp';
import AIModule from './ai/AIModule';
import Automacoes from './automacoes/Automacoes';
import Marketing from './marketing/Marketing';
import Financeiro from './financeiro/Financeiro';
import Relatorios from './relatorios/Relatorios';
import Configuracoes from './configuracoes/Configuracoes';

export default function ClinicApp() {

  // Abas do Panel: 'dashboard' | 'crm' | 'pacientes' | 'agenda' | 'whatsapp' | 'ai' | 'automacoes' | 'marketing' | 'financeiro' | 'relatorios' | 'configuracoes'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  // Estados compartilhados de seleção do layout duplo
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Central de Ajuda
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [helpSlide, setHelpSlide] = useState(0);

  const helpSlides = [
    {
      title: "✨ Assistente Clínica Sofia (Evoluções com IA)",
      desc: "Escreva notas simples no Prontuário do Paciente (Aba Pacientes > João Silva > Lançar Evolução) e clique em '✨ Sofia: Melhorar com IA' para ver a mágica da inteligência artificial transformando termos simples em termos científicos adequados. Além disso, assine digitalmente suas evoluções e receitas com hash SHA-256 e crie adendos de retificação caso erre.",
      badge: "Módulo Clínico"
    },
    {
      title: "📄 Receitas, Atestados e Disparos",
      desc: "Emita receitas e atestados de comparecimento ou afastamento em segundos usando nossos modelos pré-configurados (Aba Pacientes > Receitas & Atestados). Envie o documento diretamente para o celular do paciente clicando em 'Enviar via WhatsApp' (Evolution API simulado).",
      badge: "Prescrição Digital"
    },
    {
      title: "📅 Regras de Negócio na Agenda (Inadimplência)",
      desc: "A agenda protege o caixa da clínica: tente marcar uma consulta regular para João Silva (inadimplente) e veja o bloqueio. Agora, tente agendar um procedimento de urgência (como tratamento de canal) e veja o sistema permitir mediante confirmação do gestor.",
      badge: "Agenda Inteligente"
    },
    {
      title: "💰 Alçadas de Aprovação de Despesas",
      desc: "Em Financeiro > Contas a Pagar, cadastre uma despesa menor que R$ 2.000,00 e veja-a entrar como pendente de pagamento direta. Cadastre uma despesa acima de R$ 2.000,00 e o sistema reterá o pagamento exigindo a aprovação manual do gestor (Dra. Cláudia - CLINIC_ADMIN).",
      badge: "Segurança Financeira"
    },
    {
      title: "🚀 Funil CRM & Conversão de Leads",
      desc: "Em CRM Leads, arraste e solte cartões de pacientes em potencial ao longo das etapas. Ao clicar no cartão de um lead, você pode acompanhar seu checklist e histórico. Clique no botão '🚀 Tornar Paciente' dentro da gaveta para convertê-lo e integrá-lo diretamente no Prontuário Clínico.",
      badge: "Funil de Vendas"
    }
  ];

  // Renderizador condicional do módulo ativo
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'crm':
        return <CRM selectedLead={selectedLead} setSelectedLead={setSelectedLead} />;
      case 'pacientes':
        return <Pacientes selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />;
      case 'agenda':
        return <Agenda selectedAppointment={selectedAppointment} setSelectedAppointment={setSelectedAppointment} />;
      case 'whatsapp':
        return <WhatsApp />;
      case 'ai':
        return <AIModule />;
      case 'automacoes':
        return <Automacoes />;
      case 'marketing':
        return <Marketing />;
      case 'financeiro':
        return <Financeiro />;
      case 'relatorios':
        return <Relatorios />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  // Calcular padding esquerdo com base no estado e aba
  const hasSubSidebar = ['crm', 'pacientes', 'agenda'].includes(activeTab);
  const showSubSidebar = hasSubSidebar && !collapsed;

  return (
    <div className="h-screen w-screen p-4 flex gap-4 bg-slate-100 dark:bg-slate-950 overflow-hidden font-body transition-colors duration-300">
      {/* Barra Lateral Navegação */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        selectedLead={selectedLead}
        setSelectedLead={setSelectedLead}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        selectedAppointment={selectedAppointment}
        setSelectedAppointment={setSelectedAppointment}
      />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden">
        {/* Cabeçalho */}
        <Header activeTab={activeTab} />

        {/* Módulo Ativo */}
        <main className="flex-1 p-6 overflow-hidden flex flex-col h-full">
          {renderContent()}
        </main>
      </div>

      {/* Botão Flutuante: Central de Guias */}
      <button
        onClick={() => {
          setHelpSlide(0);
          setShowHelpCenter(true);
        }}
        className="fixed bottom-6 right-6 p-4 bg-secondary hover:bg-secondary/90 text-white rounded-full shadow-2xl flex items-center gap-2 z-40 transition-all hover:scale-105 active:scale-95 animate-pulse font-extrabold text-xs"
      >
        <HelpCircle className="w-5 h-5" />
        <span>Central de Guias & Testes</span>
      </button>

      {/* Modal: Central de Guias */}
      {showHelpCenter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[28px] max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-left flex flex-col space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" />
                <h3 className="text-sm font-extrabold text-slate-850 dark:text-white font-title">Como Testar Todo o CRM (Roteiro)</h3>
              </div>
              <button 
                onClick={() => setShowHelpCenter(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Content */}
            <div className="flex-1 space-y-4 py-2">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-secondary/10 text-secondary rounded-full font-bold text-[9px] uppercase tracking-wider">
                  {helpSlides[helpSlide].badge}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  Guia {helpSlide + 1} de {helpSlides.length}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {helpSlides[helpSlide].title}
                </h4>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-350 leading-relaxed min-h-[100px]">
                  {helpSlides[helpSlide].desc}
                </p>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-4 flex-shrink-0">
              <button
                disabled={helpSlide === 0}
                onClick={() => setHelpSlide(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-slate-750 dark:text-slate-300 rounded-xl text-xs font-bold transition-all hover:bg-slate-200"
              >
                Anterior
              </button>

              <div className="flex gap-1.5">
                {helpSlides.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === helpSlide ? 'bg-secondary w-3' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {helpSlide === helpSlides.length - 1 ? (
                <button
                  onClick={() => setShowHelpCenter(false)}
                  className="px-4 py-1.5 bg-secondary text-white rounded-xl text-xs font-bold transition-all hover:opacity-95"
                >
                  Entendi, Testar!
                </button>
              ) : (
                <button
                  onClick={() => setHelpSlide(prev => Math.min(helpSlides.length - 1, prev + 1))}
                  className="px-4 py-1.5 bg-secondary text-white rounded-xl text-xs font-bold transition-all hover:opacity-95"
                >
                  Próximo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
