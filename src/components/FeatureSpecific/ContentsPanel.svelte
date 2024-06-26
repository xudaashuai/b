<script lang="ts">
import { createEventDispatcher, getContext } from 'svelte';
import type { Writable } from 'svelte/store';
import type { IChapter } from '../../db/types';

export let currentChapterNumber: number;
const dispatch = createEventDispatcher<{
  gotoChapter: number;
}>();
const chaptersStore = getContext<Writable<IChapter[]>>('chapters');
</script>

<div class="contents">
  <div class="scroll-container">
    {#each $chaptersStore as chapter, i}
      <div
        class="contents-item"
        class:contents-item-active={i === currentChapterNumber}
        on:click={() => {
          dispatch('gotoChapter', i);
        }}
        id={`content-${chapter.chapterNumber}`}
      >
        {chapter.title}
      </div>
    {/each}
  </div>
</div>

<style>
.contents {
  width: 100%;
  background-color: var(--bg-color);
  border-radius: 24px 24px 0 0;
  padding: 24px;
  overflow: hidden;
}

.scroll-container {
  overflow-y: auto;
  max-height: 60vh;
}

.contents-item {
  padding: 6px;
}
.contents-item-active {
  color: crimson;
}
</style>
