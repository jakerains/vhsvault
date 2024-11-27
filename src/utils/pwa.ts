import { registerSW } from 'virtual:pwa-register';
import { notifyOfflineReady, notifyUpdate } from './notifications';
import { getLatestChangelog } from './changelog';

export function setupPWA() {
  const updateSW = registerSW({
    onNeedRefresh: async () => {
      const { version, changes } = await getLatestChangelog();
      await notifyUpdate(version, changes);
    },
    onOfflineReady: async () => {
      await notifyOfflineReady();
    },
    onRegistered(registration) {
      setInterval(() => {
        registration?.update().catch(console.error);
      }, 60 * 60 * 1000); // Check for updates every hour
    },
    onRegisterError(error) {
      console.error('Error during service worker registration:', error);
    },
    immediate: true
  });

  return updateSW;
}