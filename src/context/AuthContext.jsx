import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId, setLoadingWhenDone = true) => {
    const timeoutMs = 10000;
    try {
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile load timeout')), timeoutMs)
      );

      const result = await Promise.race([profilePromise, timeoutPromise]);
      const { data, error } = result || {};

      if (error) {
        logger.error('Error loading profile', error);
        setProfile(null);
      } else {
        setProfile(data ?? null);
      }
    } catch (err) {
      logger.error('Error loading profile', err);
      setProfile(null);
    } finally {
      if (setLoadingWhenDone) setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(false); // unblock UI as soon as we have a user
        loadUserProfile(session.user.id, false); // load profile in background
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setLoading(false); // unblock immediately so login doesn't hang
          loadUserProfile(session.user.id, false);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('user_profiles').insert({
          id: data.user.id,
          full_name: fullName,
          email,
        });

        if (profileError && profileError.code !== '23505') {
          logger.error('Profile insert error', profileError);
        }
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    loadUserProfile,
    isAuthenticated: !!user,
    login: signIn,
    logout: signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
