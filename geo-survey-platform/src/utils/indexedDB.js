import { openDB } from 'idb';

const DB_NAME = 'FmsDB';
const STORE_NAME = 'fmsData';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'featureID' });
      }
    },
  });
};

export const saveData = async (featureID, formData) => {
  const db = await initDB();
  await db.put(STORE_NAME, { featureID, formData, updatedAt: new Date() });
};

export const getData = async (featureID) => {
  const db = await initDB();
  return db.get(STORE_NAME, featureID);
};

export const deleteData = async (featureID) => {
  const db = await initDB();
  await db.delete(STORE_NAME, featureID);
};

export const getAllData = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};
