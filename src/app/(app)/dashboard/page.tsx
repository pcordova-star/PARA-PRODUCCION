'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LandlordDashboard } from '@/components/dashboards/landlord-dashboard';
import { TenantDashboard } from '@/components/dashboards/tenant-dashboard';
import type { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { currentUser, loading } = useAuth();

  if (loading || !currentUser) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentUser.role === 'Arrendador' ? (
        <LandlordDashboard />
      ) : (
        <TenantDashboard />
      )}
    </div>
  );
}
