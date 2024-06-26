<script lang="ts">
	import BookShelf from '../components/FeatureSpecific/BookShelf.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fetchBooks } from '../service/BookService';
	import type { IBook } from '../db/types';
	let books: IBook[] = [];
	onMount(async () => {
		books = await fetchBooks();
	});
</script>

<div class="container">
	<header class="header">
		<button class="add-button" on:click={() => goto('/book/add')}>+</button>
	</header>
	<BookShelf {books} />
</div>

<style>
	.container {
		position: relative;
		padding: 1rem;
	}
	.header {
		display: flex;
		justify-content: flex-end;
	}
	.add-button {
		padding: 0.5rem 1rem;
		font-size: 1.5rem;
		background: green;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
</style>
