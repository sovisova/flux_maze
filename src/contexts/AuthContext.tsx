import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  onboarded: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('demo_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Demo validation - accept any valid email/password combo
    if (email && password.length >= 6) {
      const newUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        onboarded: localStorage.getItem('demo_onboarded') === 'true',
      };
      setUser(newUser);
      localStorage.setItem('demo_user', JSON.stringify(newUser));
      return { success: true };
    }
    
    return { success: false, error: 'Error' }; // Intentionally vague error
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (email && password.length >= 8 && name) {
      const newUser: User = {
        id: '1',
        email,
        name,
        onboarded: false,
      };
      setUser(newUser);
      localStorage.setItem('demo_user', JSON.stringify(newUser));
      return { success: true };
    }
    
    return { success: false, error: 'Error' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo_user');
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { ...user, onboarded: true };
      setUser(updatedUser);
      localStorage.setItem('demo_user', JSON.stringify(updatedUser));
      localStorage.setItem('demo_onboarded', 'true');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
