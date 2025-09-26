import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user from storage
    const storedUser = localStorage.getItem('nexaflow-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo users
    let demoUser: User;
    if (email.includes('admin')) {
      demoUser = {
        id: '1',
        email: email,
        name: 'Admin User',
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        createdAt: new Date(),
        lastActive: new Date(),
      };
    } else if (email.includes('client')) {
      demoUser = {
        id: '2',
        email: email,
        name: 'Client User',
        role: 'client',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        createdAt: new Date(),
        lastActive: new Date(),
      };
    } else if (email.includes('team')) {
      demoUser = {
        id: '4',
        email: email,
        name: 'Team Member',
        role: 'team_member',
        avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        createdAt: new Date(),
        lastActive: new Date(),
        assignedProjects: ['proj-1'], // Only sees assigned projects
      };
    } else {
      demoUser = {
        id: '3',
        email: email,
        name: 'Project Manager',
        role: 'pm',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        createdAt: new Date(),
        lastActive: new Date(),
        managedProjects: ['proj-1', 'proj-2'], // Projects they manage
      };
    }
    
    setUser(demoUser);
    localStorage.setItem('nexaflow-user', JSON.stringify(demoUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexaflow-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};