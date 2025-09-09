import { useState, useEffect, useCallback, useMemo } from 'react';
import { getTenantId, withTenantPrefix } from '@/lib/tenant';

// Custom hook to replace GitHub Spark's useKV
export function useLocalStorage<T>(key: string, defaultValue: T, options?: { namespace?: string; perTenant?: boolean }) {
  const tenantKey = useMemo(() => {
    const tenant = options?.perTenant ? getTenantId() : null;
    return withTenantPrefix(key, options?.namespace, tenant);
  }, [key, options?.namespace, options?.perTenant]);
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(tenantKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${tenantKey}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((val: T) => T)) => {
    try {
      setValue(currentValue => {
        const valueToStore = newValue instanceof Function ? newValue(currentValue) : newValue;
        window.localStorage.setItem(tenantKey, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${tenantKey}":`, error);
    }
  }, [tenantKey]);

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
    if (e.key === tenantKey && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
      console.warn(`Error parsing localStorage key "${tenantKey}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tenantKey]);

  return [value, setStoredValue] as const;
}
