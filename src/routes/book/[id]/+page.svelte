<script lang="ts">
import ReaderPage from '../../../components/FeatureSpecific/ReaderPage.svelte';

import { onDestroy, onMount, setContext } from 'svelte';
import { fetchChapter, fetchChapters } from '../../../service/ChapterService';
import { type IBook, type IChapter } from '../../../db/types';
import type { PageData } from './$types.js';
import ReaderLayoutService, {
  type ILayoutLine,
  type ReaderLayoutOptions
} from '../../../service/ReaderLayoutService';
import ReaderControl from '../../../components/FeatureSpecific/ReaderControl.svelte';
import { fetchBookById } from '../../../service/BookService';
import { settingsStore } from '../../../store/settings';
import { writable } from 'svelte/store';
import debounce from 'lodash/debounce';

const bookStore = writable<IBook>();
const chaptersStore = writable<IChapter[]>([]);

setContext('book', bookStore);
setContext('chapters', chaptersStore);

export let data: PageData;

let lastRead = writable(
  localStorage
    .getItem(`${data.bookId}-lastReaded`)
    ?.split('-')
    ?.map((a) => Number(a)) ?? [0, 0]
);
$: currentPage = $lastRead[1];
$: currentChapterNumber = $lastRead[0];

function setLastRead(c: number, p: number) {
  $lastRead = [c, p];
  updateDisplayPages();
}

let diffX = 0;
let allPages: ILayoutLine[][][] = [];
let displayPages: ILayoutLine[][] = [];
let showNextAnimation = false;
let showPreviousAnimation = false;
$: isOkToNextPage = (displayPages[2]?.length ?? 0) !== 0;
$: isOkToPreviousPage = (displayPages[0]?.length ?? 0) !== 0;

function startGoNextPage() {
  if (isOkToNextPage) {
    showNextAnimation = true;
  }
}

function startGoPreviousPage() {
  if (isOkToPreviousPage) {
    showPreviousAnimation = true;
  }
}

async function buildChapterPages(index: number): Promise<ILayoutLine[][]> {
  if (allPages[index] && allPages[index].length > 0) {
    return allPages[index];
  }
  if (!$chaptersStore[index]) {
    return [];
  }
  if (!$chaptersStore[index].content) {
    const chapter = await fetchChapter($chaptersStore[index], $bookStore.source);
    if (chapter) {
      $chaptersStore[index] = chapter;
    }
  }
  if ($chaptersStore[index].content) {
    const pages = ReaderLayoutService.exec(
      $chaptersStore[index].content,
      $chaptersStore[index].title
    );
    allPages[index] = pages;
    return pages;
  }
  return [];
}

async function updateDisplayPages() {
  let [pPages, cPages, nPages] = await Promise.all([
    buildChapterPages($lastRead[0] - 1),
    buildChapterPages($lastRead[0]),
    buildChapterPages($lastRead[0] + 1)
  ]);

  const pages = [...pPages, ...cPages, ...nPages];
  displayPages = [
    pages[$lastRead[1] + pPages.length - 1],
    pages[$lastRead[1] + pPages.length],
    pages[$lastRead[1] + pPages.length + 1]
  ];
  await Promise.all([buildChapterPages($lastRead[0] - 2), buildChapterPages($lastRead[0] + 2)]);
}

lastRead.subscribe((val) => {
  localStorage.setItem(`${data.bookId}-lastReaded`, val.join('-'));
});

onMount(async () => {
  await Promise.all([
    fetchBookById(data.bookId).then((v) => bookStore.set(v)),
    fetchChapters(data.bookId).then((v) => chaptersStore.set(v))
  ]);
  updateSettings();
  window?.addEventListener('resize', updateSettings);
});
onDestroy(() => {
  window?.removeEventListener('resize', updateSettings);
});
const handleSettingsUpdate = debounce((value: ReaderLayoutOptions) => {
  ReaderLayoutService.updateOptions(value);
  updateDisplayPages();
}, 100);

settingsStore.subscribe(handleSettingsUpdate);

