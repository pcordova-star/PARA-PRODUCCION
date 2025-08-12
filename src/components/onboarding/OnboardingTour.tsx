
'use client';

import React from 'react';
import Joyride, { Step } from 'react-joyride';

interface OnboardingTourProps {
  userType: 'landlord' | 'tenant';
  run: boolean;
  onComplete: () => void;
}

const landlordSteps: Step[] = [
  {
    target: '.tour-step-1-landlord',
    content: '¡Bienvenido a S.A.R.A.! Primero, registra tu propiedad para comenzar a administrarla.',
    disableBeacon: true,
  },
  {
    target: '.tour-step-2-landlord',
    content: 'Ahora crea un contrato para tu arrendatario y asocia la propiedad.',
    disableBeacon: true,
  },
  {
    target: '.tour-step-3-landlord',
    content: 'Usa el chat y las herramientas para comunicarte y gestionar pagos.',
    disableBeacon: true,
  },
];

const tenantSteps: Step[] = [
  {
    target: '.tour-step-1-tenant',
    content: 'Aquí puedes revisar tu contrato y sus condiciones.',
    disableBeacon: true,
  },
  {
    target: '.tour-step-2-tenant',
    content: 'Registra tus pagos de arriendo y sube comprobantes fácilmente.',
    disableBeacon: true,
  },
  {
    target: '.tour-step-3-tenant',
    content: 'Mantente en contacto con tu arrendador desde este panel.',
    disableBeacon: true,
  },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ userType, run, onComplete }) => {
  const steps = userType === 'landlord' ? landlordSteps : tenantSteps;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={({ status }) => {
        if (status === 'finished' || status === 'skipped') {
          onComplete();
        }
      }}
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          primaryColor: '#007bff',
          textColor: '#333333',
          zIndex: 1000,
        },
        buttonClose: {
          display: 'none',
        },
      }}
      locale={{
        next: 'Siguiente',
        skip: 'Omitir',
        last: 'Finalizar',
        back: 'Anterior',
      }}
    />
  );
};

export default OnboardingTour;
