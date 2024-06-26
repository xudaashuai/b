import { getDB } from './DBConfig';
import type { IBook } from './types';

export const addBook = async (book: IBook): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction('books', 'readwrite');
  const store = transaction.objectStore('books');
  return new Promise((resolve, reject) => {
    const request = store.add(book);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
export const updateBook = async (book: IBook): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction('books', 'readwrite');
  const store = transaction.objectStore('books');
  return new Promise((resolve, reject) => {
    const request = store.put(book);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getBookById = async (id: string): Promise<IBook> => {
  const db = await getDB();
  const transaction = db.transaction('books', 'readonly');
  const store = transaction.objectStore('books');
  return new Promise((resolve, reject) => {
    const request: IDBRequest<IBook> = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        reject('Book not found');
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const getBooks = async (): Promise<IBook[]> => {
  const db = await getDB();
  const transaction = db.transaction('books', 'readonly');
  const store = transaction.objectStore('books');
  return new Promise((resolve, reject) => {
    const request: IDBRequest<IBook[]> = store.getAll();

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        reject('Book not found');
      }
    };
    request.onerror = () => reject(request.error);
  });
};
