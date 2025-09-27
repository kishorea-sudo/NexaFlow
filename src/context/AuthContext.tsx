import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, User as DBUser, dbFunctions } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'pm' | 'team_member' | 'client';
  designation?: string;
  avatar?: string;
  company?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
      console.warn('Supabase configuration is missing or invalid. Running in demo mode with fallback authentication.');
      // Set loading to false immediately since we're not connecting to Supabase
      setIsLoading(false);
      return;
    }

    // Add timeout for Supabase operations to prevent long loading times
    const timeoutId = setTimeout(() => {
      console.warn('Supabase connection timeout. Running in demo mode.');
      setIsLoading(false);
    }, 3000); // 3 second timeout

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeoutId);
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    }).catch((error) => {
      clearTimeout(timeoutId);
      console.warn('Failed to get initial session, running in demo mode:', error);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await dbFunctions.getUser(supabaseUser.id);
      
      if (error && error.code === 'PGRST116') {
        // User profile doesn't exist, create a default one
        const defaultProfile: Omit<DBUser, 'id' | 'created_at' | 'updated_at'> = {
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          role: 'client', // Default role
          avatar: supabaseUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User')}&background=3B82F6&color=ffffff&size=32`
        };
        
        const { data: newProfile, error: createError } = await dbFunctions.createUser(defaultProfile);
        if (!createError && newProfile) {
          setUser({
            id: newProfile.id,
            name: newProfile.name,
            email: newProfile.email,
            role: newProfile.role,
            avatar: newProfile.avatar,
            company: newProfile.company,
            phone: newProfile.phone
          });
        }
      } else if (!error && profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          avatar: profile.avatar,
          company: profile.company,
          phone: profile.phone
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Temporary fallback - will be removed once Supabase users are created
        const demoUsers = [
          {
            email: 'client@techcorp.com',
            password: 'demo123',
            id: '44444444-4444-4444-4444-444444444444',
            name: 'John Smith',
            role: 'client' as const
          },
          {
            email: 'admin@nexaflow.com',
            password: 'demo123',
            id: '11111111-1111-1111-1111-111111111111',
            name: 'Admin Sarah',
            role: 'admin' as const
          },
          // Project Managers
          {
            email: 'pm1@nexaflow.com',
            password: 'demo123',
            id: '22222222-2222-2222-2222-222222222222',
            name: 'Michael Johnson',
            role: 'pm' as const
          },
          {
            email: 'pm2@nexaflow.com',
            password: 'demo123',
            id: '22222222-2222-2222-2222-222222222223',
            name: 'Emily Davis',
            role: 'pm' as const
          },
          // Team Members
          {
            email: 'designer@nexaflow.com',
            password: 'demo123',
            id: '33333333-3333-3333-3333-333333333333',
            name: 'Alex Chen',
            role: 'team_member' as const,
            designation: 'UI/UX Designer'
          },
          {
            email: 'developer@nexaflow.com',
            password: 'demo123',
            id: '33333333-3333-3333-3333-333333333334',
            name: 'David Rodriguez',
            role: 'team_member' as const,
            designation: 'Frontend Developer'
          },
          {
            email: 'backend@nexaflow.com',
            password: 'demo123',
            id: '33333333-3333-3333-3333-333333333335',
            name: 'Lisa Wang',
            role: 'team_member' as const,
            designation: 'Backend Developer'
          },
          {
            email: 'qa@nexaflow.com',
            password: 'demo123',
            id: '33333333-3333-3333-3333-333333333336',
            name: 'Robert Thompson',
            role: 'team_member' as const,
            designation: 'QA Engineer'
          }
        ];

        const demoUser = demoUsers.find(u => u.email === email && u.password === password);
        if (demoUser) {
          setUser({
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
            designation: (demoUser as any).designation,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(demoUser.name)}&background=3B82F6&color=ffffff&size=32`
          });
          setIsLoading(false);
          return;
        }
        
        throw new Error(error.message);
      }

      // Session will be set by the auth state change listener
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (email: string, password: string, userData: Omit<User, 'id'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        await dbFunctions.createUser({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=3B82F6&color=ffffff&size=32`,
          company: userData.company,
          phone: userData.phone
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      // Check if we're in demo mode by looking at user ID patterns
      const isDemoUser = user?.id && [
        '44444444-4444-4444-4444-444444444444', // client
        '11111111-1111-1111-1111-111111111111', // admin
        '22222222-2222-2222-2222-222222222222', // pm
        '33333333-3333-3333-3333-333333333333'  // team_member
      ].includes(user.id);

      // Only attempt Supabase logout if we have a valid session AND we're not in demo mode
      if (session && !isDemoUser) {
        // Add timeout to prevent hanging on logout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Logout timeout')), 2000)
        );
        
        const logoutPromise = supabase.auth.signOut();
        
        try {
          await Promise.race([logoutPromise, timeoutPromise]);
        } catch (error) {
          console.warn('Supabase logout timeout or error:', error);
        }
      }
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      // Always clear local state immediately for fast logout
      setUser(null);
      setSession(null);
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};