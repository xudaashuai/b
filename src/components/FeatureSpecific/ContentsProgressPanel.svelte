<script lang="ts">
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher<{
  nextChapter: null;
  previousChapter: null;
}>();
</script>

<div class="contents-progress">
  <div class="chapter-btn" on:click={() => dispatch('previousChapter')}>上一章</div>
  <div class="progress">
    <div class="progress-inner"></div>
  </div>
  <div class="chapter-btn" on:click={() => dispatch('nextChapter')}>下一章</div>
</div>

<style>
.contents-progress {
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
  padding: 12px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress {
  background-color: aliceblue;
  height: 16px;
  flex: 1;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}
.progress-inner {
  position: absolute;
  width: var(--progress);
  padding: 0 8px;
  height: 16px;
  border-radius: 8px;
  background-color: darkslategrey;
}
</style>