function updateSettings() {
  const readerContainer = document.getElementById('reader');
  const rect = readerContainer?.getBoundingClientRect();
  settingsStore.update((value) => ({
    ...value,
    width: rect?.width!,
    height: rect?.height!
  }));
}

function nextPage() {
  if (currentPage < allPages[currentChapterNumber].length - 1) {
    setLastRead(currentChapterNumber, currentPage + 1);
  } else {
    setLastRead(currentChapterNumber + 1, 0);
  }
}

function previousPage() {
  if (currentPage > 0) {
    setLastRead(currentChapterNumber, currentPage - 1);
  } else if (currentChapterNumber > 0) {
    setLastRead(currentChapterNumber - 1, allPages[currentChapterNumber - 1].length - 1);
  }
}

function gotoChapter(num: number) {
  if (num >= 1 && num <= $chaptersStore.length) {
    setLastRead(num, 0);
  }
}
function previousChapter() {
  gotoChapter(currentChapterNumber - 1);
}

function nextChapter() {
  gotoChapter(currentChapterNumber + 1);
}
</script>

<div class="reader" id="reader">
  {#if displayPages[2]}
    <div class="page">
      <ReaderPage page={displayPages[2]} />
    </div>
  {/if}
  {#key displayPages[1]}
    <div
      class="page"
      class:nextAnimation={showNextAnimation}
      on:transitionend={() => {
        if (showNextAnimation) {
          nextPage();
          showNextAnimation = false;
        }
      }}
      style={diffX < 0 ? `transform: translate(${diffX}%)` : 'transition: all 0.26s ease-in-out;'}
    >
      {#if displayPages[1]}
        <ReaderPage page={displayPages[1]} />
      {:else}
        <p>Loading...</p>
      {/if}
    </div>
  {/key}
  {#if displayPages[0]}
    {#key displayPages[0]}
      <div
        class="page animation prev"
        class:previousAnimation={showPreviousAnimation}
        on:transitionend={() => {
          if (showPreviousAnimation) {
            previousPage();
            showPreviousAnimation = false;
          }
        }}
        style={diffX > 0
          ? `transform: translate(${diffX - 100}%)`
          : 'transition: all 0.26s ease-in-out;'}
      >
        <ReaderPage page={displayPages[0]} />
      </div>
    {/key}
  {/if}
  <ReaderControl
    on:move={(e) => {
      if ((e.detail > 0 && isOkToNextPage) || (e.detail < 0 && isOkToPreviousPage)) {
        diffX = e.detail;
      }
    }}
    on:end={(e) => {
      if (!showPreviousAnimation && !showNextAnimation) {
        if (e.detail < -15) {
          startGoNextPage();
        } else if (e.detail > 15) {
          startGoPreviousPage();
        }
        diffX = 0;
      }
    }}
    on:previousPage={() => {
      if (!showPreviousAnimation && !showNextAnimation) {
        startGoPreviousPage();
      }
    }}
    on:nextPage={() => {
      if (!showPreviousAnimation && !showNextAnimation) {
        startGoNextPage();
      }
    }}
    on:previousChapter={previousChapter}
    on:nextChapter={nextChapter}
    on:gotoChapter={(event) => gotoChapter(event.detail)}
    {currentChapterNumber}
    totalChapterNumber={$chaptersStore.length}
  />
</div>

<style>
.reader {
  position: relative;
  padding: var(--padding-v) var(--padding-h);
  text-align: justify;
  height: 100vh;
  overflow: hidden;
  color: var(--color);
  background-color: var(--bg-color);
  box-sizing: border-box;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: auto;
}
.page {
  color: var(--color);
  background-color: var(--bg-color);
  cursor: pointer;
  overflow: hidden;
  padding: var(--padding-v) var(--padding-h);
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: auto;
  transform: translateX(0%);
}
.prev {
  transform: translateX(-100%);
}
.nextAnimation {
  transition: all 0.26s ease-in-out;
  transform: translateX(-100%);
}
.previousAnimation {
  transition: all 0.26s ease-in-out;
  transform: translateX(0%);
}
</style>
