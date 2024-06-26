/* eslint-disable @typescript-eslint/no-explicit-any */
type PlatformType = 'browser' | 'quickApp' | 'wxMini' | 'alipayMini' | 'alitbMini' | 'swan';
type ReaderType = 'page' | 'line';

export interface ReaderLayoutOptions {
  paddingH: number;
  paddingV: number;
  platform: PlatformType;
  id: string;
  splitCode: string;
  fast: boolean;
  type: ReaderType;
  width: number;
  height: number;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  pGap: number;
  titleSize: number;
  titleHeight: number;
  titleWeight: number | string;
  titleGap: number;
}

export interface ILayoutLine {
  isTitle: boolean;
  center: boolean;
  pFirst: boolean;
  pIndex: number;
  lineIndex: number;
  textIndex: number; // 文字在段落未分行的固定位置
  text: string; // 行文字内容
  titleLast: boolean;
}

const baseChar = '阅'; // Standard Chinese character
let lineH: { [key: string]: number } = {};
export const defaultOptions: ReaderLayoutOptions = {
  paddingH: 20,
  paddingV: 20,
  platform: 'browser', // 平台
  id: '', // canvas 对象
  splitCode: '\r\n', // 段落分割符
  fast: false, // 是否计算加速
  width: 327, // 容器宽度
  height: 511, // 容器高度
  fontSize: 20, // 段落字体大小
  lineHeight: 1.8, // 段落文字行高
  pGap: 16, // 段落间距
  titleSize: 28, // 标题字体大小
  titleHeight: 1.8, // 标题文字行高
  titleWeight: 600, // 标题文字字重
  titleGap: 24, // 标题距离段落的间距,
  type: 'page',
  fontFamily: ''
};
let cacheData = {
  cWidth: 0,
  cHeight: 0,
  cfontSize: 0,
  maxText: 0,
  maxLine: 0
};

const getStyle = (attr: string): string => {
  const node = document.getElementById('font-container')!;
  return window.getComputedStyle
    ? window.getComputedStyle(node)[attr as any]
    : (node as any).currentStyle[attr];
};

const trimAll = (str: string): string => {
  return str ? String(str).replace(/\s+/gim, '') : '';
};
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
class Reader {
  options: ReaderLayoutOptions;
  constructor() {
    this.options = defaultOptions;
  }
  updateOptions(value: ReaderLayoutOptions) {
    if (!value.width || value.width <= 0) {
      throw new Error('Invalid container width, must be greater than 0');
    }
    if (value.type === 'page' && (!value.height || value.height <= 0)) {
      throw new Error('Invalid container height, must be greater than 0 for page type');
    }
    if (!value.fontSize || value.fontSize <= 0) {
      throw new Error('Invalid font size, must be greater than 0');
    }
    if (!value.titleSize || value.titleSize <= 0) {
      throw new Error('Invalid title font size, must be greater than 0 when title is provided');
    }
    this.options = value;
    const rootFamily = getStyle('font-family');
    if (!this.options.fontFamily && rootFamily) {
      this.options.fontFamily = rootFamily;
    }
  }
  exec(content: string, title?: string): ILayoutLine[][] {
    if (!content) {
      throw new Error('No content provided');
    }
    lineH = {};

    const { cWidth, cHeight, cfontSize } = cacheData;
    if (
      cWidth !== this.options.width - this.options.paddingH * 2 ||
      cHeight !== this.options.height - this.options.paddingV * 2 ||
      cfontSize !== this.options.fontSize
    ) {
      cacheData = {
        cWidth: this.options.width - this.options.paddingH * 2,
        cHeight: this.options.height - this.options.paddingV * 2,
        cfontSize: this.options.fontSize,
        maxText: 0,
        maxLine: 0
      };
    }

    const lines = this.splitContent2lines(content, title);

    return this.joinLine2Pages(lines);
  }

  private splitContent2lines(content: string, title?: string): ILayoutLine[] {
    const { splitCode, fontSize } = this.options;
    const { cWidth } = cacheData;
    let hasTitle = false;
    const reg = `[${splitCode}]+`;
    const pList = content
      .split(new RegExp(reg, 'gim'))
      .map((v, i) => {
        if (i === 0 && v === title) {
          hasTitle = true;
          return v;
        }
        return trimAll(v);
      })
      .filter((v) => v);

    if (!hasTitle && title) {
      pList.unshift(title);
    }

    if (title && trimAll(pList[1]) === trimAll(title)) {
      pList.splice(1, 1);
    }

    if (!cacheData.maxText) {
      const baseLen = Math.floor(cWidth / fontSize);
      let char = '';
      for (let i = 0; i < baseLen; i++) {
        char += baseChar;
      }
      const maxText = this.getText({ fontSize: fontSize } as any, char, true);
      cacheData.maxText = maxText.length;
    }

    let result: ILayoutLine[] = [];
    pList.forEach((pText, index) => {
      result = result.concat(this.p2line({ pText, index, maxLen: cacheData.maxText, title }));
    });

    return result;
  }

