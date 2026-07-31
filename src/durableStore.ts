import { normaliseData } from './store';
import type { Data } from './types';

const DATABASE_NAME = 'media-factory';
const DATABASE_VERSION = 1;
const STORE_NAME = 'state';
const STATE_KEY = 'current';
const ACCOUNT_KEY_PREFIX = 'account:';

const accountStateKey = (accountId: string) => `${ACCOUNT_KEY_PREFIX}${accountId}`;

const requestResult = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Browser storage request failed.'));
  });

const transactionComplete = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error || new Error('Browser storage transaction failed.'));
    transaction.onabort = () =>
      reject(transaction.error || new Error('Browser storage transaction was cancelled.'));
  });

const openDatabase = (factory: IDBFactory = indexedDB): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = factory.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('Media Factory browser storage could not be opened.'));
    request.onblocked = () =>
      reject(new Error('Media Factory browser storage is blocked by another tab.'));
  });

export async function loadDurableData(
  factory: IDBFactory = indexedDB,
): Promise<Data | undefined> {
  return loadDataAtKey(STATE_KEY, factory);
}

export async function loadAccountData(
  accountId: string,
  factory: IDBFactory = indexedDB,
): Promise<Data | undefined> {
  return loadDataAtKey(accountStateKey(accountId), factory);
}

async function loadDataAtKey(
  key: string,
  factory: IDBFactory,
): Promise<Data | undefined> {
  const database = await openDatabase(factory);

  try {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const value = await requestResult(transaction.objectStore(STORE_NAME).get(key));
    await transactionComplete(transaction);
    return value === undefined ? undefined : normaliseData(value);
  } finally {
    database.close();
  }
}

export async function saveDurableData(
  data: Data,
  factory: IDBFactory = indexedDB,
): Promise<void> {
  return saveDataAtKey(STATE_KEY, data, factory);
}

export async function saveAccountData(
  accountId: string,
  data: Data,
  factory: IDBFactory = indexedDB,
): Promise<void> {
  return saveDataAtKey(accountStateKey(accountId), data, factory);
}

async function saveDataAtKey(
  key: string,
  data: Data,
  factory: IDBFactory,
): Promise<void> {
  const database = await openDatabase(factory);

  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(data, key);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export async function deleteLegacyData(
  factory: IDBFactory = indexedDB,
): Promise<void> {
  const database = await openDatabase(factory);

  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(STATE_KEY);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}
