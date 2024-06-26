import { getBookById, getBooks } from '../db/BookStore';
import type { IBook } from '../db/types';

export async function fetchBooks(): Promise<IBook[]> {
	return await getBooks();
}

export async function fetchBookById(bookId: string): Promise<IBook> {
	return await getBookById(bookId);
}