  private p2line({
    pText,
    index,
    title,
    maxLen
  }: {
    pText: string;
    index: number;
    maxLen: number;
    title?: string;
  }): ILayoutLine[] {
    const { fast, fontSize, titleSize, titleWeight } = this.options;
    const isTitle = pText === title;
    let p = pText;
    let tag = 0;
    const lines: ILayoutLine[] = [];

    while (p) {
      tag += 1;
      const pFirst = !isTitle && tag === 1;
      const sliceLen = pFirst ? maxLen - 2 : maxLen;
      let lineText = p.slice(0, sliceLen);
      if (pFirst) {
        lineText = baseChar + baseChar + lineText;
      }

      if (!isTitle && p.length <= sliceLen) {
        p = '';
      } else {
        if (!fast || isTitle) {
          lineText = this.getText(
            {
              p,
              sliceLen,
              fontSize: isTitle ? titleSize : fontSize,
              weight: isTitle ? titleWeight : ''
            },
            lineText
          );
        }
        p = p.slice(pFirst ? lineText.length - 2 : lineText.length);
      }

      if (pFirst) {
        lineText = lineText.slice(2);
      }

      let center = true;
      if (p) {
        const { transLine, transP, canCenter } = this.transDot(lineText, p);
        lineText = transLine;
        p = transP;
        center = canCenter;
      }

      if (p) {
        const { transLine, transP, canCenter } = this.transNumEn(lineText, p, center);
        lineText = transLine;
        p = transP;
        center = canCenter;
      }

      if (isTitle || !p) {
        center = false;
      }

      lines.push({
        isTitle, // 是否标题
        center, // 是否两端对齐
        pFirst: !isTitle && tag === 1, // 段落首行
        pIndex: index, // 段落索引
        lineIndex: tag, // 行索引
        textIndex: pText.indexOf(lineText), // 文字在段落未分行的固定位置
        text: lineText, // 行文字内容
        titleLast: !p && isTitle
      });
    }

    return lines;
  }

  private getText(params: any, text: string, base = false, fontW?: number): string {
    const { fontFamily } = this.options;
    const { cWidth } = cacheData;
    const { p, sliceLen, fontSize, weight } = params;
    const getWidth = (text: string) => this.getTextWidth(text, fontSize, fontFamily, weight);

    const textW = fontW ?? getWidth(text);
    if (textW === cWidth) {
      return text;
    }

    if (textW < cWidth) {
      const add = p && p.slice(sliceLen, sliceLen + 1);
      if (!base && !add) {
        return text;
      }
      const addText = base ? text + baseChar : text + add;
      const addTextW = getWidth(addText);
      if (addTextW === cWidth) {
        return addText;
      }
      if (addTextW > cWidth) {
        return text;
      }
      return this.getText({ ...params, sliceLen: sliceLen + 1 }, addText, base, addTextW);
    }

    const cutText = text.slice(0, -1);
    if (!cutText) {
      return text;
    }
    const cutTextW = getWidth(cutText);
    if (cutTextW <= cWidth) {
      return cutText;
    }
    return this.getText(params, cutText, base, cutTextW);
  }

  private getTextWidth(text: string, fontSize: number, fontFamily: string, weight: string): number {
    if (!canvas) {
      canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }
    ctx.font = `${weight ? weight : 'normal'} ${fontSize}px ${fontFamily}`;
    const { width } = ctx.measureText(text);
    return width;
  }

  private joinLine2Pages(lines: ILayoutLine[]): ILayoutLine[][] {
    const { cHeight } = cacheData;
    if (!cacheData.maxLine) {
      let maxLine = 1;
      if (lines.length >= 2) {
        const baseLineH = this.getLineHeight(lines[1], 0, 'base');
        maxLine = Math.floor(cHeight / baseLineH);
      }
      cacheData.maxLine = maxLine;
    }

    let pageLines = lines.slice(0);
    const pages: ILayoutLine[][] = [];
    while (pageLines.length > 0) {
      const page = this.getPage(pageLines, cacheData.maxLine);
      pages.push(page);
      pageLines = pageLines.slice(page.length);
    }

    return pages;
  }

  private getPage(lines: ILayoutLine[], maxLine: number, pageHeight?: number): ILayoutLine[] {
    const { titleGap } = this.options;
    const { cHeight } = cacheData;
    const page = lines.slice(0, maxLine);
    const pageH = pageHeight ?? this.getPageHeight(page);
    let contHeight = cHeight;
    if (lines && lines[0] && lines[0].isTitle) {
      contHeight = cHeight - titleGap;
    }

    if (pageH === contHeight) {
      return page;
    }
    if (pageH < contHeight) {
      const add = maxLine + 1;
      const addLine = lines.slice(maxLine, add);
      if (addLine.length <= 0) {
        return page;
      }
      const addPage = lines.slice(0, add);
      const addPageH = this.getPageHeight(addPage);
      if (addPageH === contHeight) {
        return addPage;
      }
      if (addPageH > contHeight) {
        this.freedLineH(addLine[0]);
        return page;
      }
      return this.getPage(lines, add, addPageH);
    }

    const cut = maxLine - 1;
    if (cut <= 0) {
      return page;
    }
    const cutPage = lines.slice(0, cut);
    const cutPageH = this.getPageHeight(cutPage);
    if (cutPageH <= contHeight) {
      this.freedLineH(lines.slice(cut, maxLine)[0]);
      return cutPage;
    }
    return this.getPage(lines, cut, cutPageH);
  }

