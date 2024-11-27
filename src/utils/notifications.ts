import { Movie } from '../types/movie';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await subscribeToPushNotifications();
    }
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
    });
    console.log('Push notification subscription:', subscription);
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
  }
}

export async function showNotification(title: string, options: NotificationOptions = {}) {
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/pwa-512x512.png',
      badge: '/pwa-64x64.png',
      ...options,
    });
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
}

export async function notifyUpdate(version: string, changes: string) {
  return showNotification('VHS Vault Update Available', {
    body: `Version ${version} is available!\n${changes}`,
    tag: 'app-update',
    requireInteraction: true,
    actions: [
      {
        action: 'update',
        title: 'Update Now'
      },
      {
        action: 'later',
        title: 'Later'
      }
    ]
  });
}

export async function notifyMovieAdded(movie: Movie) {
  return showNotification(`Added to Collection: ${movie.title}`, {
    body: `${movie.year} - Added to your VHS collection`,
    tag: 'movie-added',
    data: { movieId: movie.id },
    actions: [
      {
        action: 'view',
        title: 'View Details'
      }
    ]
  });
}

export async function notifyOfflineReady() {
  return showNotification('VHS Vault Ready for Offline Use', {
    body: 'Your collection is now available offline',
    tag: 'offline-ready',
    renotify: false
  });
}

export async function notifyUpdateAvailable() {
  return showNotification('Update Available', {
    body: 'A new version of VHS Vault is available',
    tag: 'update-available',
    requireInteraction: true,
    actions: [
      {
        action: 'update',
        title: 'Update Now'
      },
      {
        action: 'later',
        title: 'Later'
      }
    ]
  });
}