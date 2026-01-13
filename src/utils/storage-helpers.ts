/**
 * Storage Helper Utilities
 * Pure functions for storage key generation
 */

import { STORAGE_PREFIX } from '@/constants/storage';

/**
 * Generate namespaced storage key
 */
export function createStorageKey(suffix: string): string {
  return `${STORAGE_PREFIX}${suffix}`;
}
