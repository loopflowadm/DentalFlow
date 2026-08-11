import React from 'react';
import { useAuth } from '../../context/AuthContext';
import OnboardingWizard from '../../components/onboarding/OnboardingWizard';

export default function Onboarding({ onComplete }) {
  const { clinic, updateClinic } = useAuth();

  const handleSaveClinicData = async (data) => {
    try {
      if (updateClinic && clinic?.id) {
        await updateClinic({
          name: data.name || clinic.name,
          phone: data.phone || clinic.phone,
          chairs_count: data.chairs_count,
          staff_count: data.staff_count,
          address: data.address,
          onboarding_completed: data.onboarding_completed || false
        });
      }
    } catch (err) {
      console.warn('[Onboarding] Aviso ao salvar dados no Supabase:', err);
    }
  };

  return (
    <OnboardingWizard
      initialClinic={clinic}
      onComplete={onComplete}
      onSaveClinicData={handleSaveClinicData}
    />
  );
}
