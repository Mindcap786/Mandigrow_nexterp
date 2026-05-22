'use client';

import { useGlobalFeatureFlags } from '@/components/providers/FeatureFlagsProvider';

/**
 * useGlobalFeature
 * 
 * Hook to check if a system-wide feature flag is enabled.
 * Examples: 'finance_module', 'maintenance_mode', 'coupon_engine'
 */
export function useGlobalFeature(flagKey: string) {
  const { flags, loading } = useGlobalFeatureFlags();
  
  // If still loading, we assume it's disabled to prevent flashing restricted content.
  // In a real app, you might want to show a skeleton instead.
  const enabled = flags[flagKey] === true;

  return { enabled, loading };
}
