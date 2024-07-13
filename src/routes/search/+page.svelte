<script lang="ts">
import Icon from '../../components/UI/Icon.svelte';
import { updateBook } from '../../db/BookStore';
import { BiquegeScraper, XingqiScraper } from '../../service/dataStrategy';

let value = '';
let scraperType = 'xingqi';
$: scraper = scraperType === 'xingqi' ? XingqiScraper : BiquegeScraper;
async function importRemoteBook(url: string) {
  const book = await scraper.fetchBook(url);
  await updateBook(book);
  const contents = await scraper.fetchChapterList(book.id);
  for (const item of contents) {
    await addChapter(item);
  }
  await updateBook({
    ...book,
    totalChapters: contents.length
  });
  alert(`import finished, ttc ${contents.length}`);
}
</script>

<div class="container">
  <div class="search-bar">
    <input bind:value />
    <button class="button"><Icon name="search" fill="#fff" /></button>
  </div>
</div>

<style>
.search-bar {
  display: flex;
}
.button {
  padding: 0.5rem 1rem;
  font-size: 1.5rem;
  background: green;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
