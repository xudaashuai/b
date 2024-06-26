import { getDB } from './DBConfig';
import type { IChapter } from './types';

export function buildChapterId(bookId: string, chapterNumber: number) {
  return `${bookId}-${chapterNumber}`;
}

export async function getChapterByBookIdAndChapterNumber(
  bookId: string,
  chapterNumber: number
): Promise<IChapter | undefined> {
  const dbPromise = getDB(); // 获取或打开数据库
  const db = await dbPromise;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['chapters'], 'readonly');
    const store = transaction.objectStore('chapters');
    const request = store.get([bookId, chapterNumber]);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result as IChapter);
      } else {
        resolve(undefined); // 未找到章节时返回undefined
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
// 添加章节
export const addChapter = async (chapter: IChapter): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction('chapters', 'readwrite');
  const store = transaction.objectStore('chapters');
  return new Promise((resolve, reject) => {
    const request = store.put(chapter);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 根据书籍ID获取所有章节
export const getChaptersByBookId = async (bookId: string): Promise<IChapter[]> => {
  const db = await getDB();
  const transaction = db.transaction('chapters', 'readonly');
  const store = transaction.objectStore('chapters');
  const index = store.index('bookId');
  return new Promise((resolve, reject) => {
    const request = index.getAll(bookId);
    request.onsuccess = () => {
      const result = request.result as IChapter[];
      result.sort((a, b) => a.chapterNumber - b.chapterNumber);
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
};
