export interface IBook {
  id: string; // 唯一标识符
  title: string; // 书名
  author: string; // 作者
  coverImageUrl?: string; // 封面图片URL
  description?: string; // 书籍描述
  totalChapters?: number; // 总章节数
  lastRead?: string; // 最后阅读时间的时间戳
  source: BookSourceType; // 书籍的数据来源
}

export enum BookSourceType {
  local = 'local',
  remote = 'remote',
  api = 'api'
}

export interface IChapter {
  id: string; // 唯一标识符
  bookId: string; // 关联的书籍ID
  chapterNumber: number; // 章节编号
  title: string; // 章节标题
  content: string; // 章节内容
  length?: number; // 章节内容长度
}

export type ISimpleChapter = Omit<IChapter, 'content'>;
