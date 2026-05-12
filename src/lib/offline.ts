/**
 * Tiny IndexedDB wrapper for caching route payloads + (in the future) tile
 * blobs. Iteration 5 replaces this with a Workbox-managed cache and a
 * Capacitor filesystem path for MBTiles slices. For the MVP scaffold we
 * persist the JSON payload only.
 */

import type { Route } from "./types";

const DB_NAME = "pivot";
const DB_VERSION = 1;
const STORE = "routes";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveRoute(route: Route): Promise<void> {
  const db = await open();
  await tx(db, "readwrite", (s) => s.put(route));
  db.close();
}

export async function getSavedRoute(id: string): Promise<Route | undefined> {
  const db = await open();
  const result = await tx<Route | undefined>(db, "readonly", (s) => s.get(id));
  db.close();
  return result;
}

export async function listSavedRoutes(): Promise<Route[]> {
  const db = await open();
  const result = await tx<Route[]>(db, "readonly", (s) => s.getAll() as IDBRequest<Route[]>);
  db.close();
  return result;
}

export async function deleteSavedRoute(id: string): Promise<void> {
  const db = await open();
  await tx(db, "readwrite", (s) => s.delete(id));
  db.close();
}

function tx<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T> | IDBRequest<unknown>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const s = t.objectStore(STORE);
    const req = work(s);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}
