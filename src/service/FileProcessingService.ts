import { BookSourceType, type IBook, type IChapter } from '../db/types';
import { addBook } from '../db/BookStore';
import { addChapter } from '../db/ChapterStore';

export const splitIntoChapters = (content: string): IChapter[] => {
	const chapters: IChapter[] = [];
	let chapterStartIndex = 0;
	let chapterNumber = 1;
	const CHAPTER_PATTERN = /第[一二三四五六七八九十百千万亿零]+章[\n]*/;
	const chapterMatches = [...content.matchAll(new RegExp(CHAPTER_PATTERN, 'gim'))];

	chapterMatches.forEach((match, index) => {
		if (index === 0) {
			chapterStartIndex = match.index!;
			return;
		}
		const chapterEndIndex = match.index!;
		const chapterContent = content.substring(chapterStartIndex, chapterEndIndex).trim();
		chapters.push({
			id: '',
			bookId: '', // 将在具体应用中设置
			chapterNumber,
			title: extractTitle(content, chapterStartIndex), // 提取每个章节的标题
			content: chapterContent,
			length: chapterContent.length
		});
		chapterStartIndex = chapterEndIndex;
		chapterNumber++;
	});

	// 处理最后一个章节
	if (chapterStartIndex < content.length) {
		chapters.push({
			id: generateUniqueId(),
			bookId: '', // 将在具体应用中设置
			chapterNumber,
			title: extractTitle(content, chapterStartIndex), // 为最后一个章节正确提取标题
			content: content.substring(chapterStartIndex).trim(),
			length: content.length - chapterStartIndex
		});
	}

	return chapters;
};

// 从文本中提取整行作为章节标题
const extractTitle = (content: string, index: number): string => {
	const lineStart = content.lastIndexOf('\n', index - 1) + 1;
	const lineEnd = content.indexOf('\n', index);
	return content.substring(lineStart, lineEnd !== -1 ? lineEnd : content.length).trim();
};

const generateUniqueId = (): string => {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const processAndStoreFile = async (fileContent: string, fileName: string): Promise<void> => {
	const chapters = splitIntoChapters(fileContent);
	const book: IBook = {
		id: generateUniqueId(),
		title: fileName, // 假设文件名作为书名
		author: 'Unknown',
		coverImageUrl: '',
		description: '',
		totalChapters: chapters.length,
		lastRead: '',
		source: BookSourceType.local
	};

	// 存储书籍信息
	await addBook(book);

	// 存储每个章节信息
	for (const chapter of chapters) {
		const chapterWithBookId = {
			...chapter,
			bookId: book.id,
			id: `${book.id}-${chapter.chapterNumber}`
		};
		await addChapter(chapterWithBookId);
	}
};
