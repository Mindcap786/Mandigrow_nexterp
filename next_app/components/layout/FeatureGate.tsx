'use client';

import React from 'react';
import { useGlobalFeature } from '@/hooks/use-global-feature';

interface FeatureGateProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * FeatureGate
 * 
 * A wrapper component that only renders its children if the specified
 * global feature flag is enabled.
 */
export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  const { enabled, loading } = useGlobalFeature(flag);

  if (loading) {
    // Optionally return null or a skeleton while loading flags
    return null; 
  }

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
