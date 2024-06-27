import { BookSourceType, type IBook, type IChapter } from '../../db/types';
import { ConfigurableScraper } from './remote/';
import config from './remote/config/biquge';

interface DataStrategy {
  fetchChapter(bookId: string, chapterId: string): Promise<string>;
  fetchChapterList(bookId: string): Promise<IChapter[]>;
  fetchBook(bookId: string, payload: unknown): Promise<IBook>;
}
const BiquegeScraper = new ConfigurableScraper(config);

class DataStrategyFactory {
  static getStrategy(sourceType: BookSourceType): DataStrategy {
    switch (sourceType) {
      case BookSourceType.remote:
        return BiquegeScraper;
      default:
        throw new Error('Unsupported data source type');
    }
  }
}

export { DataStrategyFactory, type DataStrategy };
