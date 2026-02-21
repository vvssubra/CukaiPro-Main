import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const OrganizationContext = createContext(null);

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}

export function OrganizationProvider({ children }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [membershipRole, setMembershipRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrganizations = useCallback(async (userIdOverride = null) => {
    const userId = userIdOverride ?? user?.id;
    if (!userId) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setMembershipRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutMs = 10000; // 10s max wait

    try {
      const orgsPromise = supabase
        .from('organization_members')
        .select(`
          role,
          status,
          organization:organizations(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Organizations load timeout')), timeoutMs)
      );

      const result = await Promise.race([orgsPromise, timeoutPromise]);
      const { data, error } = result || {};

      if (error) throw error;

      const orgs = (data || [])
        .filter((item) => item.organization)
        .map((item) => ({
          ...item.organization,
          userRole: item.role,
        }));

      setOrganizations(orgs);

      const savedOrgId = localStorage.getItem('cukaipro_current_organization_id');
      const orgToSelect = orgs.find((o) => o.id === savedOrgId) || orgs[0];

      if (orgToSelect) {
        setCurrentOrganization(orgToSelect);
        setMembershipRole(orgToSelect.userRole);
        localStorage.setItem('cukaipro_current_organization_id', orgToSelect.id);
      } else {
        setCurrentOrganization(null);
        setMembershipRole(null);
      }
    } catch (err) {
      console.error('Error loading organizations', err);
      setOrganizations([]);
      setCurrentOrganization(null);
      setMembershipRole(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const selectOrganization = useCallback((orgId) => {
    const org = organizations.find((o) => o.id === orgId);
    if (!org) return;

    setCurrentOrganization(org);
    setMembershipRole(org.userRole);
    localStorage.setItem('cukaipro_current_organization_id', orgId);
  }, [organizations]);

  const createOrganization = useCallback(
    async (businessName, businessDetails = {}) => {
      if (!user) throw new Error('Must be logged in to create organization');

      const { data, error } = await supabase
        .from('organizations')
        .insert({
          business_name: businessName,
          ...businessDetails,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('organization_members').insert({
        organization_id: data.id,
        user_id: user.id,
        role: 'owner',
        status: 'active',
        invitation_accepted_at: new Date().toISOString(),
      });

      await loadOrganizations();
      setCurrentOrganization({ ...data, userRole: 'owner' });
      setMembershipRole('owner');
      localStorage.setItem('cukaipro_current_organization_id', data.id);

      return data;
    },
    [user, loadOrganizations]
  );

  const value = {
    organizations,
    currentOrganization,
    membershipRole,
    loading,
    selectOrganization,
    createOrganization,
    reloadOrganizations: loadOrganizations,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

OrganizationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
