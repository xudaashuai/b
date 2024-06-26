<script lang="ts">
import ContentsProgressPanel from './ContentsProgressPanel.svelte';

import ContentsPanel from './ContentsPanel.svelte';

import { createEventDispatcher, setContext, tick } from 'svelte';
import { goto } from '$app/navigation';

import { settingsStore, nightModeStore, styleSettingsStore } from '../../store/settings';
import SettingsPanel from './SettingsPanel.svelte';
import Icon from '../UI/Icon.svelte';
import { writable } from 'svelte/store';

const dispatch = createEventDispatcher<{
  nextPage: null;
  previousPage: null;
  nextChapter: null;
  previousChapter: null;
  gotoChapter: number;
  move: number;
  end: number;
}>();

export let totalChapterNumber: number;
export let currentChapterNumber: number;
let showMenu: boolean = false;
let modalType: string = '';

function handlePageClick(event: MouseEvent) {
  const { clientX, clientY } = event;
  const { innerWidth, innerHeight } = window;

  const xPercentage = (clientX / innerWidth) * 100;
  const yPercentage = (clientY / innerHeight) * 100;

  if (Math.abs(xPercentage - 50) + Math.abs(yPercentage - 50) < 30) {
    showMenu = true;
  } else if (100 - xPercentage < $styleSettingsStore.nextPageArea) {
    dispatch('nextPage');
  } else {
    dispatch('previousPage');
  }
}

let startP: Touch | null = null;
let currentP: Touch | null = null;
function onTouchStart(e: TouchEvent) {
  startP = e.changedTouches[0];
}
function onTouchMove(e: TouchEvent) {
  currentP = e.changedTouches[0];
  dispatch(
    'move',
    ((startP && currentP ? currentP.pageX - startP.pageX : 0) / window.innerWidth) * 100
  );
}
function onTouchEnd(e: TouchEvent) {
  currentP = e.changedTouches[0];
  dispatch(
    'end',
    ((startP && currentP ? currentP.pageX - startP.pageX : 0) / window.innerWidth) * 100
  );
}

function closeMenu() {
  showMenu = false;
  modalType = '';
}

function onBackButtonClick() {
  goto('/');
}
</script>

<div
  class="reader-control"
  on:click|self={handlePageClick}
  on:touchstart|self={onTouchStart}
  on:touchmove|self={onTouchMove}
  on:touchend|self={onTouchEnd}
  style={`
    --progress: ${(currentChapterNumber * 100) / totalChapterNumber}%
  `}
>
  {#if showMenu}
    <div class="container">
      {#if !modalType}
        <div class="navbar">
          <div class="button" on:click={onBackButtonClick} on:touchstart={onTouchStart}>
            <Icon class="icon" name="back" />
          </div>
        </div>
      {/if}
      <div class="modal" class:modal-shadow={modalType} on:click|self={closeMenu}>
        {#if modalType === 'contents'}
          <ContentsPanel
            on:gotoChapter={(e) => {
              dispatch('gotoChapter', e.detail);
              closeMenu();
            }}
            {currentChapterNumber}
          />
        {:else if modalType === 'setting'}
          <SettingsPanel />
        {:else}
          <ContentsProgressPanel
            --progress={`${(currentChapterNumber * 100) / totalChapterNumber}%`}
            on:nextChapter={() => dispatch('nextChapter')}
            on:previousChapter={() => dispatch('previousChapter')}
          />
        {/if}
      </div>
      <div class="bottom-bar">
        <div
          class="bottom-bar-item"
          on:click={async () => {
            modalType = 'contents';
            await tick();
            document.getElementById(`content-${currentChapterNumber}`)?.scrollIntoView();
          }}
        >
          <Icon class="icon" name="contents" />
          <div>目录</div>
        </div>
        <div
          class="bottom-bar-item"
          on:click={() => {
            if (!$nightModeStore) {
              styleSettingsStore.update((val) => ({
                ...val,
                color: '#ffffff',
                bgColor: '#000000'
              }));
            } else {
              styleSettingsStore.update((val) => ({
                ...val,
                color: '#000000',
                bgColor: '#ffffff'
              }));
            }
          }}
        >
          <Icon name="nightmode" class={`icon ${$nightModeStore && 'nightmode'}`} />
          <div>夜间</div>
        </div>
        <div
          class="bottom-bar-item"
          on:click={async () => {
            modalType = 'setting';
          }}
        >
          <Icon class="icon" name="setting" />
          <div>设置</div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
.reader-control {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 8;
  background-color: transparent;
}

.container {
  position: absolute;
  bottom: 0px;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
}
.modal {
  flex: 1;
  display: flex;
  align-items: end;
}

.modal-shadow {
  background-color: rgba(122, 122, 122, 0.8);
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  background-color: var(--bg-color);
  padding-top: 12px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--border-color);
}

.bottom-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.navbar {
  display: flex;
  background-color: var(--bg-color);
  padding: 8px 20px;
  border-bottom: 1px solid var(--border-color);
}
.button {
  padding: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
