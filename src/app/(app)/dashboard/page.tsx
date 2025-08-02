'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LandlordDashboard } from '@/components/dashboards/landlord-dashboard';
import { TenantDashboard } from '@/components/dashboards/tenant-dashboard';
import type { UserRole } from '@/types';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<UserRole>('Arrendador');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Vista actual: {currentView}
          </p>
        </div>
        <Button onClick={() => setCurrentView(currentView === 'Arrendador' ? 'Arrendatario' : 'Arrendador')}>
          Cambiar a Vista {currentView === 'Arrendador' ? 'Arrendatario' : 'Arrendador'}
        </Button>
      </div>

      {currentView === 'Arrendador' ? (
        <LandlordDashboard />
      ) : (
        <TenantDashboard />
      )}
    </div>
  );
}
