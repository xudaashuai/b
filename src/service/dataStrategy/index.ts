import { BookSourceType, type IBook, type IChapter } from '../../db/types';
import { ConfigurableScraper } from './remote/';
import config from './remote/config/biquge';
import xinqi from './remote/config/xingqi';

interface DataStrategy {
  fetchChapter(bookId: string, chapterId: string): Promise<string>;
  fetchChapterList(bookId: string): Promise<IChapter[]>;
  fetchBook(bookId: string, payload: unknown): Promise<IBook>;
}
const BiquegeScraper = new ConfigurableScraper(config);
const XingqiScraper = new ConfigurableScraper(xinqi);
export function getScraper(url: string) {
  if (url.startsWith(BiquegeScraper.config.endpoints.baseUrl)) {
    return BiquegeScraper;
  }
  return XingqiScraper;
}
class DataStrategyFactory {
  static getStrategy(sourceType: BookSourceType, remoteUrl: string): DataStrategy {
    switch (sourceType) {
      case BookSourceType.remote:
        if (remoteUrl.startsWith(BiquegeScraper.config.endpoints.baseUrl)) {
          return BiquegeScraper;
        }
        return XingqiScraper;
      default:
        throw new Error('Unsupported data source type');
    }
  }
}

export { DataStrategyFactory, type DataStrategy };
