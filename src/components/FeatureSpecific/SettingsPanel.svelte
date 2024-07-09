<script lang="ts">
import { Fonts, nightModeStore, settingsStore, styleSettingsStore } from '../../store/settings';
import ColorPicker from 'svelte-awesome-color-picker';

import RangeSelect from '../UI/RangeSelect.svelte';
import type { ReaderLayoutOptions } from '../../service/ReaderLayoutService';
const convert = { to: (val: number) => val / 100, back: (val: number) => val * 100 };

type FilterNumberKeys<T> = {
  [K in keyof T as T[K] extends number ? K : never]: T[K];
};

const settings: {
  title: string;
  min: number;
  max: number;
  field: keyof FilterNumberKeys<ReaderLayoutOptions>;
  convert?: { to: (val: number) => number; back: (val: number) => number };
}[] = [
  {
    title: '字体大小',
    min: 10,
    max: 40,
    field: 'fontSize'
  },
  {
    title: '行间距',
    min: 100,
    max: 300,
    field: 'lineHeight',
    convert
  },
  {
    title: '段间距',
    min: 10,
    max: 50,
    field: 'pGap'
  },
  {
    title: '标题大小',
    min: 20,
    max: 60,
    field: 'titleSize'
  },
  {
    title: '标题行高',
    min: 100,
    max: 300,
    field: 'titleHeight',
    convert
  },
  {
    title: '页面间距H',
    min: 0,
    max: 60,
    field: 'paddingH'
  },
  {
    title: '页面间距V',
    min: 0,
    max: 60,
    field: 'paddingV'
  }
];
</script>

<div class="container">
  {#each settings as item}
    <div class="item">
      <div>{item.title}</div>
      <RangeSelect
        min={item.min}
        max={item.max}
        value={item.convert
          ? item.convert?.back($settingsStore[item.field])
          : $settingsStore[item.field]}
        on:change={(v) =>
          settingsStore.update((pre) => ({
            ...pre,
            [item.field]: item.convert ? item.convert.to(v.detail) : v.detail
          }))}
      />
      <div>{$settingsStore[item.field]}</div>
    </div>
  {/each}
  <div class="item">
    <div>翻页区域</div>
    <RangeSelect
      min={0}
      max={100}
      value={$styleSettingsStore.nextPageArea}
      on:change={(e) => ($styleSettingsStore.nextPageArea = e.detail)}
    />
    <div>{$styleSettingsStore.nextPageArea}</div>
  </div>
  <div class="item">
    <div>字体</div>
    <select bind:value={$settingsStore.fontFamily}>
      {#each Object.entries(Fonts) as font}
        <option value={font[1]}> {font[1]} </option>
      {/each}
    </select>
  </div>
  <div class="item" class:dark={$nightModeStore}>
    <div>字体颜色</div>
    <ColorPicker
      isAlpha={false}
      bind:hex={$styleSettingsStore.color}
      isDialog={false}
      isDark={$nightModeStore}
      textInputModes={['hex']}
      isTextInput={false}
    />
  </div>
  <div class="item" class:dark={$nightModeStore}>
    <div>背景颜色</div>
    <ColorPicker
      bind:hex={$styleSettingsStore.bgColor}
      isAlpha={false}
      isDialog={false}
      textInputModes={['hex']}
      isDark={$nightModeStore}
      isTextInput={false}
    />
  </div>
</div>

<style>
.container {
  flex-grow: 1;
  background-color: var(--bg-color);
  border-radius: 24px 24px 0 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border-color);
  max-height: 60vh;
  overflow-y: auto;
}

.item {
  padding: 3px;
  display: flex;
  align-items: center;
  gap: 4px;
  & > :first-child {
    flex-basis: 80px;
  }
  & > last-child {
    flex-basis: 30px;
    text-align: end;
  }
  & > :nth-child(2) {
    flex: 1;
    text-align: start;
  }
}
.dark {
  --cp-bg-color: #333;
  --cp-border-color: white;
  --cp-text-color: white;
  --cp-input-color: #555;
  --cp-button-hover-color: #777;
}
</style>
