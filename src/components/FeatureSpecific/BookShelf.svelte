<script lang="ts">
	import type { IBook } from '../../db/types';
	import Book from './Book.svelte';

	export let books: IBook[];
</script>

<div class="bookshelf">
	{#each books as book}
		<Book {book} />
	{/each}
</div>

<style>
	.bookshelf {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
	}
</style>
