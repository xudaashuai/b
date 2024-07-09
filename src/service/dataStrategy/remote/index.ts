/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookSourceType, type IChapter, type IRemoteBook } from '../../../db/types';
// @ts-expect-error 123
const render = ejs.render;
import { getTextWithNewlines } from './utils';
const PROXY_BASE_URL = `https://api.xudashuai.online/?url=`;
const parser = new DOMParser();
export class ConfigurableScraper {
  config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  getBookId(url: string) {
    const params = {
      baseUrl: this.config.endpoints.baseUrl
    };
    return url.replace(RegExp(render(this.config.bookIdReg, params)), '$1');
  }

  static buildUrl(template: string, params: any) {
    return render(template, params);
  }

  static buildTemplateDefault(template: string | undefined, defaultResult: string, params: any) {
    if (template) {
      return render(template, params);
    }
    return defaultResult;
  }

  static querySelector(doc: Document | Element, selector: string | undefined, params: any) {
    if (selector) {
      const realSelector = render(selector, params);
      console.log('querySelectorAll', realSelector, doc);
      return doc.querySelector(realSelector);
    }
  }

  static querySelectorAll(doc: Document, selector: string | undefined, params: any) {
    if (selector) {
      const realSelector = render(selector, params);
      console.log('querySelectorAll', realSelector, doc);
      return [...doc.querySelectorAll(realSelector)];
    }
  }

  async fetchHtml(url: string): Promise<Document> {
    console.log('fetchHtml start', url);
    const response = await (
      await fetch(PROXY_BASE_URL + url + '&charset=' + this.config.charset)
    ).json();
    console.log('fetchHtml end', url, response);
    return parser.parseFromString(response.html, 'text/html');
  }
  async fetchBook(bookId: string): Promise<IRemoteBook> {
    console.log('fetchBook start', bookId);

    const config = this.config.endpoints.bookInfo;
    const params = {
      baseUrl: this.config.endpoints.baseUrl,
      bookId
    };
    const url = ConfigurableScraper.buildUrl(config.template, params);

    const doc = await this.fetchHtml(url);
    const bookDetails: IRemoteBook = {
      id: bookId,
      title:
        ConfigurableScraper.querySelector(doc, config.selectors.title, params)?.textContent ?? '',
      author:
        ConfigurableScraper.querySelector(doc, config.selectors.author, params)?.textContent ?? '',
      coverImageUrl:
        ConfigurableScraper.querySelector(doc, config.selectors.coverUrl, params)?.getAttribute(
          'src'
        ) ?? '',
      description:
        ConfigurableScraper.querySelector(doc, config.selectors.description, params)?.textContent ??
        '',
      remoteUrl: url,
      source: BookSourceType.remote
    };

    console.log('fetchBook end', bookId, bookDetails);
    return bookDetails;
  }

  async fetchChapterList(bookId: string): Promise<IChapter[]> {
    console.log('fetchChapterList start', bookId);
    const config = this.config.endpoints.chapterList;
    let pageNum = config.pageNumStartIndex;
    const templateParams = {
      baseUrl: this.config.endpoints.baseUrl,
      bookId,
      pageNum
    };
    let url = ConfigurableScraper.buildUrl(config.template, templateParams);
    const chapters: IChapter[] = [];
    let chapterNumber = 0;
    while (url) {
      const doc = await this.fetchHtml(url);
      const chapterElements =
        ConfigurableScraper.querySelectorAll(doc, config.linkSelector, templateParams) || [];
      for (const element of chapterElements) {
        const link = element.getAttribute('href') || '';
        chapters.push({
          id: [
            ...(link || '').matchAll(RegExp(render(config.linkIdReg, templateParams), 'g'))
          ][0][1],
          title: element.textContent || '',
          content: '',
          bookId: bookId,
          chapterNumber: ++chapterNumber
        });
      }
      pageNum++;
      templateParams.pageNum = pageNum;
      const nextPageElement = ConfigurableScraper.querySelector(
        doc,
        config.nextPageSelector,
        templateParams
      );
      const href = nextPageElement?.getAttribute('href') ?? undefined;
      if (nextPageElement) {
        url = ConfigurableScraper.buildTemplateDefault(config.template, href || '', templateParams);
      } else {
        url = '';
      }
    }

    console.log('fetchChapterList end', bookId, chapters);
    return chapters;
  }

  async fetchChapter(bookId: string, chapterId: string): Promise<string> {
    console.log('fetchChapter start', bookId, chapterId);
    const config = this.config.endpoints.chapterContent;

    let fullContent = '';
    let pageNum = config.pageNumStartIndex;

    const templateParams = {
      baseUrl: this.config.endpoints.baseUrl,
      bookId,
      chapterId,
      pageNum
    };
    let url = ConfigurableScraper.buildUrl(config.template, templateParams);
    while (url) {
      const doc = await this.fetchHtml(url);
      const node = ConfigurableScraper.querySelector(
        doc,
        config.chapterContentSelector,
        templateParams
      );
      const chapterContent = node ? getTextWithNewlines(node) : '';
      fullContent += chapterContent;

      pageNum++;
      templateParams.pageNum = pageNum;
      const nextPageElement = ConfigurableScraper.querySelector(
        doc,
        config.nextPageSelector,
        templateParams
      );
      const href = nextPageElement?.getAttribute('href');
      if (href) {
        url = render(config.template, templateParams);
      } else {
        url = '';
      }
    }

    console.log('fetchChapter start', bookId, chapterId, fullContent);
    return fullContent;
  }
}
export interface ScraperConfig {
  name: string;
  charset: string;
  bookIdReg: string;
  endpoints: {
    baseUrl: string;
    bookInfo: {
      template: string;
      selectors: {
        title: string;
        author?: string;
        coverUrl?: string;
        description?: string;
      };
    };
    chapterList: {
      template: string;
      nextPageSelector: string;
      nextPageTemplate?: string;
      linkSelector: string;
      linkIdReg: string;
      titleSelector: string;
      pageNumStartIndex: number;
    };
    chapterContent: {
      template: string;
      nextPageSelector: string;
      chapterContentSelector: string;
      pageNumStartIndex: number;
    };
  };
}
