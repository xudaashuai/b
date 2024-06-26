import { BookSourceType, type IBook, type IChapter, type ISimpleChapter } from '../../db/types';
import type { DataStrategy } from '.';

async function fetchChapterContent(chapter: ISimpleChapter): Promise<IChapter> {
  let pageNumber = 1;
  let content = '';
  let title = '';
  let nextPageLink: string | undefined = '';
  do {
    const pageLink = `https://api.xudashuai.online/?url=https://m.xbiqugew.com/book/${chapter.bookId}/${chapter.id}${pageNumber > 1 ? `_${pageNumber}` : ''}.html`;
    const res = extractContent((await (await fetch(pageLink)).json()).html);
    content += res.mainContent;
    if (!title) {
      title = res.title;
    }
    nextPageLink = res.nextPageLink;
    pageNumber++;
  } while (nextPageLink);

  return {
    ...chapter,
    content
  };
}

function extractContent(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function getTextWithNewlines(element: Element): string {
    let textContent = '';
    element.childNodes.forEach((node, index) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent?.includes('... -->>') && index === element.childNodes.length - 3) {
          textContent += node.textContent.replace('... -->>', '');
          return;
        }
        textContent += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE && (node as Element).className !== 'red') {
        const childElement = node as Element;
        if (['P', 'DIV', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(childElement.tagName)) {
          textContent += '\n'; // Add a newline before the block element content
          textContent += getTextWithNewlines(childElement);
          if (!['BR'].includes(childElement.tagName)) {
            textContent += '\n'; // Add a newline after block elements except <br>
          }
        } else {
          textContent += getTextWithNewlines(childElement);
        }
      }
    });
    return textContent;
  }

  // Find main content and preserve newlines
  const mainContentNode = doc.querySelector('.nr_nr');
  // Find next page link
  const nextPageLink = Array.from(doc.links).find(
    (link) =>
      link.textContent?.toLowerCase().includes('next') ||
      link.textContent?.toLowerCase().includes('下一页')
  )?.href;
  const mainContent = mainContentNode ? getTextWithNewlines(mainContentNode).trim() : undefined;

  // Find title (assuming it might not need newline preservation)
  const titleElement = doc.querySelector('h1, h2, h3, h4, h5, h6');
  const title = titleElement?.textContent?.trim() ?? 'Title not found';

  return { title, mainContent, nextPageLink };
}

async function fetchChapters(bookId: string): Promise<IChapter[]> {
  // 创建 DOMParser 实例
  const parser = new DOMParser();
  // 将 HTML 字符串解析为 Document 对象
  let doc: Document | null = null;
  // 容器来存储章节信息
  const chapters: IChapter[] = [];
  let pageNumber = 1;
  let number = 0;

  do {
    const html = (
      await (
        await fetch(
          `https://api.xudashuai.online/?url=https://m.xbiqugew.com/chapters_${bookId}/${pageNumber >= 1 ? pageNumber : ''}`
        )
      ).json()
    ).html;
    doc = parser.parseFromString(html, 'text/html');
    // 获取所有链接
    const links = doc.querySelectorAll('a');
    links.forEach((link) => {
      const text = link.innerText || '';
      const href = link.href.replace(/.*\/(\d+)\.html/g, '$1');

      // 检查链接是否为章节链接
      if (link.href.match(RegExp(`https://m.xbiqugew.com/book/${bookId}/(\\d+).html`))) {
        chapters.push({
          title: text.trim(),
          id: href,
          chapterNumber: ++number,
          bookId,
          content: ''
        });
      }
    });
    if ([...links].find((item) => item.innerText === '下一页')) {
      pageNumber += 1;
    } else {
      break;
    }
    // eslint-disable-next-line no-constant-condition
  } while (true);

  return chapters;
}
function extractNovelInfo(html: string): {
  title: string;
  description: string;
  author: string;
  id: string;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 提取标题
  const titleElement = doc.querySelector('h1');
  const title = titleElement?.textContent?.trim() ?? '';

  // 提取简介
  const introElement = doc.querySelector('.intro');
  const description = introElement?.textContent?.trim() ?? '';

  // 提取作者
  const authorElement = doc.querySelector('a[href*="searchtype=author"]');
  const author = authorElement?.textContent?.trim() ?? '';

  // 提取ID
  // 假设ID是URL中的数字部分，例如：https://m.xbiqugew.com/book/45525/
  const idMatch = html.match(/book\/(\d+)\//);
  const id = idMatch ? idMatch[1] : '';

  return {
    title,
    description,
    author,
    id
  };
}
async function fetchBook(bookId: string): Promise<IBook> {
  const pageLink = `https://api.xudashuai.online/?url=https://m.xbiqugew.com/book/${bookId}/`;
  const res = extractNovelInfo((await (await fetch(pageLink)).json()).html);

  return {
    id: bookId,
    title: res.title,
    totalChapters: -1,
    author: res.author,
    source: BookSourceType.remote
  };
}

const remoteDataFecther: DataStrategy = {
  fetchChapter: fetchChapterContent,
  fetchChapterContents: fetchChapters,
  fetchBook
};

export default remoteDataFecther;
