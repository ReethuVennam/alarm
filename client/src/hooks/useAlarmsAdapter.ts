import { useAlarms } from "./useAlarms";
import { useLocalStorageAlarms } from "./useLocalStorageAlarms";

// Check environment variable to determine storage type
const useLocalStorage = import.meta.env.VITE_USE_LOCALSTORAGE === 'true';

/**
 * Configurable alarm storage adapter
 * Uses localStorage when VITE_USE_LOCALSTORAGE=true, otherwise uses database
 */
export function useAlarmsAdapter() {
  if (useLocalStorage) {
    console.log('📱 Using localStorage for alarm storage');
    return useLocalStorageAlarms();
  } else {
    console.log('🗄️ Using database for alarm storage');
    return useAlarms();
  }
}

// Export the current storage type for debugging
export const currentStorageType = useLocalStorage ? 'localStorage' : 'database';