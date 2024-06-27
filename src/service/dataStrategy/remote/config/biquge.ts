import type { ScraperConfig } from '..';

const config: ScraperConfig = {
  name: '笔趣阁',
  endpoints: {
    baseUrl: 'https://m.xbiqugew.com/',
    bookInfo: {
      // https://m.xbiqugew.com/book/45525/
      template: '<%- baseUrl %>book/<%- bookId %>/',
      selectors: {
        title: 'h1',
        author: 'a[href*="searchtype=author"]'
      }
    },
    chapterList: {
      template: '<%- baseUrl %>chapters_<%- bookId %>/<% if(pageNum > 1) { %><%- pageNum %><% } %>',
      nextPageSelector: 'a[href$="<%- bookId %>/<%- pageNum %>"]',
      linkSelector: 'div.lb_mulu > ul  a[href*="<%- bookId %>"]',
      titleSelector: 'div.lb_mulu > ul  a[href*="<%- bookId %>"]',
      linkIdReg: '<%- baseUrl %>book/\\d+/(\\d+).html',
      pageNumStartIndex: 1
    },
    chapterContent: {
      //https://m.xbiqugew.com/book/45525/40178727.html
      template:
        '<%- baseUrl %>book/<%- bookId %>/<%- chapterId %><% if(pageNum > 1) { %>_<%- pageNum %><% } %>.html',
      nextPageSelector: 'a[href*="<%- chapterId %>_<%- pageNum %>"]',
      chapterContentSelector: '.nr_nr',
      pageNumStartIndex: 1
    }
  }
};

export default config;
