import { processSyncQueue } from './db';

let syncInterval: number | null = null;
let onlineListener: (() => void) | null = null;
const SYNC_TAG = 'sync';

export async function setupBackgroundSync() {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.log('Background Sync not supported');
    setupFallbackSync();
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if periodic sync is supported
    if ('periodicSync' in registration) {
      try {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as PermissionName
        });
        
        if (status.state === 'granted') {
          await registration.periodicSync.register(SYNC_TAG, {
            minInterval: 24 * 60 * 60 * 1000 // 24 hours
          });
          return true;
        }
      } catch (error) {
        console.warn('Periodic sync registration failed:', error);
      }
    }
    
    // Fallback to regular sync
    try {
      await registration.sync.register(SYNC_TAG);
      return true;
    } catch (error) {
      console.warn('Regular sync registration failed:', error);
      setupFallbackSync();
      return false;
    }
  } catch (error) {
    console.error('Error setting up background sync:', error);
    setupFallbackSync();
    return false;
  }
}

function setupFallbackSync() {
  // Clear any existing interval
  cleanupSync();
  
  // Setup new interval
  syncInterval = window.setInterval(() => {
    if (navigator.onLine) {
      processSyncQueue();
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
  
  // Add online listener for immediate sync when connection is restored
  onlineListener = () => {
    processSyncQueue();
  };
  window.addEventListener('online', onlineListener);
}

export function cleanupSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  
  if (onlineListener) {
    window.removeEventListener('online', onlineListener);
    onlineListener = null;
  }
}