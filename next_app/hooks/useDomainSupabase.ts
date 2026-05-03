import { useMemo } from 'react';

/**
 * Legacy hook — previously returned a Supabase client scoped to a domain schema.
 * Now returns the no-op proxy. All data calls use callApi() from frappeClient.
 */
export const useDomainSupabase = () => {
    return useMemo(() => supabase, []);
};
