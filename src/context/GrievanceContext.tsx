import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Grievance, FilterOptions } from '../types';

interface GrievanceContextType {
  grievances: Grievance[];
  selectedGrievance: Grievance | null;
  filters: FilterOptions;
  loading: boolean;
  error: string | null;
  setGrievances: (grievances: Grievance[]) => void;
  setSelectedGrievance: (grievance: Grievance | null) => void;
  setFilters: (filters: FilterOptions) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addGrievance: (grievance: Grievance) => void;
  updateGrievance: (grievance: Grievance) => void;
  deleteGrievance: (id: string) => void;
}

const GrievanceContext = createContext<GrievanceContextType | undefined>(undefined);

export const GrievanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addGrievance = (grievance: Grievance) => {
    setGrievances((prev) => [grievance, ...prev]);
  };

  const updateGrievance = (grievance: Grievance) => {
    setGrievances((prev) =>
      prev.map((g) => (g.id === grievance.id ? grievance : g))
    );
    if (selectedGrievance?.id === grievance.id) {
      setSelectedGrievance(grievance);
    }
  };

  const deleteGrievance = (id: string) => {
    setGrievances((prev) => prev.filter((g) => g.id !== id));
    if (selectedGrievance?.id === id) {
      setSelectedGrievance(null);
    }
  };

  const value: GrievanceContextType = {
    grievances,
    selectedGrievance,
    filters,
    loading,
    error,
    setGrievances,
    setSelectedGrievance,
    setFilters,
    setLoading,
    setError,
    addGrievance,
    updateGrievance,
    deleteGrievance,
  };

  return (
    <GrievanceContext.Provider value={value}>{children}</GrievanceContext.Provider>
  );
};

export const useGrievance = (): GrievanceContextType => {
  const context = useContext(GrievanceContext);
  if (context === undefined) {
    throw new Error('useGrievance must be used within a GrievanceProvider');
  }
  return context;
};
