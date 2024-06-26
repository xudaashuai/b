<script lang="ts">
import { goto } from '$app/navigation';
import type { IBook } from '../../db/types';

export let book: IBook;
</script>

<div
  class="book"
  on:click={() => {
    goto(`/book/${book.id}`);
  }}
>
  <h3>{book.title}</h3>
  <p>{book.author}</p>
</div>

<style>
.book {
  border: 1px solid var(--color);
  padding: 10px;
  margin: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.book:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
