import { useState, useEffect, useRef, useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../styles/driver-theme.css';
import { useAuth } from '../context/AuthContext';

export function useOnboardingTour() {
  const { user, clinic, updateClinic } = useAuth();
  const driverRef = useRef(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Chaves de armazenamento
  const getStorageKey = useCallback(() => {
    if (user?.id) return `df_tour_completed_${user.id}`;
    if (clinic?.id) return `df_tour_completed_clinic_${clinic.id}`;
    return 'df_tour_completed';
  }, [user, clinic]);

  const getDismissKey = useCallback(() => {
    if (user?.id) return `df_tour_dismissed_${user.id}`;
    return 'df_tour_dismissed';
  }, [user]);

  // Verificar se o tour já foi concluído ou ignorado pelo usuário
  const isTourCompleted = useCallback(() => {
    if (clinic?.onboarding_tour_completed || clinic?.has_completed_tour) return true;
    if (user?.user_metadata?.onboarding_tour_completed) return true;
    
    const key = getStorageKey();
    if (localStorage.getItem(key) === 'true') return true;
    if (localStorage.getItem('df_tour_completed') === 'true') return true;
    
    return false;
  }, [clinic, user, getStorageKey]);

  const isInviteDismissed = useCallback(() => {
    const key = getDismissKey();
    return localStorage.getItem(key) === 'true' || isTourCompleted();
  }, [getDismissKey, isTourCompleted]);

  // Marcar o tour como concluído
  const markTourAsCompleted = useCallback(async () => {
    const key = getStorageKey();
    localStorage.setItem(key, 'true');
    localStorage.setItem('df_tour_completed', 'true');
    setShowInviteModal(false);

    try {
      if (updateClinic && clinic?.id) {
        await updateClinic({ onboarding_tour_completed: true });
      }
    } catch (err) {
      console.warn('[useOnboardingTour] Não foi possível sincronizar conclusão do tour no Supabase:', err);
    }
  }, [getStorageKey, updateClinic, clinic]);

  // Ignorar convite do tour ("Agora não")
  const dismissInvite = useCallback(() => {
    const key = getDismissKey();
    localStorage.setItem(key, 'true');
    setShowInviteModal(false);
  }, [getDismissKey]);

  // Iniciar / Rodar o Tour Guiado em 6 etapas exatas
  const startTour = useCallback((force = false) => {
    setShowInviteModal(false);

    if (!force && isTourCompleted()) {
      return;
    }

    // Configurar o driver.js com os passos do DentalFlow
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      doneBtnText: 'Concluir ✨',
      nextBtnText: 'Próximo →',
      prevBtnText: '← Anterior',
      progressText: 'Etapa {{current}} de {{total}}',
      onDestroyed: () => {
        markTourAsCompleted();
      },
      steps: [
        {
          element: '[data-tour="tour-dashboard"]',
          popover: {
            title: 'Seu painel',
            description: 'Acompanhe rapidamente o que está acontecendo na sua clínica.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '[data-tour="sidebar-kanban"]',
          popover: {
            title: 'Pacientes e oportunidades',
            description: 'Organize novos pacientes e acompanhe cada atendimento pelo funil.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: '[data-tour="sidebar-agenda"]',
          popover: {
            title: 'Sua agenda',
            description: 'Visualize consultas, profissionais e horários disponíveis.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: '[data-tour="sidebar-pacientes"]',
          popover: {
            title: 'Prontuário',
            description: 'Acesse o histórico clínico e registre os atendimentos.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: '[data-tour="sidebar-financeiro"]',
          popover: {
            title: 'Financeiro',
            description: 'Acompanhe procedimentos, pagamentos e movimentações da clínica.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: '[data-tour="header-help"]',
          popover: {
            title: 'Precisa de ajuda?',
            description: 'Você pode rever este tour quando quiser.',
            side: 'bottom',
            align: 'end'
          }
        }
      ]
    });

    driverRef.current = driverObj;
    
    // Pequeno timeout para garantir renderização do DOM
    setTimeout(() => {
      driverObj.drive();
    }, 300);
  }, [isTourCompleted, markTourAsCompleted]);

  // Verificar se deve exibir o mini modal inicial ("👋 Tudo pronto!")
  const triggerInitialInvite = useCallback(() => {
    if (!isInviteDismissed()) {
      setShowInviteModal(true);
    }
  }, [isInviteDismissed]);

  // Resetar o tour (para refazer manualmente)
  const resetTour = useCallback(() => {
    const key = getStorageKey();
    const dismissKey = getDismissKey();
    localStorage.removeItem(key);
    localStorage.removeItem(dismissKey);
    localStorage.removeItem('df_tour_completed');
    startTour(true);
  }, [getStorageKey, getDismissKey, startTour]);

  return {
    startTour,
    resetTour,
    isTourCompleted,
    showInviteModal,
    triggerInitialInvite,
    dismissInvite
  };
}
