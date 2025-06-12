import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheConfig } from '@/types';

export class CacheService {
  static async set(key: string, data: any, config?: Partial<CacheConfig>) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        version: config?.version || '1.0',
        ttl: config?.ttl || 3600000, // 1 hour default
      };

      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async get(key: string, config?: Partial<CacheConfig>) {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      const now = Date.now();
      const isExpired = now - cacheItem.timestamp > (config?.ttl || cacheItem.ttl);
      const isVersionMismatch = config?.version && config.version !== cacheItem.version;

      if (isExpired || isVersionMismatch) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async remove(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  static async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}