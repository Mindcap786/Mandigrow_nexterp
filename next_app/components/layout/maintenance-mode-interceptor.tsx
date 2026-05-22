'use client';

import React from 'react';
import { useGlobalFeatureFlags } from '@/components/providers/FeatureFlagsProvider';
import { useAuth } from '@/components/auth/auth-provider';
import { AlertTriangle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MaintenanceModeInterceptor({ children }: { children: React.ReactNode }) {
  const { isMaintenanceMode, loading } = useGlobalFeatureFlags();
  const { profile } = useAuth();

  // Superadmins can bypass maintenance mode
  const isSuperAdmin = profile?.role === 'superadmin';

  if (loading) {
    return <>{children}</>;
  }

  if (isMaintenanceMode && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-800 p-8 rounded-3xl max-w-md w-full border border-slate-700 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">System Maintenance</h1>
          <p className="text-slate-400 mb-8 leading-relaxed text-sm">
            MandiGrow is currently undergoing scheduled maintenance. We are upgrading our systems to serve you better.
            Please check back in a few minutes.
          </p>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700/50 flex items-center gap-3">
            <Settings className="w-5 h-5 text-indigo-400 animate-spin" />
            <span className="text-sm text-slate-300 font-medium">Upgrading databases...</span>
          </div>
          <div className="mt-8">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full bg-slate-800 text-white border-slate-600 hover:bg-slate-700 hover:text-white"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
