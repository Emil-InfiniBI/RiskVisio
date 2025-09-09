import { useState, useEffect, useRef } from 'react';

// Custom hook for factory-specific storage
export function useFactoryKV<T>(key: string, defaultValue: T, factory: string): [T, (value: T | ((prev: T) => T)) => void] {
  const factoryKey = `${key}-${factory}`;
  const defaultValueRef = useRef(defaultValue);
  
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(factoryKey);
      return stored ? JSON.parse(stored) : defaultValueRef.current;
    } catch {
      return defaultValueRef.current;
    }
  });

  const setFactoryValue = (newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const finalValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      try {
        localStorage.setItem(factoryKey, JSON.stringify(finalValue));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
      return finalValue;
    });
  };

  // Update value when factory changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(factoryKey);
      setValue(stored ? JSON.parse(stored) : defaultValueRef.current);
    } catch {
      setValue(defaultValueRef.current);
    }
  }, [factoryKey]); // Only depend on factoryKey

  return [value, setFactoryValue];
}

// Helper function to get current factory from user management
export const getCurrentFactory = (): string => {
  try {
  const stored = localStorage.getItem('riskvisio-current-factory');
    return stored || 'BTG';
  } catch {
    return 'BTG';
  }
};
