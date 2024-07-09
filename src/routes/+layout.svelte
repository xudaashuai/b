<script lang="ts">
import { settingsStore, styleSettingsStore } from '../store/settings';
</script>

<div
  id="font-container"
  style={`
    --title-font-size:${$settingsStore.titleSize}px;
    --title-font-height:${$settingsStore.titleHeight ?? 1};
    --title-font-weight:${$settingsStore.titleWeight};
    --font-size:${$settingsStore.fontSize}px;
    --font-height:${$settingsStore.lineHeight ?? 1};
    --p-gap:${$settingsStore.pGap}px;
    --title-gap:${$settingsStore.titleGap}px;
    --color:${$styleSettingsStore.color};
    --border-color:${$styleSettingsStore.color}33;
    --bg-color:${$styleSettingsStore.bgColor};
    --padding-h:${$settingsStore.paddingH}px;
    --padding-v:${$settingsStore.paddingV}px;
    --title-weight:${$settingsStore.titleWeight};
    color:${$styleSettingsStore.color};
    background-color:${$styleSettingsStore.bgColor};
    --font:${$settingsStore.fontFamily};
    height: 100vh;
  `}
  class="container"
>
  <slot />
</div>

<style>
@font-face {
  font-family: Noto Sans;
  src: url('/NotoSansSC-6.ttf');
}

.container {
  font-family: var(--font);
  overflow-y: hidden;
}
</style>
