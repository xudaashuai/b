import {
  addChapter,
  getChapterByBookIdAndChapterNumber,
  getChaptersByBookId
} from '../db/ChapterStore';
import { BookSourceType, type IChapter } from '../db/types';
import { DataStrategyFactory } from './dataStrategy';
const globalCache: {
  [key: string]: Promise<string> | undefined;
} = {};
export async function fetchChapter(
  simpleChpater: IChapter,
  sourceType: BookSourceType,
  remoteUrl: string
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
  const strategy = DataStrategyFactory.getStrategy(sourceType, remoteUrl);
  const promise =
    globalCache[simpleChpater.id] || strategy.fetchChapter(chapterFromDB.bookId, chapterFromDB.id);

  globalCache[simpleChpater.id] = promise;
  const contentFromStrategy = {
    ...chapterFromDB,
    content: await promise
  };
  addChapter(contentFromStrategy);
  return contentFromStrategy;
}

export async function fetchChapters(bookId: string): Promise<IChapter[]> {
  const chaptersFromDB = await getChaptersByBookId(bookId);
  return chaptersFromDB ?? [];
}
