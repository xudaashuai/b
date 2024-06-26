import {
  addChapter,
  getChapterByBookIdAndChapterNumber,
  getChaptersByBookId
} from '../db/ChapterStore';
import { BookSourceType, type IChapter, type ISimpleChapter } from '../db/types';
import { DataStrategyFactory } from './dataStrategy';
const globalCache: {
  [key: string]: Promise<IChapter> | undefined;
} = {};
export async function fetchChapter(
  simpleChpater: ISimpleChapter,
  sourceType: BookSourceType
): Promise<IChapter | undefined> {
  const chapterFromDB = await getChapterByBookIdAndChapterNumber(
    simpleChpater.bookId,
    simpleChpater.chapterNumber
  );
  if (!chapterFromDB) {
    return;
  }
  if (chapterFromDB.content) {
    return chapterFromDB;
  }
  if (globalCache[simpleChpater.id]) {
    return globalCache[simpleChpater.id];
  }
  const strategy = DataStrategyFactory.getStrategy(sourceType);
  const promise = strategy.fetchChapter(chapterFromDB);
  globalCache[simpleChpater.id] = promise;
  const chapterFromStrategy = await promise;
  addChapter(chapterFromStrategy);
  return chapterFromStrategy;
}

export async function fetchChapters(bookId: string): Promise<IChapter[]> {
  const chaptersFromDB = await getChaptersByBookId(bookId);
  return chaptersFromDB ?? [];
}
