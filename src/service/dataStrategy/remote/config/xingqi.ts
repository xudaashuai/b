import type { ScraperConfig } from '..';

const config: ScraperConfig = {
  name: '新奇文学',
  charset: 'utf8',
  bookIdReg: '<%- baseUrl %>xs/(\\d+)/',
  endpoints: {
    baseUrl: 'https://www.xingqiwx.com/',
    bookInfo: {
      // https://www.xingqiwx.com/xs/1558/
      template: '<%- baseUrl %>xs/<%- bookId %>/',
      selectors: {
        title: 'h1',
        author: 'a[href*="zuojia"]'
      }
    },
    chapterList: {
      // https://www.xingqiwx.com/xs/1558/
      template: '<%- baseUrl %>xs/<%- bookId %>/',
      nextPageSelector: '#testnoexist',
      linkSelector: '#list > dl:nth-child(2) > dd  a[href*="<%- bookId %>"]',
      titleSelector: '#list > dl:nth-child(2) > dd  a[href*="<%- bookId %>"]',
      linkIdReg: 'xs/<%- bookId %>/(\\d+).html',
      pageNumStartIndex: 1
    },
    chapterContent: {
      //https://www.xingqiwx.com/xs/1558/424909.html
      template: '<%- baseUrl %>xs/<%- bookId %>/<%- chapterId %>.html',
      nextPageSelector: 'a[href*="<%- chapterId %>_<%- pageNum %>"]',
      chapterContentSelector: '#content',
      pageNumStartIndex: 1
    }
  }
};

export default config;
