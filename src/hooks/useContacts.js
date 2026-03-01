import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';

/**
 * Fetch, create, update, delete contacts (customers / suppliers).
 * @param {{ type?: 'customer' | 'supplier' }} [filters]
 * @returns {{ contacts, loading, error, fetchContacts, createContact, updateContact, deleteContact }}
 */
export function useContacts(filters = {}) {
  const { currentOrganization } = useOrganization();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    if (!currentOrganization) return;

    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name', { ascending: true });

      if (filters.type) q = q.eq('type', filters.type);

      const { data, error: fetchError } = await q;

      if (fetchError) {
        logger.error('Failed to fetch contacts', fetchError);
        setError(fetchError.message);
        setContacts([]);
        return;
      }

      setContacts(data ?? []);
    } catch (err) {
      logger.error('Unexpected error fetching contacts', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, filters.type]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = useCallback(
    async (payload) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: insertError } = await supabase
          .from('contacts')
          .insert({
            organization_id: currentOrganization.id,
            name: payload.name,
            type: payload.type,
            email: payload.email || null,
            phone: payload.phone || null,
            tin: payload.tin || null,
          })
          .select()
          .single();

        if (insertError) {
          logger.error('Failed to create contact', insertError);
          setError(insertError.message);
          return { success: false, error: insertError.message };
        }

        setContacts((prev) => [...prev, data].sort((a, b) => (a.name < b.name ? -1 : 1)));
        return { success: true, data };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to create contact';
        logger.error('Unexpected error creating contact', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const updateContact = useCallback(
    async (id, payload) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const updateData = {};
        if (payload.name !== undefined) updateData.name = payload.name;
        if (payload.type !== undefined) updateData.type = payload.type;
        if (payload.email !== undefined) updateData.email = payload.email || null;
        if (payload.phone !== undefined) updateData.phone = payload.phone || null;
        if (payload.tin !== undefined) updateData.tin = payload.tin || null;

        const { data, error: updateError } = await supabase
          .from('contacts')
          .update(updateData)
          .eq('id', id)
          .eq('organization_id', currentOrganization.id)
          .select()
          .single();

        if (updateError) {
          logger.error('Failed to update contact', updateError);
          setError(updateError.message);
          return { success: false, error: updateError.message };
        }

        setContacts((prev) => prev.map((c) => (c.id === id ? data : c)));
        return { success: true, data };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to update contact';
        logger.error('Unexpected error updating contact', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const deleteContact = useCallback(
    async (id) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { error: deleteError } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id)
          .eq('organization_id', currentOrganization.id);

        if (deleteError) {
          logger.error('Failed to delete contact', deleteError);
          setError(deleteError.message);
          return { success: false, error: deleteError.message };
        }

        setContacts((prev) => prev.filter((c) => c.id !== id));
        return { success: true };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to delete contact';
        logger.error('Unexpected error deleting contact', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  };
}
