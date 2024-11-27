import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Movie } from '../types/movie';

interface VHSVaultDB extends DBSchema {
  movies: {
    key: string;
    value: Movie;
    indexes: {
      'by-title': string;
      'by-genre': string[];
      'by-collection': string;
      'by-addedDate': string;
      'by-lastViewed': number;
    };
  };
  syncQueue: {
    key: number;
    value: {
      id: number;
      operation: 'ADD' | 'UPDATE' | 'DELETE';
      data: any;
      timestamp: number;
      retryCount: number;
    };
  };
  offlineCache: {
    key: string;
    value: {
      url: string;
      data: any;
      timestamp: number;
      expiresAt: number;
    };
  };
}

let db: IDBPDatabase<VHSVaultDB>;

export async function initDB() {
  db = await openDB<VHSVaultDB>('vhs-vault', 1, {
    upgrade(db) {
      // Movies store
      const movieStore = db.createObjectStore('movies', { keyPath: 'id' });
      movieStore.createIndex('by-title', 'title');
      movieStore.createIndex('by-genre', 'genre', { multiEntry: true });
      movieStore.createIndex('by-collection', 'collection');
      movieStore.createIndex('by-addedDate', 'addedDate');
      movieStore.createIndex('by-lastViewed', 'lastViewed');

      // Sync queue store
      db.createObjectStore('syncQueue', { 
        keyPath: 'id',
        autoIncrement: true 
      });

      // Offline cache store
      db.createObjectStore('offlineCache', { keyPath: 'url' });
    },
  });
}

// Movie operations
export async function saveMovie(movie: Movie) {
  await db.put('movies', movie);
  await addToSyncQueue('ADD', movie);
}

export async function getMovie(id: string) {
  return db.get('movies', id);
}

export async function getAllMovies() {
  return db.getAll('movies');
}

export async function deleteMovie(id: string) {
  await db.delete('movies', id);
  await addToSyncQueue('DELETE', { id });
}

export async function getMoviesByGenre(genre: string) {
  return db.getAllFromIndex('movies', 'by-genre', genre);
}

export async function getMoviesByCollection(collection: string) {
  return db.getAllFromIndex('movies', 'by-collection', collection);
}

// Sync queue operations
async function addToSyncQueue(operation: 'ADD' | 'UPDATE' | 'DELETE', data: any) {
  await db.add('syncQueue', {
    operation,
    data,
    timestamp: Date.now(),
    retryCount: 0
  });
  
  // Attempt to sync if online
  if (navigator.onLine) {
    await processSyncQueue();
  }
}

export async function processSyncQueue() {
  const tx = db.transaction('syncQueue', 'readwrite');
  const queue = await tx.store.getAll();
  const store = tx.store;

  for (const item of queue) {
    try {
      // Process each sync item
      switch (item.operation) {
        case 'ADD':
        case 'UPDATE':
          // In a real app, we'd sync with a server here
          console.log(`Syncing ${item.operation}:`, item.data);
          break;
        case 'DELETE':
          console.log('Syncing DELETE:', item.data);
          break;
      }
      
      // Remove processed item from queue
      await store.delete(item.id);
    } catch (error) {
      console.error('Sync failed for item:', item, error);
      // Update retry count and continue with next items
      item.retryCount = (item.retryCount || 0) + 1;
      if (item.retryCount < 3) {
        await store.put(item);
      }
      continue;
    }
  }

  await tx.done;
}