import { BookSourceType, type IBook, type IChapter } from '../../db/types';
import remoteDataFecther from './remoteDataFetcher';

interface DataStrategy {
  fetchChapter(simpleChpater: IChapter): Promise<IChapter>;
  fetchChapterContents(bookId: string): Promise<IChapter[]>;
  fetchBook(bookId: string): Promise<IBook>;
}

class DataStrategyFactory {
  static getStrategy(sourceType: BookSourceType): DataStrategy {
    switch (sourceType) {
      case BookSourceType.remote:
        return remoteDataFecther;
      default:
        throw new Error('Unsupported data source type');
    }
  }
}

export { DataStrategyFactory, type DataStrategy };
