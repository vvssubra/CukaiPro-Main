import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';

/**
 * Fetch audit log entries for an entity.
 *
 * @param {string|null} entityType - 'deduction' | 'invoice'
 * @param {string|null} entityId - UUID of the entity
 * @returns {{ entries: Array<object>, loading: boolean, error: string|null, fetchEntries: () => Promise<void> }}
 */
export function useAuditLog(entityType, entityId) {
  const { currentOrganization } = useOrganization();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    if (!entityType || !entityId || !currentOrganization) {
      setEntries([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_log')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        logger.error('Failed to fetch audit log', fetchError);
        setError(fetchError.message);
        setEntries([]);
        return;
      }
      setEntries(data ?? []);
    } catch (err) {
      logger.error('Unexpected error fetching audit log', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch audit history');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, currentOrganization]);

  useEffect(() => {
    if (entityType && entityId) {
      fetchEntries();
    } else {
      setEntries([]);
    }
  }, [entityType, entityId, fetchEntries]);

  return {
    entries,
    loading,
    error,
    fetchEntries,
  };
}
