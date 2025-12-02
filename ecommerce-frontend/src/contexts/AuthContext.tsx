import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  adminLogin: (username: string, password: string) => boolean;
  signup: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from sessionStorage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signup = (username: string, password: string): boolean => {
    // Get existing users from sessionStorage
    const usersJson = sessionStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : [];

    // Check if username already exists
    const userExists = users.some((u: any) => u.username === username);
    if (userExists) {
      return false;
    }

    // Add new user
    const newUser = { username, password };
    users.push(newUser);
    sessionStorage.setItem('users', JSON.stringify(users));

    // Set current user
    const currentUser = { username };
    setUser(currentUser);
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    return true;
  };

  const login = (username: string, password: string): boolean => {
    // Get users from sessionStorage
    const usersJson = sessionStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : [];

    // Find user with matching credentials
    const foundUser = users.find(
      (u: any) => u.username === username && u.password === password
    );

    if (foundUser) {
      const currentUser = { username: foundUser.username, isAdmin: false };
      setUser(currentUser);
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      return true;
    }

    return false;
  };

  const adminLogin = (username: string, password: string): boolean => {
    // Check for hardcoded admin credentials
    if (username === 'admin' && password === 'admin') {
      const adminUser = { username: 'admin', isAdmin: true };
      setUser(adminUser);
      sessionStorage.setItem('currentUser', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const value: AuthContextType = {
    user,
    login,
    adminLogin,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
