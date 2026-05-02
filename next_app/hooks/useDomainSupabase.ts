import { useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Legacy hook — previously returned a Supabase client scoped to a domain schema.
 * Now returns the no-op proxy. All data calls use callApi() from frappeClient.
 */
export const useDomainSupabase = () => {
    return useMemo(() => supabase, []);
};