  private freedLineH(line: ILayoutLine): void {
    lineH[`${line.pIndex}_${line.lineIndex}`] = 0;
  }

  private getLineHeight(
    { pIndex, lineIndex, isTitle }: ILayoutLine,
    linesIndex: number,
    type: string
  ): number {
    const index = `${pIndex}_${lineIndex}`;
    let theLineH = lineH[index];
    if (theLineH) {
      return theLineH;
    }

    const { pGap, fontSize, lineHeight, titleSize, titleHeight } = this.options;
    const size = isTitle ? titleSize : fontSize;
    const height = isTitle ? titleHeight : lineHeight;

    if (type === 'base') {
      return fontSize * lineHeight;
    }

    let gap = 0;
    // 非标题&&首行-段落首行
    // linesIndex !== 0，横翻每页的第1行不需要 padding-top-页首行消除间距
    if (!isTitle && lineIndex === 1 && linesIndex !== 0) {
      gap = pGap;
    }
    theLineH = size * height + gap;
    lineH[index] = theLineH;
    return theLineH;
  }

  private getPageHeight(lines: ILayoutLine[]): number {
    let pageH = 0;
    lines.forEach((line, index) => {
      pageH += this.getLineHeight(line, index, '');
    });
    return pageH;
  }

  private transDot(
    line: string,
    p: string
  ): { transLine: string; transP: string; canCenter: boolean } {
    let transLine = line;
    let transP = p;
    const canCenter = true;

    if (this.isDot(p.slice(0, 1))) {
      transLine = line.slice(0, -1);
      transP = line.slice(-1) + p;

      const endDot = this.getEndDot(line);
      if (endDot && endDot.length > 0) {
        let len = endDot.length;
        if (len >= 3 || len >= line.length - 2) {
          return { transLine: line, transP: p, canCenter: true };
        }
        len = len + 1;
        transLine = line.slice(0, -len);
        transP = line.slice(-len) + p;
      }
    }

    return { transLine, transP, canCenter };
  }

  private transNumEn(
    line: string,
    p: string,
    center: boolean
  ): { transLine: string; transP: string; canCenter: boolean } {
    const pFirst = p.slice(0, 1);
    let transLen = 0;
    let transLine = line;
    let transP = p;
    let canCenter = center;

    if (/\d/gi.test(pFirst)) {
      const endNum = this.getEndNum(line);
      if (endNum && endNum.length > 0) {
        const len = endNum[0].length;
        if (len < line.length) {
          transLen = len;
        }
      }
    } else if (/[a-zA-Z]/gi.test(pFirst)) {
      const endEn = this.getEndEn(line);
      if (endEn && endEn.length > 0) {
        const len = endEn[0].length;
        if (len < line.length) {
          transLen = len;
        }
      }
    }
    if (transLen) {
      transLine = line.slice(0, -transLen);
      transP = line.slice(-transLen) + p;
      canCenter = false;
    }

    return { transLine, transP, canCenter };
  }

  private isDot(code: string): boolean {
    if (!code) {
      return false;
    }
    const dots = [
      'ff0c',
      '3002',
      'ff1a',
      'ff1b',
      'ff01',
      'ff1f',
      '3001',
      'ff09',
      '300b',
      '300d',
      '3011',
      '2c',
      '2e',
      '3a',
      '3b',
      '21',
      '3f',
      '5e',
      '29',
      '3e',
      '7d',
      '5d',
      '2026',
      '7e',
      '25',
      'b7',
      '2019',
      '201d',
      '60',
      '2d',
      '2014',
      '5f',
      '7c',
      '5c',
      '2f'
    ];
    const charCode = code.charCodeAt(0).toString(16);
    return dots.includes(charCode);
  }

  private getEndDot(str: string): string[] | null {
    return str.match(
      /[\uff0c|\u3002|\uff1a|\uff1b|\uff01|\uff1f|\u3001|\uff09|\u300b|\u300d|\u3011|\u002c|\u002e|\u003a|\u003b|\u0021|\u003f|\u005e|\u0029|\u003e|\u007d|\u005d|\u2026|\u007e|\u0025|\u00b7|\u2019|\u201d|\u0060|\u002d|\u2014|\u005f|\u007c|\u005c|\u002f\uff08|\u300a|\u300c|\u3010|\u0028|\u003c|\u007b|\u005b|\u2018|\u201c|\u0040|\u0023|\uffe5|\u0024|\u0026]+$/gi
    );
  }

  private getEndNum(str: string): string[] | null {
    return str.match(/[0-9]+$/gi);
  }

  private getEndEn(str: string): string[] | null {
    return str.match(/[a-zA-Z]+$/gi);
  }
}

export default new Reader();
