<script lang="ts">
import { goto } from '$app/navigation';
import { addBook, updateBook } from '../../../db/BookStore';
import { addChapter } from '../../../db/ChapterStore';
import { BiquegeScraper, getScraper, XingqiScraper } from '../../../service/dataStrategy';
import { ConfigurableScraper } from '../../../service/dataStrategy/remote';
import config from '../../../service/dataStrategy/remote/config/biquge';
import { processAndStoreFile } from '../../../service/FileProcessingService';
let url = '45525';
let scraperType = 'xingqi';
function handleFileChange(event: any) {
  const file = event?.target.files[0];
  console.log(file);
  if (file) {
    const reader = new FileReader();
    reader.onload = async function (e: any) {
      const content = e?.target.result;
      await processAndStoreFile(content, file.name);
      alert('Import finished');
      goto('/');
    };
    reader.readAsText(file, 'gb2312');
  } else {
    alert('No file selected');
  }
}

async function importRemoteBook() {
  const scraper = scraperType === 'xingqi' ? XingqiScraper : BiquegeScraper;
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

<section>
  <h1>Read Local Novel File</h1>
  <input type="file" id="fileInput" on:change={handleFileChange} />
  <div id="fileContent" style="white-space: pre-wrap; margin-top: 20px;"></div>
  <select bind:value={scraperType}>
    <option value="xingqi">xingqi</option>
    <option value="biquge">biquge</option>
  </select>
  <input type="text" bind:value={url} />
  <button on:click={importRemoteBook}>导入远程书</button>
</section>

<style>
section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 0.6;
}

h1 {
  width: 100%;
}
</style>
