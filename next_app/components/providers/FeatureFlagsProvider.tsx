'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { callApi } from '@/lib/frappeClient';

interface FeatureFlagsContextType {
  flags: Record<string, boolean>;
  loading: boolean;
  isMaintenanceMode: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType>({
  flags: {},
  loading: true,
  isMaintenanceMode: false,
});

export const FeatureFlagsProvider = ({ children }: { children: React.ReactNode }) => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const data = await callApi('mandigrow.api.get_active_feature_flags');
        if (data) {
          setFlags(data);
        }
      } catch (error) {
        console.error('Failed to fetch feature flags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, []);

  const isMaintenanceMode = flags['maintenance_mode'] === true;

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, isMaintenanceMode }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useGlobalFeatureFlags = () => useContext(FeatureFlagsContext);
