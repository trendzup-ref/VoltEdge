import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer } from '../types/customer';
import {
  getCustomerProfile,
  loginCustomer,
  registerCustomer,
  logoutCustomer,
} from '../services/customerApi';

interface CustomerAuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem('volt_customer_token');
    if (!token) {
      setCustomer(null);
      setIsLoading(false);
      return;
    }

    // Check cached profile first for instant UI response
    const cached = localStorage.getItem('volt_customer_profile');
    if (cached) {
      try {
        setCustomer(JSON.parse(cached));
      } catch {}
    }

    try {
      const data = await getCustomerProfile();
      setCustomer(data);
    } catch {
      // If profile fetch fails, keep cached customer if available
      if (!cached) {
        localStorage.removeItem('volt_customer_token');
        setCustomer(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await loginCustomer(credentials);
      await fetchProfile();
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await registerCustomer(data);
      await fetchProfile();
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutCustomer();
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        register,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

